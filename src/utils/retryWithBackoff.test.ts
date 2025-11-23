import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  retryWithBackoff,
  createRetryingFetch,
  isOnline,
  waitForOnline,
  type RetryOptions
} from './retryWithBackoff'
import { NetworkError, ApiError } from '../types/errors'

describe('retryWithBackoff', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('retryWithBackoff', () => {
    it('should return result on first successful attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success')

      const result = await retryWithBackoff(fn)

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure and eventually succeed', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new NetworkError('Network error'))
        .mockRejectedValueOnce(new NetworkError('Network error'))
        .mockResolvedValueOnce('success')

      const promise = retryWithBackoff(fn)

      // Fast-forward through retry delays
      await vi.runAllTimersAsync()

      const result = await promise

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('should throw error after max attempts', async () => {
      const error = new NetworkError('Persistent error')
      const fn = vi.fn().mockRejectedValue(error)

      const promise = retryWithBackoff(fn, { maxAttempts: 3 })

      await vi.runAllTimersAsync()

      await expect(promise).rejects.toThrow('Persistent error')
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('should use exponential backoff', async () => {
      const fn = vi.fn().mockRejectedValue(new NetworkError('Error'))
      const onRetry = vi.fn()

      const promise = retryWithBackoff(fn, {
        maxAttempts: 3,
        initialDelay: 1000,
        backoffFactor: 2,
        onRetry
      })

      await vi.runAllTimersAsync()

      await expect(promise).rejects.toThrow()

      // Check that delays are increasing (with jitter, so we check ranges)
      expect(onRetry).toHaveBeenCalledTimes(2)

      // First retry should be around 1000ms (with jitter)
      expect(onRetry.mock.calls[0][2]).toBeGreaterThanOrEqual(1000)
      expect(onRetry.mock.calls[0][2]).toBeLessThan(1500)

      // Second retry should be around 2000ms (with jitter)
      expect(onRetry.mock.calls[1][2]).toBeGreaterThanOrEqual(2000)
      expect(onRetry.mock.calls[1][2]).toBeLessThan(3000)
    })

    it('should respect maxDelay cap', async () => {
      const fn = vi.fn().mockRejectedValue(new NetworkError('Error'))
      const onRetry = vi.fn()

      const promise = retryWithBackoff(fn, {
        maxAttempts: 5,
        initialDelay: 5000,
        backoffFactor: 10,
        maxDelay: 6000,
        onRetry
      })

      await vi.runAllTimersAsync()

      await expect(promise).rejects.toThrow()

      // All delays should be capped at maxDelay (plus jitter)
      onRetry.mock.calls.forEach(call => {
        expect(call[2]).toBeLessThanOrEqual(6000 * 1.3) // Max delay + max jitter
      })
    })

    it('should not retry if shouldRetry returns false', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Non-retryable error'))

      const promise = retryWithBackoff(fn, {
        shouldRetry: () => false
      })

      await expect(promise).rejects.toThrow('Non-retryable error')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should retry NetworkError by default', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new NetworkError('Network error'))
        .mockResolvedValueOnce('success')

      const promise = retryWithBackoff(fn)

      await vi.runAllTimersAsync()

      const result = await promise
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should retry retryable HTTP status codes', async () => {
      const retryableStatusCodes = [408, 429, 500, 502, 503, 504]

      for (const statusCode of retryableStatusCodes) {
        const fn = vi.fn()
          .mockRejectedValueOnce(new ApiError('Error', statusCode))
          .mockResolvedValueOnce('success')

        const promise = retryWithBackoff(fn)

        await vi.runAllTimersAsync()

        const result = await promise
        expect(result).toBe('success')
        expect(fn).toHaveBeenCalledTimes(2)

        vi.clearAllMocks()
      }
    })

    it('should not retry non-retryable HTTP status codes', async () => {
      const nonRetryableStatusCodes = [400, 401, 403, 404]

      for (const statusCode of nonRetryableStatusCodes) {
        const fn = vi.fn().mockRejectedValue(new ApiError('Error', statusCode))

        const promise = retryWithBackoff(fn)

        await expect(promise).rejects.toThrow()
        expect(fn).toHaveBeenCalledTimes(1)

        vi.clearAllMocks()
      }
    })

    it('should call onRetry callback', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new NetworkError('Error'))
        .mockResolvedValueOnce('success')

      const onRetry = vi.fn()

      const promise = retryWithBackoff(fn, { onRetry })

      await vi.runAllTimersAsync()

      await promise

      expect(onRetry).toHaveBeenCalledTimes(1)
      expect(onRetry).toHaveBeenCalledWith(
        expect.any(NetworkError),
        1, // attempt number
        expect.any(Number) // delay
      )
    })

    it('should handle non-Error rejections', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce('string error')
        .mockRejectedValueOnce({ error: 'object error' })
        .mockResolvedValueOnce('success')

      // String errors should be wrapped
      const promise1 = retryWithBackoff(fn, { shouldRetry: () => true })
      await vi.runAllTimersAsync()
      await promise1

      expect(fn).toHaveBeenCalled()
    })
  })

  describe('createRetryingFetch', () => {
    let mockFetch: ReturnType<typeof vi.fn>

    beforeEach(() => {
      mockFetch = vi.fn()
      global.fetch = mockFetch
    })

    it('should successfully fetch on first attempt', async () => {
      const mockResponse = new Response('success', { status: 200 })
      mockFetch.mockResolvedValue(mockResponse)

      const retryingFetch = createRetryingFetch()
      const response = await retryingFetch('http://example.com')

      expect(response).toBe(mockResponse)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should retry on 500 error', async () => {
      mockFetch
        .mockResolvedValueOnce(new Response('error', { status: 500 }))
        .mockResolvedValueOnce(new Response('success', { status: 200 }))

      const retryingFetch = createRetryingFetch({ maxAttempts: 2 })
      const promise = retryingFetch('http://example.com')

      await vi.runAllTimersAsync()

      const response = await promise

      expect(response.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should throw ApiError for non-OK responses', async () => {
      mockFetch.mockResolvedValue(new Response('error', { status: 400 }))

      const retryingFetch = createRetryingFetch()
      const promise = retryingFetch('http://example.com')

      await expect(promise).rejects.toThrow(ApiError)
      await expect(promise).rejects.toThrow('HTTP 400')
    })

    it('should pass fetch options through', async () => {
      const mockResponse = new Response('success', { status: 200 })
      mockFetch.mockResolvedValue(mockResponse)

      const retryingFetch = createRetryingFetch()
      const options: RequestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' })
      }

      await retryingFetch('http://example.com', options)

      expect(mockFetch).toHaveBeenCalledWith('http://example.com', options)
    })

    it('should respect custom retry options', async () => {
      mockFetch.mockResolvedValue(new Response('error', { status: 500 }))

      const retryingFetch = createRetryingFetch({ maxAttempts: 5 })
      const promise = retryingFetch('http://example.com')

      await vi.runAllTimersAsync()

      await expect(promise).rejects.toThrow()
      expect(mockFetch).toHaveBeenCalledTimes(5)
    })
  })

  describe('isOnline', () => {
    it('should return true when navigator.onLine is true', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
        configurable: true
      })

      expect(isOnline()).toBe(true)
    })

    it('should return false when navigator.onLine is false', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
        configurable: true
      })

      expect(isOnline()).toBe(false)
    })

    it('should return true if navigator is not available', () => {
      const originalNavigator = global.navigator
      // @ts-expect-error - Testing edge case
      delete global.navigator

      expect(isOnline()).toBe(true)

      global.navigator = originalNavigator
    })
  })

  describe('waitForOnline', () => {
    beforeEach(() => {
      vi.useRealTimers()
    })

    it('should resolve immediately if already online', async () => {
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
        configurable: true
      })

      await expect(waitForOnline(100)).resolves.toBeUndefined()
    })

    it('should resolve when browser comes online', async () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
        configurable: true
      })

      const promise = waitForOnline(1000)

      // Simulate coming online after 100ms
      setTimeout(() => {
        Object.defineProperty(navigator, 'onLine', {
          value: true,
          writable: true,
          configurable: true
        })
        window.dispatchEvent(new Event('online'))
      }, 100)

      await expect(promise).resolves.toBeUndefined()
    })

    it('should reject after timeout if still offline', async () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
        configurable: true
      })

      await expect(waitForOnline(100)).rejects.toThrow(NetworkError)
      await expect(waitForOnline(100)).rejects.toThrow('Still offline after timeout')
    })

    it('should clean up event listeners on resolve', async () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
        configurable: true
      })

      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const promise = waitForOnline(1000)

      setTimeout(() => {
        window.dispatchEvent(new Event('online'))
      }, 50)

      await promise

      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    })

    it('should clean up event listeners on timeout', async () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
        configurable: true
      })

      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      await expect(waitForOnline(50)).rejects.toThrow()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    })
  })

  describe('Jitter calculation', () => {
    it('should add randomized jitter to delay', async () => {
      const fn = vi.fn().mockRejectedValue(new NetworkError('Error'))
      const onRetry = vi.fn()

      const promise = retryWithBackoff(fn, {
        maxAttempts: 4,
        initialDelay: 1000,
        backoffFactor: 2,
        onRetry
      })

      await vi.runAllTimersAsync()

      await expect(promise).rejects.toThrow()

      // Delays should vary due to jitter
      const delays = onRetry.mock.calls.map(call => call[2])

      // Check that delays are within expected range (with 30% jitter)
      expect(delays[0]).toBeGreaterThanOrEqual(1000) // base delay
      expect(delays[0]).toBeLessThanOrEqual(1000 * 1.3) // base delay + max jitter

      expect(delays[1]).toBeGreaterThanOrEqual(2000)
      expect(delays[1]).toBeLessThanOrEqual(2000 * 1.3)

      expect(delays[2]).toBeGreaterThanOrEqual(4000)
      expect(delays[2]).toBeLessThanOrEqual(4000 * 1.3)
    })
  })

  describe('Edge cases', () => {
    it('should handle attempt number correctly', async () => {
      const fn = vi.fn().mockRejectedValue(new NetworkError('Error'))
      const onRetry = vi.fn()

      const promise = retryWithBackoff(fn, {
        maxAttempts: 3,
        onRetry
      })

      await vi.runAllTimersAsync()

      await expect(promise).rejects.toThrow()

      // Should be called with attempt 1 and 2 (not retrying on last attempt)
      expect(onRetry.mock.calls[0][1]).toBe(1)
      expect(onRetry.mock.calls[1][1]).toBe(2)
    })

    it('should handle maxAttempts of 1', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Error'))

      await expect(
        retryWithBackoff(fn, { maxAttempts: 1 })
      ).rejects.toThrow()

      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should handle zero initialDelay', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new NetworkError('Error'))
        .mockResolvedValueOnce('success')

      const promise = retryWithBackoff(fn, { initialDelay: 0 })

      await vi.runAllTimersAsync()

      const result = await promise
      expect(result).toBe('success')
    })
  })
})

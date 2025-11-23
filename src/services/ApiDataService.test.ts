import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ApiDataService } from './ApiDataService'
import type { CreateTaskInput, UpdateTaskInput } from '../types/task'
import type { SidebarConfigData, SidebarItemData } from '../types/sidebar'
import { ZodError } from 'zod'

describe('ApiDataService', () => {
  let service: ApiDataService
  const baseUrl = 'http://localhost:3000/api'

  // Mock fetch globally
  const mockFetch = vi.fn()

  beforeEach(() => {
    service = new ApiDataService(baseUrl)
    global.fetch = mockFetch
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Constructor', () => {
    it('should initialize with base URL', () => {
      expect(service.getDataSourceMode()).toBe('api')
    })

    it('should initialize with cached fallback data', () => {
      const config = service.getLocalSidebarConfig()

      expect(config).toBeDefined()
      expect(config.smartLists).toBeDefined()
      expect(config.areas).toBeDefined()
      expect(config.projects).toBeDefined()
    })
  })

  describe('getSidebarConfig', () => {
    it('should fetch sidebar config from API', async () => {
      const mockConfig: SidebarConfigData = {
        smartLists: [
          { key: 'inbox', iconName: 'Inbox', title: 'Inbox', count: 5, priority: 'high', showCount: true }
        ],
        areas: [
          { key: 'work', iconName: 'Briefcase', title: 'Work', count: 10, priority: 'high', showCount: true }
        ],
        projects: []
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig
      })

      const config = await service.getSidebarConfig()

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/sidebar-config`)
      expect(config).toEqual(mockConfig)
    })

    it('should catch Zod validation errors and fallback to cache', async () => {
      const invalidConfig = {
        smartLists: [
          { key: 'inbox', iconName: 'InvalidIcon', title: 'Inbox', count: 0, priority: 'high' } // Invalid icon name
        ],
        areas: [],
        projects: []
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => invalidConfig
      })

      // Should fallback to cached data instead of throwing
      const config = await service.getSidebarConfig()
      expect(config).toBeDefined()
      // Should have fallback data, not the invalid config
      expect(config.smartLists.length).toBeGreaterThan(1)
    })

    it('should fallback to cached data on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      const config = await service.getSidebarConfig()

      expect(config).toBeDefined()
      expect(config.smartLists).toBeDefined()
    })

    it('should update cache on successful fetch', async () => {
      const mockConfig: SidebarConfigData = {
        smartLists: [],
        areas: [
          { key: 'updated', iconName: 'Circle', title: 'Updated', count: 0, priority: 'medium', showCount: false }
        ],
        projects: []
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig
      })

      await service.getSidebarConfig()
      const cached = service.getLocalSidebarConfig()

      expect(cached.areas[0].title).toBe('Updated')
    })
  })

  describe('addArea', () => {
    it('should create area via API', async () => {
      const newArea: SidebarItemData = {
        key: 'work_123',
        iconName: 'Briefcase',
        title: 'Work',
        count: 0,
        priority: 'high',
        showCount: false
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => newArea
      })

      const area = await service.addArea('Work', 'Briefcase', 'high')

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/areas`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Work')
        })
      )
      expect(area.title).toBe('Work')
    })

    it('should include description in request', async () => {
      const newArea: SidebarItemData = {
        key: 'personal_123',
        iconName: 'House',
        title: 'Personal',
        description: 'My personal tasks',
        count: 0,
        priority: 'medium',
        showCount: false
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => newArea
      })

      await service.addArea('Personal', 'House', 'medium', 'My personal tasks')

      const callArgs = mockFetch.mock.calls[0][1] as RequestInit
      const body = JSON.parse(callArgs.body as string)
      expect(body.description).toBe('My personal tasks')
    })

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      })

      await expect(
        service.addArea('Test')
      ).rejects.toThrow('API request failed')
    })
  })

  describe('addProject', () => {
    it('should create project via API', async () => {
      const newProject: SidebarItemData = {
        key: 'website_123',
        iconName: 'Globe',
        title: 'Website',
        count: 0,
        priority: 'high',
        dueDate: '2025-12-31',
        showCount: false
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => newProject
      })

      const project = await service.addProject('Website', 'Globe', 'high', undefined, '2025-12-31')

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/projects`,
        expect.objectContaining({
          method: 'POST'
        })
      )
      expect(project.title).toBe('Website')
      expect(project.dueDate).toBe('2025-12-31')
    })

    it('should include all optional fields in request', async () => {
      const newProject: SidebarItemData = {
        key: 'app_123',
        iconName: 'Smartphone',
        title: 'Mobile App',
        description: 'iOS development',
        count: 0,
        priority: 'high',
        dueDate: '2025-12-31',
        showCount: false
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => newProject
      })

      await service.addProject('Mobile App', 'Smartphone', 'high', 'iOS development', '2025-12-31')

      const callArgs = mockFetch.mock.calls[0][1] as RequestInit
      const body = JSON.parse(callArgs.body as string)
      expect(body.description).toBe('iOS development')
      expect(body.dueDate).toBe('2025-12-31')
    })
  })

  describe('getTasks', () => {
    it('should fetch tasks from API', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Task 1',
          priority: 'medium' as const,
          status: 'active' as const,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks
      })

      const tasks = await service.getTasks()

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/tasks`)
      expect(tasks).toHaveLength(1)
      expect(tasks[0].title).toBe('Task 1')
    })

    it('should include query parameters in request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })

      await service.getTasks('work', 'active', 1, 10)

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks?listId=work&status=active&page=1&limit=10`
      )
    })

    it('should fallback to cached data on API failure', async () => {
      // First populate cache
      const mockTasks = [
        {
          id: '1',
          title: 'Cached Task',
          priority: 'medium' as const,
          status: 'active' as const,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks
      })

      await service.getTasks()

      // Now simulate failure
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      const tasks = await service.getTasks()

      expect(tasks).toBeDefined()
      expect(tasks[0].title).toBe('Cached Task')
    })

    it('should apply filters to cached data on failure', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Work Task',
          listId: 'work',
          priority: 'medium' as const,
          status: 'active' as const,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        },
        {
          id: '2',
          title: 'Home Task',
          listId: 'home',
          priority: 'medium' as const,
          status: 'active' as const,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks
      })

      await service.getTasks()

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      const workTasks = await service.getTasks('work')

      expect(workTasks).toHaveLength(1)
      expect(workTasks[0].listId).toBe('work')
    })
  })

  describe('getTaskCounts', () => {
    it('should fetch task counts from API', async () => {
      const mockCounts = {
        all: 10,
        active: 5,
        completed: 3,
        archived: 2
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCounts
      })

      const counts = await service.getTaskCounts()

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/tasks/counts`)
      expect(counts).toEqual(mockCounts)
    })

    it('should include listId query parameter when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ all: 0, active: 0, completed: 0, archived: 0 })
      })

      await service.getTaskCounts('work')

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/tasks/counts?listId=work`)
    })

    it('should fallback to calculating from cache on failure', async () => {
      // First populate cache
      const mockTasks = [
        {
          id: '1',
          title: 'Active',
          priority: 'medium' as const,
          status: 'active' as const,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        },
        {
          id: '2',
          title: 'Completed',
          priority: 'medium' as const,
          status: 'completed' as const,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks
      })

      await service.getTasks()

      // Now simulate failure
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      const counts = await service.getTaskCounts()

      expect(counts.all).toBe(2)
      expect(counts.active).toBe(1)
      expect(counts.completed).toBe(1)
    })
  })

  describe('getTask', () => {
    it('should fetch single task from API', async () => {
      const mockTask = {
        id: '123',
        title: 'Test Task',
        priority: 'high' as const,
        status: 'active' as const,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTask
      })

      const task = await service.getTask('123')

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/tasks/123`)
      expect(task).toBeDefined()
      expect(task!.id).toBe('123')
    })

    it('should return null for 404 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found' })
      })

      const task = await service.getTask('non-existent')

      expect(task).toBeNull()
    })

    it('should fallback to cache on API failure', async () => {
      // Populate cache
      const mockTasks = [
        {
          id: '123',
          title: 'Cached Task',
          priority: 'medium' as const,
          status: 'active' as const,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks
      })

      await service.getTasks()

      // Now simulate failure
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      const task = await service.getTask('123')

      expect(task).toBeDefined()
      expect(task!.title).toBe('Cached Task')
    })
  })

  describe('createTask', () => {
    it('should create task via API', async () => {
      const input: CreateTaskInput = {
        title: 'New Task',
        priority: 'high',
        status: 'active'
      }

      const mockTask = {
        id: '123',
        ...input,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTask
      })

      const task = await service.createTask(input)

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      )
      expect(task.title).toBe('New Task')
    })

    it('should update cache after creation', async () => {
      const mockTask = {
        id: '123',
        title: 'New Task',
        priority: 'medium' as const,
        status: 'active' as const,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTask
      })

      await service.createTask({ title: 'New Task', priority: 'medium', status: 'active' })

      // Trigger cache fallback to verify task is in cache
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      const tasks = await service.getTasks()
      expect(tasks.some(t => t.id === '123')).toBe(true)
    })
  })

  describe('updateTask', () => {
    it('should update task via API', async () => {
      const updates: UpdateTaskInput = {
        title: 'Updated Title',
        priority: 'low'
      }

      const mockTask = {
        id: '123',
        title: 'Updated Title',
        priority: 'low' as const,
        status: 'active' as const,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTask
      })

      const task = await service.updateTask('123', updates)

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/123`,
        expect.objectContaining({
          method: 'PATCH'
        })
      )
      expect(task.title).toBe('Updated Title')
    })

    it('should update cache after update', async () => {
      // First populate cache
      const initialTask = {
        id: '123',
        title: 'Original',
        priority: 'medium' as const,
        status: 'active' as const,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [initialTask]
      })

      await service.getTasks()

      // Now update
      const updatedTask = {
        ...initialTask,
        title: 'Updated',
        updatedAt: '2025-01-02T00:00:00Z'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTask
      })

      await service.updateTask('123', { title: 'Updated' })

      // Verify cache was updated
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      const task = await service.getTask('123')
      expect(task!.title).toBe('Updated')
    })
  })

  describe('deleteTask', () => {
    it('should delete task via API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      })

      await service.deleteTask('123')

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/123`,
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })

    it('should update cache after deletion', async () => {
      // Populate cache
      const mockTasks = [
        {
          id: '123',
          title: 'To Delete',
          priority: 'medium' as const,
          status: 'active' as const,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks
      })

      await service.getTasks()

      // Delete
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      })

      await service.deleteTask('123')

      // Verify cache was updated
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      const task = await service.getTask('123')
      expect(task).toBeNull()
    })
  })

  describe('reorderTasks', () => {
    it('should reorder tasks via API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      })

      await service.reorderTasks(['1', '2', '3'])

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/reorder`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ taskIds: ['1', '2', '3'] })
        })
      )
    })

    it('should update cache order after reordering', async () => {
      // Populate cache
      const mockTasks = [
        {
          id: '1',
          title: 'Task 1',
          priority: 'medium' as const,
          status: 'active' as const,
          order: 0,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        },
        {
          id: '2',
          title: 'Task 2',
          priority: 'medium' as const,
          status: 'active' as const,
          order: 1,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks
      })

      await service.getTasks()

      // Reorder
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      })

      await service.reorderTasks(['2', '1'])

      // Verify order in cache
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      const tasks = await service.getTasks()
      const task1 = tasks.find(t => t.id === '1')
      const task2 = tasks.find(t => t.id === '2')

      expect(task2!.order).toBe(0)
      expect(task1!.order).toBe(1)
    })
  })

  describe('setBaseUrl', () => {
    it('should update base URL', () => {
      service.setBaseUrl('http://newapi.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })

      service.getTasks()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('http://newapi.com')
      )
    })
  })
})

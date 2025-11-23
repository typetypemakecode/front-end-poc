import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuickAddTask } from './quick-add-task'
import * as dataServiceModule from '../services/dataService'
import * as toastUtils from '../lib/toastUtils'

// Mock the data service
vi.mock('../services/dataService', () => ({
  default: {
    createTask: vi.fn()
  }
}))

// Mock toast utilities
vi.mock('../lib/toastUtils', () => ({
  showError: vi.fn(),
  showSuccess: vi.fn()
}))

describe('QuickAddTask', () => {
  const mockOnTaskCreated = vi.fn()
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    vi.clearAllMocks()
    user = userEvent.setup()
  })

  describe('Rendering and Placeholder', () => {
    it('should render input field with default placeholder when no list selected', () => {
      render(<QuickAddTask selectedListId={null} onTaskCreated={mockOnTaskCreated} />)

      const input = screen.getByPlaceholderText(/add a task/i)
      expect(input).toBeDefined()
    })

    it('should show context-aware placeholder for inbox', () => {
      render(<QuickAddTask selectedListId="inbox" onTaskCreated={mockOnTaskCreated} />)

      const input = screen.getByPlaceholderText(/add task to inbox/i)
      expect(input).toBeDefined()
    })

    it('should show context-aware placeholder for today', () => {
      render(<QuickAddTask selectedListId="today" onTaskCreated={mockOnTaskCreated} />)

      const input = screen.getByPlaceholderText(/add task for today/i)
      expect(input).toBeDefined()
    })

    it('should show context-aware placeholder for upcoming', () => {
      render(<QuickAddTask selectedListId="upcoming" onTaskCreated={mockOnTaskCreated} />)

      const input = screen.getByPlaceholderText(/add upcoming task/i)
      expect(input).toBeDefined()
    })

    it('should show context-aware placeholder for areas/projects', () => {
      render(<QuickAddTask selectedListId="work" onTaskCreated={mockOnTaskCreated} />)

      const input = screen.getByPlaceholderText(/add task to work/i)
      expect(input).toBeDefined()
    })
  })

  describe('Quick Creation (Enter Key)', () => {
    it('should create task with title only when Enter is pressed', async () => {
      const mockTask = {
        id: '123',
        title: 'New task',
        priority: 'low' as const,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      vi.mocked(dataServiceModule.default.createTask).mockResolvedValue(mockTask)

      render(<QuickAddTask selectedListId={null} onTaskCreated={mockOnTaskCreated} />)

      const input = screen.getByPlaceholderText(/add a task/i)
      await user.type(input, 'New task')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(dataServiceModule.default.createTask).toHaveBeenCalledWith({
          title: 'New task',
          priority: 'low',
          status: 'active'
        })
      })
    })

    it('should clear input after successful creation', async () => {
      const mockTask = {
        id: '123',
        title: 'Test task',
        priority: 'low' as const,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      vi.mocked(dataServiceModule.default.createTask).mockResolvedValue(mockTask)

      render(<QuickAddTask selectedListId={null} onTaskCreated={mockOnTaskCreated} />)

      const input = screen.getByPlaceholderText(/add a task/i) as HTMLInputElement
      await user.type(input, 'Test task')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(input.value).toBe('')
      })
    })

    it('should call onTaskCreated callback after successful creation', async () => {
      const mockTask = {
        id: '123',
        title: 'Test task',
        priority: 'low' as const,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      vi.mocked(dataServiceModule.default.createTask).mockResolvedValue(mockTask)

      render(<QuickAddTask selectedListId={null} onTaskCreated={mockOnTaskCreated} />)

      const input = screen.getByPlaceholderText(/add a task/i)
      await user.type(input, 'Test task')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(mockOnTaskCreated).toHaveBeenCalledTimes(1)
      })
    })

    it('should not create task with empty title', async () => {
      render(<QuickAddTask selectedListId={null} onTaskCreated={mockOnTaskCreated} />)

      const input = screen.getByPlaceholderText(/add a task/i)
      await user.click(input)
      await user.keyboard('{Enter}')

      expect(dataServiceModule.default.createTask).not.toHaveBeenCalled()
      expect(mockOnTaskCreated).not.toHaveBeenCalled()
    })

    it('should trim whitespace from title', async () => {
      const mockTask = {
        id: '123',
        title: 'Trimmed task',
        priority: 'low' as const,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      vi.mocked(dataServiceModule.default.createTask).mockResolvedValue(mockTask)

      render(<QuickAddTask selectedListId={null} onTaskCreated={mockOnTaskCreated} />)

      const input = screen.getByPlaceholderText(/add a task/i)
      await user.type(input, '  Trimmed task  ')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(dataServiceModule.default.createTask).toHaveBeenCalledWith({
          title: 'Trimmed task',
          priority: 'low',
          status: 'active'
        })
      })
    })
  })

  describe('Context-Aware Logic', () => {
    it('should set listId for area/project', async () => {
      const mockTask = {
        id: '123',
        title: 'Work task',
        priority: 'low' as const,
        status: 'active' as const,
        listId: 'work',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      vi.mocked(dataServiceModule.default.createTask).mockResolvedValue(mockTask)

      render(<QuickAddTask selectedListId="work" onTaskCreated={mockOnTaskCreated} />)

      const input = screen.getByPlaceholderText(/add task to work/i)
      await user.type(input, 'Work task')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(dataServiceModule.default.createTask).toHaveBeenCalledWith({
          title: 'Work task',
          priority: 'low',
          status: 'active',
          listId: 'work'
        })
      })
    })

    it('should set dueDate to today for "today" smart list', async () => {
      const mockTask = {
        id: '123',
        title: 'Today task',
        priority: 'low' as const,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      vi.mocked(dataServiceModule.default.createTask).mockResolvedValue(mockTask)

      render(<QuickAddTask selectedListId="today" onTaskCreated={mockOnTaskCreated} />)

      const input = screen.getByPlaceholderText(/add task for today/i)
      await user.type(input, 'Today task')
      await user.keyboard('{Enter}')

      const today = new Date().toISOString().split('T')[0]

      await waitFor(() => {
        expect(dataServiceModule.default.createTask).toHaveBeenCalledWith({
          title: 'Today task',
          priority: 'low',
          status: 'active',
          dueDate: today
        })
      })
    })

    it('should set dueDate to 3 days from now for "upcoming" smart list', async () => {
      const mockTask = {
        id: '123',
        title: 'Upcoming task',
        priority: 'low' as const,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      vi.mocked(dataServiceModule.default.createTask).mockResolvedValue(mockTask)

      render(<QuickAddTask selectedListId="upcoming" onTaskCreated={mockOnTaskCreated} />)

      const input = screen.getByPlaceholderText(/add upcoming task/i)
      await user.type(input, 'Upcoming task')
      await user.keyboard('{Enter}')

      const threeDaysFromNow = new Date()
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
      const expectedDate = threeDaysFromNow.toISOString().split('T')[0]

      await waitFor(() => {
        expect(dataServiceModule.default.createTask).toHaveBeenCalledWith({
          title: 'Upcoming task',
          priority: 'low',
          status: 'active',
          dueDate: expectedDate
        })
      })
    })

    it('should not set listId or dueDate for "inbox" smart list', async () => {
      const mockTask = {
        id: '123',
        title: 'Inbox task',
        priority: 'low' as const,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      vi.mocked(dataServiceModule.default.createTask).mockResolvedValue(mockTask)

      render(<QuickAddTask selectedListId="inbox" onTaskCreated={mockOnTaskCreated} />)

      const input = screen.getByPlaceholderText(/add task to inbox/i)
      await user.type(input, 'Inbox task')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(dataServiceModule.default.createTask).toHaveBeenCalledWith({
          title: 'Inbox task',
          priority: 'low',
          status: 'active'
        })
      })
    })

    it('should not set listId or dueDate when no list is selected', async () => {
      const mockTask = {
        id: '123',
        title: 'Unassigned task',
        priority: 'low' as const,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      vi.mocked(dataServiceModule.default.createTask).mockResolvedValue(mockTask)

      render(<QuickAddTask selectedListId={null} onTaskCreated={mockOnTaskCreated} />)

      const input = screen.getByPlaceholderText(/add a task/i)
      await user.type(input, 'Unassigned task')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(dataServiceModule.default.createTask).toHaveBeenCalledWith({
          title: 'Unassigned task',
          priority: 'low',
          status: 'active'
        })
      })
    })
  })

  describe('Error Handling', () => {
    it('should show error toast on creation failure', async () => {
      const error = new Error('Network error')
      vi.mocked(dataServiceModule.default.createTask).mockRejectedValue(error)

      render(<QuickAddTask selectedListId={null} onTaskCreated={mockOnTaskCreated} />)

      const input = screen.getByPlaceholderText(/add a task/i) as HTMLInputElement
      await user.type(input, 'Failed task')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(toastUtils.showError).toHaveBeenCalledWith(error)
      })
    })

    it('should preserve user input on error', async () => {
      const error = new Error('Network error')
      vi.mocked(dataServiceModule.default.createTask).mockRejectedValue(error)

      render(<QuickAddTask selectedListId={null} onTaskCreated={mockOnTaskCreated} />)

      const input = screen.getByPlaceholderText(/add a task/i) as HTMLInputElement
      await user.type(input, 'Failed task')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(toastUtils.showError).toHaveBeenCalled()
      })

      // Input should still contain the original text
      expect(input.value).toBe('Failed task')
    })

    it('should not call onTaskCreated on error', async () => {
      const error = new Error('Network error')
      vi.mocked(dataServiceModule.default.createTask).mockRejectedValue(error)

      render(<QuickAddTask selectedListId={null} onTaskCreated={mockOnTaskCreated} />)

      const input = screen.getByPlaceholderText(/add a task/i)
      await user.type(input, 'Failed task')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(toastUtils.showError).toHaveBeenCalled()
      })

      expect(mockOnTaskCreated).not.toHaveBeenCalled()
    })
  })

  describe('Default Values', () => {
    it('should always set priority to "low"', async () => {
      const mockTask = {
        id: '123',
        title: 'Test',
        priority: 'low' as const,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      vi.mocked(dataServiceModule.default.createTask).mockResolvedValue(mockTask)

      render(<QuickAddTask selectedListId={null} onTaskCreated={mockOnTaskCreated} />)

      const input = screen.getByPlaceholderText(/add a task/i)
      await user.type(input, 'Test')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        const call = vi.mocked(dataServiceModule.default.createTask).mock.calls[0][0]
        expect(call.priority).toBe('low')
      })
    })

    it('should always set status to "active"', async () => {
      const mockTask = {
        id: '123',
        title: 'Test',
        priority: 'low' as const,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      vi.mocked(dataServiceModule.default.createTask).mockResolvedValue(mockTask)

      render(<QuickAddTask selectedListId={null} onTaskCreated={mockOnTaskCreated} />)

      const input = screen.getByPlaceholderText(/add a task/i)
      await user.type(input, 'Test')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        const call = vi.mocked(dataServiceModule.default.createTask).mock.calls[0][0]
        expect(call.status).toBe('active')
      })
    })
  })
})

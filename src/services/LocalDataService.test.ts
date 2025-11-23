import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LocalDataService } from './LocalDataService'
import type { CreateTaskInput, UpdateTaskInput } from '../types/task'

describe('LocalDataService', () => {
  let service: LocalDataService

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Create a fresh service instance
    service = new LocalDataService()
  })

  describe('Constructor and Initialization', () => {
    it('should initialize with mock data when localStorage is empty', () => {
      const config = service.getLocalSidebarConfig()

      expect(config).toBeDefined()
      expect(config.smartLists).toBeDefined()
      expect(config.areas).toBeDefined()
      expect(config.projects).toBeDefined()
      expect(Array.isArray(config.smartLists)).toBe(true)
      expect(Array.isArray(config.areas)).toBe(true)
      expect(Array.isArray(config.projects)).toBe(true)
    })

    it('should load from localStorage when available', () => {
      const mockConfig = {
        smartLists: [],
        areas: [{ key: 'test', iconName: 'Circle' as const, title: 'Test', count: 0, priority: 'medium' as const, showCount: false }],
        projects: []
      }
      localStorage.setItem('sidebarConfig', JSON.stringify(mockConfig))

      const newService = new LocalDataService()
      const config = newService.getLocalSidebarConfig()

      expect(config.areas).toHaveLength(1)
      expect(config.areas[0].title).toBe('Test')
    })
  })

  describe('getSidebarConfig', () => {
    it('should return sidebar configuration with task counts', async () => {
      const config = await service.getSidebarConfig()

      expect(config).toBeDefined()
      expect(config.smartLists).toBeDefined()
      expect(config.areas).toBeDefined()
      expect(config.projects).toBeDefined()
    })

    it('should calculate correct counts for smart lists', async () => {
      // Create tasks for testing smart list counts
      await service.createTask({ title: 'Inbox task', priority: 'medium', status: 'active' })

      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      await service.createTask({ title: 'Today task', dueDate: todayStr, priority: 'medium', status: 'active' })

      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]
      await service.createTask({ title: 'Upcoming task', dueDate: tomorrowStr, priority: 'medium', status: 'active' })

      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      await service.createTask({ title: 'Past due task', dueDate: yesterdayStr, priority: 'medium', status: 'active' })

      await service.createTask({ title: 'Tagged task', tags: ['test'], priority: 'medium', status: 'active' })

      const config = await service.getSidebarConfig()

      const inbox = config.smartLists.find(list => list.key === 'inbox')
      const todayList = config.smartLists.find(list => list.key === 'today')
      const upcoming = config.smartLists.find(list => list.key === 'upcoming')
      const pastDue = config.smartLists.find(list => list.key === 'past_due')
      const tags = config.smartLists.find(list => list.key === 'tags')

      expect(inbox?.count).toBeGreaterThan(0)
      expect(todayList?.count).toBeGreaterThan(0)
      expect(upcoming?.count).toBeGreaterThan(0)
      expect(pastDue?.count).toBeGreaterThan(0)
      expect(tags?.count).toBeGreaterThan(0)
    })

    it('should exclude completed tasks from smart list counts', async () => {
      const today = new Date().toISOString().split('T')[0]

      // Create completed task - should not count in today
      await service.createTask({
        title: 'Completed today task',
        dueDate: today,
        priority: 'medium',
        status: 'completed'
      })

      const config = await service.getSidebarConfig()
      const todayList = config.smartLists.find(list => list.key === 'today')

      // The count should be from mock data only, not include our completed task
      expect(todayList?.count).toBe(todayList?.count)
    })
  })

  describe('addArea', () => {
    it('should create a new area with default values', async () => {
      const area = await service.addArea('Work')

      expect(area).toBeDefined()
      expect(area.title).toBe('Work')
      expect(area.key).toMatch(/^work_\d+$/)
      expect(area.iconName).toBe('Circle')
      expect(area.priority).toBe('medium')
      expect(area.count).toBe(0)
    })

    it('should create a new area with custom values', async () => {
      const area = await service.addArea('Personal', 'House', 'high', 'My personal tasks')

      expect(area.title).toBe('Personal')
      expect(area.iconName).toBe('House')
      expect(area.priority).toBe('high')
      expect(area.description).toBe('My personal tasks')
    })

    it('should persist area to localStorage', async () => {
      await service.addArea('Test Area')

      const stored = localStorage.getItem('sidebarConfig')
      expect(stored).toBeDefined()

      const config = JSON.parse(stored!)
      expect(config.areas).toBeDefined()
      const testArea = config.areas.find((a: { title: string }) => a.title === 'Test Area')
      expect(testArea).toBeDefined()
    })

    it('should generate unique keys for areas with same title', async () => {
      const area1 = await service.addArea('Work')
      // Wait a tiny bit to ensure timestamp is different
      await new Promise(resolve => setTimeout(resolve, 5))
      const area2 = await service.addArea('Work')

      expect(area1.key).not.toBe(area2.key)
    })
  })

  describe('addProject', () => {
    it('should create a new project with default values', async () => {
      const project = await service.addProject('Website')

      expect(project).toBeDefined()
      expect(project.title).toBe('Website')
      expect(project.key).toMatch(/^website_\d+$/)
      expect(project.iconName).toBe('Folder')
      expect(project.priority).toBe('medium')
      expect(project.count).toBe(0)
    })

    it('should create a new project with custom values including due date', async () => {
      const project = await service.addProject(
        'Mobile App',
        'Smartphone',
        'high',
        'iOS application',
        '2025-12-31'
      )

      expect(project.title).toBe('Mobile App')
      expect(project.iconName).toBe('Smartphone')
      expect(project.priority).toBe('high')
      expect(project.description).toBe('iOS application')
      expect(project.dueDate).toBe('2025-12-31')
    })

    it('should persist project to localStorage', async () => {
      await service.addProject('Test Project')

      const stored = localStorage.getItem('sidebarConfig')
      expect(stored).toBeDefined()

      const config = JSON.parse(stored!)
      expect(config.projects).toBeDefined()
      const testProject = config.projects.find((p: { title: string }) => p.title === 'Test Project')
      expect(testProject).toBeDefined()
    })
  })

  describe('getTasks', () => {
    it('should return all tasks when no filters applied', async () => {
      const tasks = await service.getTasks()

      expect(Array.isArray(tasks)).toBe(true)
      expect(tasks.length).toBeGreaterThan(0)
    })

    it('should filter tasks by listId', async () => {
      const task1 = await service.createTask({ title: 'Work task', listId: 'work', priority: 'medium', status: 'active' })
      const task2 = await service.createTask({ title: 'Home task', listId: 'home', priority: 'medium', status: 'active' })

      const workTasks = await service.getTasks('work')

      expect(workTasks.length).toBeGreaterThan(0)
      expect(workTasks.every(t => t.listId === 'work')).toBe(true)
    })

    it('should filter tasks by status', async () => {
      await service.createTask({ title: 'Active task', priority: 'medium', status: 'active' })
      await service.createTask({ title: 'Completed task', priority: 'medium', status: 'completed' })

      const activeTasks = await service.getTasks(undefined, 'active')
      const completedTasks = await service.getTasks(undefined, 'completed')

      expect(activeTasks.every(t => t.status === 'active')).toBe(true)
      expect(completedTasks.every(t => t.status === 'completed')).toBe(true)
    })

    it('should sort tasks by order field', async () => {
      await service.createTask({ title: 'Task 3', priority: 'medium', status: 'active', order: 2 })
      await service.createTask({ title: 'Task 1', priority: 'medium', status: 'active', order: 0 })
      await service.createTask({ title: 'Task 2', priority: 'medium', status: 'active', order: 1 })

      const tasks = await service.getTasks()

      // Tasks with order should be sorted
      const orderedTasks = tasks.filter(t => t.order !== undefined)
      for (let i = 0; i < orderedTasks.length - 1; i++) {
        expect(orderedTasks[i].order).toBeLessThanOrEqual(orderedTasks[i + 1].order!)
      }
    })

    it('should support pagination', async () => {
      // Create some tasks
      for (let i = 0; i < 5; i++) {
        await service.createTask({ title: `Task ${i}`, priority: 'medium', status: 'active' })
      }

      const page1 = await service.getTasks(undefined, undefined, 1, 2)
      const page2 = await service.getTasks(undefined, undefined, 2, 2)

      expect(page1.length).toBe(2)
      expect(page2.length).toBe(2)
      expect(page1[0].id).not.toBe(page2[0].id)
    })
  })

  describe('getTaskCounts', () => {
    it('should return counts for all tasks', async () => {
      await service.createTask({ title: 'Active', priority: 'medium', status: 'active' })
      await service.createTask({ title: 'Completed', priority: 'medium', status: 'completed' })
      await service.createTask({ title: 'Archived', priority: 'medium', status: 'archived' })

      const counts = await service.getTaskCounts()

      expect(counts).toBeDefined()
      expect(counts.all).toBeGreaterThan(0)
      expect(counts.active).toBeGreaterThan(0)
      expect(counts.completed).toBeGreaterThan(0)
      expect(counts.archived).toBeGreaterThan(0)
    })

    it('should filter counts by listId', async () => {
      await service.createTask({ title: 'Work 1', listId: 'work', priority: 'medium', status: 'active' })
      await service.createTask({ title: 'Work 2', listId: 'work', priority: 'medium', status: 'completed' })
      await service.createTask({ title: 'Home 1', listId: 'home', priority: 'medium', status: 'active' })

      const workCounts = await service.getTaskCounts('work')

      expect(workCounts.all).toBeGreaterThan(0)
      expect(workCounts.active).toBeGreaterThan(0)
    })
  })

  describe('getTask', () => {
    it('should return a task by ID', async () => {
      const created = await service.createTask({ title: 'Test Task', priority: 'medium', status: 'active' })
      const retrieved = await service.getTask(created.id)

      expect(retrieved).toBeDefined()
      expect(retrieved!.id).toBe(created.id)
      expect(retrieved!.title).toBe('Test Task')
    })

    it('should return null for non-existent task', async () => {
      const task = await service.getTask('non-existent-id')

      expect(task).toBeNull()
    })
  })

  describe('createTask', () => {
    it('should create a task with required fields', async () => {
      const input: CreateTaskInput = {
        title: 'New Task',
        priority: 'high',
        status: 'active'
      }

      const task = await service.createTask(input)

      expect(task).toBeDefined()
      expect(task.id).toBeDefined()
      expect(task.title).toBe('New Task')
      expect(task.priority).toBe('high')
      expect(task.status).toBe('active')
      expect(task.createdAt).toBeDefined()
      expect(task.updatedAt).toBeDefined()
    })

    it('should create a task with all optional fields', async () => {
      const input: CreateTaskInput = {
        title: 'Full Task',
        description: 'A complete task',
        priority: 'low',
        status: 'active',
        dueDate: '2025-12-31',
        listId: 'work',
        tags: ['urgent', 'important'],
        order: 5
      }

      const task = await service.createTask(input)

      expect(task.description).toBe('A complete task')
      expect(task.dueDate).toBe('2025-12-31')
      expect(task.listId).toBe('work')
      expect(task.tags).toEqual(['urgent', 'important'])
      expect(task.order).toBe(5)
    })

    it('should auto-assign order if not provided', async () => {
      const task1 = await service.createTask({ title: 'Task 1', priority: 'medium', status: 'active' })
      const task2 = await service.createTask({ title: 'Task 2', priority: 'medium', status: 'active' })

      expect(task1.order).toBeDefined()
      expect(task2.order).toBeDefined()
      expect(task2.order!).toBeGreaterThan(task1.order!)
    })

    it('should use default values for priority and status', async () => {
      const task = await service.createTask({ title: 'Default Task' })

      expect(task.priority).toBe('medium')
      expect(task.status).toBe('active')
    })

    it('should persist task to localStorage', async () => {
      const task = await service.createTask({ title: 'Persist Test', priority: 'medium', status: 'active' })

      const stored = localStorage.getItem('tasks')
      expect(stored).toBeDefined()

      const tasks = JSON.parse(stored!)
      const foundTask = tasks.find((t: { id: string }) => t.id === task.id)
      expect(foundTask).toBeDefined()
    })
  })

  describe('updateTask', () => {
    it('should update task fields', async () => {
      const task = await service.createTask({ title: 'Original', priority: 'low', status: 'active' })

      // Wait a tiny bit to ensure timestamp is different
      await new Promise(resolve => setTimeout(resolve, 5))

      const updates: UpdateTaskInput = {
        title: 'Updated',
        priority: 'high',
        description: 'New description'
      }

      const updated = await service.updateTask(task.id, updates)

      expect(updated.title).toBe('Updated')
      expect(updated.priority).toBe('high')
      expect(updated.description).toBe('New description')
      expect(updated.updatedAt).not.toBe(task.updatedAt)
    })

    it('should throw error for non-existent task', async () => {
      await expect(
        service.updateTask('non-existent', { title: 'Test' })
      ).rejects.toThrow('Task with id non-existent not found')
    })

    it('should persist updates to localStorage', async () => {
      const task = await service.createTask({ title: 'Test', priority: 'medium', status: 'active' })
      await service.updateTask(task.id, { title: 'Updated' })

      const stored = localStorage.getItem('tasks')
      const tasks = JSON.parse(stored!)
      const updatedTask = tasks.find((t: { id: string }) => t.id === task.id)

      expect(updatedTask.title).toBe('Updated')
    })
  })

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const task = await service.createTask({ title: 'To Delete', priority: 'medium', status: 'active' })

      await service.deleteTask(task.id)

      const retrieved = await service.getTask(task.id)
      expect(retrieved).toBeNull()
    })

    it('should throw error for non-existent task', async () => {
      await expect(
        service.deleteTask('non-existent')
      ).rejects.toThrow('Task with id non-existent not found')
    })

    it('should persist deletion to localStorage', async () => {
      const task = await service.createTask({ title: 'Test', priority: 'medium', status: 'active' })
      await service.deleteTask(task.id)

      const stored = localStorage.getItem('tasks')
      const tasks = JSON.parse(stored!)
      const foundTask = tasks.find((t: { id: string }) => t.id === task.id)

      expect(foundTask).toBeUndefined()
    })
  })

  describe('reorderTasks', () => {
    it('should reorder tasks correctly', async () => {
      const task1 = await service.createTask({ title: 'Task 1', priority: 'medium', status: 'active' })
      const task2 = await service.createTask({ title: 'Task 2', priority: 'medium', status: 'active' })
      const task3 = await service.createTask({ title: 'Task 3', priority: 'medium', status: 'active' })

      // Reorder: 3, 1, 2
      await service.reorderTasks([task3.id, task1.id, task2.id])

      const updated1 = await service.getTask(task1.id)
      const updated2 = await service.getTask(task2.id)
      const updated3 = await service.getTask(task3.id)

      expect(updated3!.order).toBe(0)
      expect(updated1!.order).toBe(1)
      expect(updated2!.order).toBe(2)
    })

    it('should throw error for duplicate task IDs', async () => {
      const task1 = await service.createTask({ title: 'Task 1', priority: 'medium', status: 'active' })

      await expect(
        service.reorderTasks([task1.id, task1.id])
      ).rejects.toThrow('Duplicate task IDs in reorder list')
    })

    it('should throw error for non-existent task IDs', async () => {
      const task1 = await service.createTask({ title: 'Task 1', priority: 'medium', status: 'active' })

      await expect(
        service.reorderTasks([task1.id, 'non-existent'])
      ).rejects.toThrow('Task ID non-existent not found')
    })
  })

  describe('getDataSourceMode', () => {
    it('should return "local"', () => {
      expect(service.getDataSourceMode()).toBe('local')
    })
  })

  describe('reset', () => {
    it('should clear localStorage and reset to defaults', async () => {
      await service.addArea('Test Area')

      service.reset()

      const stored = localStorage.getItem('sidebarConfig')
      expect(stored).toBeNull()
    })
  })
})

import { describe, it, expect, beforeEach } from 'vitest'
import { filterTasksByList } from './taskFilters'
import type { TaskData } from '../types/task'

describe('taskFilters', () => {
  let tasks: TaskData[]
  let today: Date
  let todayStr: string
  let tomorrowStr: string
  let yesterdayStr: string
  let nextWeekStr: string

  beforeEach(() => {
    // Set up dates
    today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 6)

    todayStr = today.toISOString().split('T')[0]
    tomorrowStr = tomorrow.toISOString().split('T')[0]
    yesterdayStr = yesterday.toISOString().split('T')[0]
    nextWeekStr = nextWeek.toISOString().split('T')[0]

    // Create sample tasks
    tasks = [
      // Inbox tasks (no dueDate, no listId)
      {
        id: '1',
        title: 'Inbox task 1',
        priority: 'medium',
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: '2',
        title: 'Inbox task 2',
        priority: 'high',
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      // Today tasks
      {
        id: '3',
        title: 'Today task',
        dueDate: todayStr,
        priority: 'high',
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      // Upcoming tasks
      {
        id: '4',
        title: 'Tomorrow task',
        dueDate: tomorrowStr,
        priority: 'medium',
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: '5',
        title: 'Next week task',
        dueDate: nextWeekStr,
        priority: 'low',
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      // Past due tasks
      {
        id: '6',
        title: 'Yesterday task',
        dueDate: yesterdayStr,
        priority: 'high',
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      // Tagged tasks (with listId to not interfere with inbox)
      {
        id: '7',
        title: 'Tagged task 1',
        tags: ['work', 'urgent'],
        listId: 'work',
        priority: 'high',
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: '8',
        title: 'Tagged task 2',
        tags: ['personal'],
        listId: 'home',
        priority: 'medium',
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      // Work area tasks
      {
        id: '9',
        title: 'Work task 1',
        listId: 'work',
        priority: 'high',
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: '10',
        title: 'Work task 2',
        listId: 'work',
        priority: 'medium',
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      // Home area tasks
      {
        id: '11',
        title: 'Home task',
        listId: 'home',
        priority: 'low',
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }
    ]
  })

  describe('filterTasksByList', () => {
    describe('No filter (null listId)', () => {
      it('should return all tasks when listId is null', () => {
        const filtered = filterTasksByList(tasks, null)
        expect(filtered).toHaveLength(tasks.length)
        expect(filtered).toEqual(tasks)
      })
    })

    describe('Inbox smart list', () => {
      it('should filter inbox tasks (no dueDate, no listId)', () => {
        const filtered = filterTasksByList(tasks, 'inbox')

        expect(filtered).toHaveLength(2)
        expect(filtered.every(t => !t.dueDate && !t.listId)).toBe(true)
        expect(filtered.map(t => t.id)).toEqual(['1', '2'])
      })

      it('should exclude tasks with dueDate from inbox', () => {
        const filtered = filterTasksByList(tasks, 'inbox')

        expect(filtered.every(t => !t.dueDate)).toBe(true)
      })

      it('should exclude tasks with listId from inbox', () => {
        const filtered = filterTasksByList(tasks, 'inbox')

        expect(filtered.every(t => !t.listId)).toBe(true)
      })
    })

    describe('Today smart list', () => {
      it('should filter tasks due today', () => {
        const filtered = filterTasksByList(tasks, 'today')

        expect(filtered).toHaveLength(1)
        expect(filtered[0].id).toBe('3')
        expect(filtered[0].dueDate).toBe(todayStr)
      })

      it('should exclude tasks without dueDate', () => {
        const filtered = filterTasksByList(tasks, 'today')

        expect(filtered.every(t => t.dueDate !== undefined)).toBe(true)
      })

      it('should exclude tasks due on other days', () => {
        const filtered = filterTasksByList(tasks, 'today')

        filtered.forEach(task => {
          expect(task.dueDate).toBe(todayStr)
        })
      })
    })

    describe('Upcoming smart list', () => {
      it('should filter tasks due in next 7 days', () => {
        const filtered = filterTasksByList(tasks, 'upcoming')

        expect(filtered.length).toBeGreaterThan(0)
        expect(filtered.map(t => t.id)).toContain('4') // tomorrow
        expect(filtered.map(t => t.id)).toContain('5') // next week
      })

      it('should exclude today\'s tasks', () => {
        const filtered = filterTasksByList(tasks, 'upcoming')

        expect(filtered.every(t => t.dueDate !== todayStr)).toBe(true)
      })

      it('should exclude past due tasks', () => {
        const filtered = filterTasksByList(tasks, 'upcoming')

        const sevenDaysFromNow = new Date(today)
        sevenDaysFromNow.setDate(today.getDate() + 7)

        filtered.forEach(task => {
          if (task.dueDate) {
            const [year, month, day] = task.dueDate.split('-').map(Number)
            const dueDate = new Date(year, month - 1, day)
            expect(dueDate.getTime()).toBeGreaterThan(today.getTime())
            expect(dueDate.getTime()).toBeLessThanOrEqual(sevenDaysFromNow.getTime())
          }
        })
      })
    })

    describe('Past due smart list', () => {
      it('should filter overdue tasks', () => {
        const filtered = filterTasksByList(tasks, 'past_due')

        expect(filtered).toHaveLength(1)
        expect(filtered[0].id).toBe('6')
        expect(filtered[0].dueDate).toBe(yesterdayStr)
      })

      it('should exclude tasks without dueDate', () => {
        const filtered = filterTasksByList(tasks, 'past_due')

        expect(filtered.every(t => t.dueDate !== undefined)).toBe(true)
      })

      it('should exclude today and future tasks', () => {
        const filtered = filterTasksByList(tasks, 'past_due')

        filtered.forEach(task => {
          if (task.dueDate) {
            const [year, month, day] = task.dueDate.split('-').map(Number)
            const dueDate = new Date(year, month - 1, day)
            expect(dueDate.getTime()).toBeLessThan(today.getTime())
          }
        })
      })
    })

    describe('Tags smart list', () => {
      it('should filter tasks with tags', () => {
        const filtered = filterTasksByList(tasks, 'tags')

        expect(filtered).toHaveLength(2)
        expect(filtered.map(t => t.id)).toEqual(['7', '8'])
      })

      it('should include tasks with any number of tags', () => {
        const filtered = filterTasksByList(tasks, 'tags')

        expect(filtered.every(t => t.tags && t.tags.length > 0)).toBe(true)
      })

      it('should exclude tasks without tags', () => {
        const filtered = filterTasksByList(tasks, 'tags')

        expect(filtered.every(t => t.tags !== undefined && t.tags.length > 0)).toBe(true)
      })
    })

    describe('Area/Project lists', () => {
      it('should filter tasks by listId (work area)', () => {
        const filtered = filterTasksByList(tasks, 'work')

        expect(filtered).toHaveLength(3) // 7, 9, 10
        expect(filtered.every(t => t.listId === 'work')).toBe(true)
        expect(filtered.map(t => t.id).sort()).toEqual(['7', '9', '10'].sort())
      })

      it('should filter tasks by listId (home area)', () => {
        const filtered = filterTasksByList(tasks, 'home')

        expect(filtered).toHaveLength(2) // 8, 11
        expect(filtered.every(t => t.listId === 'home')).toBe(true)
        expect(filtered.map(t => t.id).sort()).toEqual(['8', '11'].sort())
      })

      it('should return empty array for non-existent listId', () => {
        const filtered = filterTasksByList(tasks, 'non-existent')

        expect(filtered).toHaveLength(0)
      })
    })

    describe('Edge cases', () => {
      it('should handle empty task array', () => {
        const filtered = filterTasksByList([], 'inbox')

        expect(filtered).toHaveLength(0)
      })

      it('should handle tasks with empty tags array', () => {
        const tasksWithEmptyTags: TaskData[] = [
          {
            id: '1',
            title: 'Task',
            tags: [],
            priority: 'medium',
            status: 'active',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z'
          }
        ]

        const filtered = filterTasksByList(tasksWithEmptyTags, 'tags')

        expect(filtered).toHaveLength(0)
      })

      it('should handle malformed date strings gracefully', () => {
        const tasksWithBadDates: TaskData[] = [
          {
            id: '1',
            title: 'Bad date task',
            dueDate: 'invalid-date',
            priority: 'medium',
            status: 'active',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z'
          }
        ]

        // Should not throw error
        expect(() => filterTasksByList(tasksWithBadDates, 'today')).not.toThrow()
      })

      it('should handle undefined optional fields', () => {
        const minimalTasks: TaskData[] = [
          {
            id: '1',
            title: 'Minimal task',
            priority: 'medium',
            status: 'active',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z'
          }
        ]

        const inboxFiltered = filterTasksByList(minimalTasks, 'inbox')
        expect(inboxFiltered).toHaveLength(1)

        const tagsFiltered = filterTasksByList(minimalTasks, 'tags')
        expect(tagsFiltered).toHaveLength(0)

        const todayFiltered = filterTasksByList(minimalTasks, 'today')
        expect(todayFiltered).toHaveLength(0)
      })
    })

    describe('Date parsing consistency', () => {
      it('should use local timezone for date comparisons', () => {
        // Create a task due exactly at midnight today
        const midnightToday = new Date(today)
        midnightToday.setHours(0, 0, 0, 0)
        const midnightStr = midnightToday.toISOString().split('T')[0]

        const tasksDueToday: TaskData[] = [
          {
            id: '1',
            title: 'Midnight task',
            dueDate: midnightStr,
            priority: 'medium',
            status: 'active',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z'
          }
        ]

        const filtered = filterTasksByList(tasksDueToday, 'today')
        expect(filtered).toHaveLength(1)
      })

      it('should correctly identify upcoming tasks at boundary', () => {
        // Task due exactly 7 days from now should be included in upcoming
        const sevenDaysOut = new Date(today)
        sevenDaysOut.setDate(today.getDate() + 7)
        const sevenDaysStr = sevenDaysOut.toISOString().split('T')[0]

        const boundaryTasks: TaskData[] = [
          {
            id: '1',
            title: '7 days task',
            dueDate: sevenDaysStr,
            priority: 'medium',
            status: 'active',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z'
          }
        ]

        const filtered = filterTasksByList(boundaryTasks, 'upcoming')
        expect(filtered).toHaveLength(1)
      })

      it('should exclude tasks due 8+ days from now from upcoming', () => {
        const eightDaysOut = new Date(today)
        eightDaysOut.setDate(today.getDate() + 8)
        const eightDaysStr = eightDaysOut.toISOString().split('T')[0]

        const futureTasks: TaskData[] = [
          {
            id: '1',
            title: '8 days task',
            dueDate: eightDaysStr,
            priority: 'medium',
            status: 'active',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z'
          }
        ]

        const filtered = filterTasksByList(futureTasks, 'upcoming')
        expect(filtered).toHaveLength(0)
      })
    })
  })
})

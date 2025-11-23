import { useState, type KeyboardEvent } from 'react'
import { dataService } from '../services/dataService'
import { showError } from '../lib/toastUtils'
import type { CreateTaskInput } from '../types/task'

interface QuickAddTaskProps {
  selectedListId: string | null
  onTaskCreated: () => void
}

const SMART_LISTS = ['inbox', 'today', 'upcoming', 'past_due', 'tags', 'anytime', 'someday', 'logbook']

export function QuickAddTask({ selectedListId, onTaskCreated }: QuickAddTaskProps) {
  const [title, setTitle] = useState('')

  /**
   * Get context-aware placeholder text based on selected list
   */
  const getPlaceholder = (): string => {
    if (!selectedListId) {
      return 'Add a task...'
    }

    // Smart list placeholders
    if (selectedListId === 'today') {
      return 'Add task for today...'
    }
    if (selectedListId === 'upcoming') {
      return 'Add upcoming task...'
    }
    if (selectedListId === 'inbox') {
      return 'Add task to Inbox...'
    }
    if (selectedListId === 'tags') {
      return 'Add task with tags...'
    }
    if (SMART_LISTS.includes(selectedListId)) {
      return `Add task to ${selectedListId}...`
    }

    // Area/Project placeholder
    // Capitalize first letter
    const displayName = selectedListId.charAt(0).toUpperCase() + selectedListId.slice(1)
    return `Add task to ${displayName}...`
  }

  /**
   * Get context-aware due date based on selected smart list
   */
  const getContextualDueDate = (): string | undefined => {
    if (selectedListId === 'today') {
      // Set to today's date in YYYY-MM-DD format
      return new Date().toISOString().split('T')[0]
    }

    if (selectedListId === 'upcoming') {
      // Set to 3 days from now (midpoint of 7-day range)
      const threeDaysFromNow = new Date()
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
      return threeDaysFromNow.toISOString().split('T')[0]
    }

    return undefined
  }

  /**
   * Get context-aware listId based on selected list
   */
  const getContextualListId = (): string | undefined => {
    // Smart lists don't use listId (they're virtual views)
    if (!selectedListId || SMART_LISTS.includes(selectedListId)) {
      return undefined
    }

    // Areas and projects use their key as listId
    return selectedListId
  }

  /**
   * Create task with context-aware defaults
   */
  const createTask = async () => {
    const trimmedTitle = title.trim()

    // Validate: empty title
    if (!trimmedTitle) {
      return
    }

    try {
      // Build task input with context-aware defaults
      const taskInput: CreateTaskInput = {
        title: trimmedTitle,
        priority: 'low',
        status: 'active'
      }

      // Add contextual dueDate if applicable
      const dueDate = getContextualDueDate()
      if (dueDate) {
        taskInput.dueDate = dueDate
      }

      // Add contextual listId if applicable
      const listId = getContextualListId()
      if (listId) {
        taskInput.listId = listId
      }

      // Create task via data service
      await dataService.createTask(taskInput)

      // Reset form on success
      setTitle('')

      // Trigger refresh cascade
      onTaskCreated()
    } catch (error) {
      // Show error toast but preserve user input
      showError(error)
    }
  }

  /**
   * Handle keyboard events (Enter for quick creation)
   */
  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault()
      await createTask()
    }
  }

  return (
    <div className="mb-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={getPlaceholder()}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   placeholder-gray-400 dark:placeholder-gray-500"
        aria-label="Quick add task"
      />
    </div>
  )
}

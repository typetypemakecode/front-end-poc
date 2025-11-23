import { useState, type KeyboardEvent } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { dataService } from '../services/dataService'
import { showError } from '../lib/toastUtils'
import { Calendar } from '@/components/ui/calendar'
import type { CreateTaskInput, TaskPriority } from '../types/task'

interface QuickAddTaskProps {
  selectedListId: string | null
  onTaskCreated: () => void
}

const SMART_LISTS = ['inbox', 'today', 'upcoming', 'past_due', 'tags', 'anytime', 'someday', 'logbook']

export function QuickAddTask({ selectedListId, onTaskCreated }: QuickAddTaskProps) {
  const [title, setTitle] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('low')
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [showCalendar, setShowCalendar] = useState(false)

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
   * Create task with context-aware defaults or expanded form values
   */
  const createTask = async () => {
    const trimmedTitle = title.trim()

    // Validate: empty title
    if (!trimmedTitle) {
      return
    }

    try {
      // Build task input with context-aware defaults or expanded form values
      const taskInput: CreateTaskInput = {
        title: trimmedTitle,
        priority: expanded ? priority : 'low',
        status: 'active'
      }

      // Add description if in expanded mode
      if (expanded && description.trim()) {
        taskInput.description = description.trim()
      }

      // Add tags if in expanded mode
      if (expanded && tags.trim()) {
        // Split by commas and trim each tag
        taskInput.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      }

      // Add dueDate - use expanded form value if set, otherwise use contextual
      if (expanded && dueDate) {
        taskInput.dueDate = format(dueDate, 'yyyy-MM-dd')
      } else if (!expanded) {
        const contextualDueDate = getContextualDueDate()
        if (contextualDueDate) {
          taskInput.dueDate = contextualDueDate
        }
      }

      // Add contextual listId if applicable
      const listId = getContextualListId()
      if (listId) {
        taskInput.listId = listId
      }

      // Create task via data service
      await dataService.createTask(taskInput)

      // Reset form on success
      resetForm()

      // Trigger refresh cascade
      onTaskCreated()
    } catch (error) {
      // Show error toast but preserve user input
      showError(error)
    }
  }

  /**
   * Reset all form fields and collapse
   */
  const resetForm = () => {
    setTitle('')
    setExpanded(false)
    setDescription('')
    setTags('')
    setPriority('low')
    setDueDate(undefined)
    setShowCalendar(false)
  }

  /**
   * Handle keyboard events for title input
   * Enter: Quick creation
   * Cmd+Enter / Ctrl+Enter: Expand form
   * Escape: Collapse or clear
   */
  const handleTitleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    // Cmd+Enter (Mac) or Ctrl+Enter (Windows) - Expand form
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      setExpanded(true)
      return
    }

    // Enter - Quick creation (only if not expanded)
    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey && !expanded) {
      e.preventDefault()
      await createTask()
      return
    }

    // Escape - Collapse if expanded, clear if not
    if (e.key === 'Escape') {
      e.preventDefault()
      if (expanded) {
        setExpanded(false)
      } else {
        setTitle('')
      }
    }
  }

  /**
   * Handle cancel button click in expanded form
   */
  const handleCancel = () => {
    setExpanded(false)
    setDescription('')
    setTags('')
    setPriority('low')
    setDueDate(undefined)
    setShowCalendar(false)
  }

  /**
   * Handle form submission in expanded mode
   */
  const handleExpandedSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createTask()
  }

  return (
    <div className="mb-4">
      {/* Title Input - Always Visible */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleTitleKeyDown}
        placeholder={getPlaceholder()}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   placeholder-gray-400 dark:placeholder-gray-500"
        aria-label="Quick add task"
      />

      {/* Expanded Form - Shown when user presses Cmd+Enter / Ctrl+Enter */}
      {expanded && (
        <form onSubmit={handleExpandedSubmit} className="mt-3 space-y-3 p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900">
          {/* Description Field */}
          <div>
            <label htmlFor="task-description" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Description (optional)
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setShowCalendar(false)}
              placeholder="Add more details..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder-gray-400 dark:placeholder-gray-500 resize-none"
            />
          </div>

          {/* Tags Field */}
          <div>
            <label htmlFor="task-tags" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Tags (optional, comma-separated)
            </label>
            <input
              id="task-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              onFocus={() => setShowCalendar(false)}
              placeholder="work, urgent, ideas"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Priority Selector */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Priority
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="low"
                  checked={priority === 'low'}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  onClick={() => setShowCalendar(false)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Low</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="medium"
                  checked={priority === 'medium'}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  onClick={() => setShowCalendar(false)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Medium</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="high"
                  checked={priority === 'high'}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  onClick={() => setShowCalendar(false)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">High</span>
              </label>
            </div>
          </div>

          {/* Due Date Picker */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Due Date (optional)
            </label>
            <div
              onClick={() => setShowCalendar(!showCalendar)}
              onFocus={() => setShowCalendar(true)}
              tabIndex={0}
              role="button"
              aria-label="Select due date"
              className="w-full flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-md
                         bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
                         transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <CalendarIcon className="size-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm flex-1 text-gray-900 dark:text-gray-100">
                {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
              </span>
              {dueDate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDueDate(undefined)
                  }}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            {showCalendar && (
              <div className="mt-2 h-[350px] overflow-hidden flex justify-center">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date)
                    setShowCalendar(false)
                  }}
                  className="rounded-md border border-gray-300 dark:border-gray-600"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md
                         text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md
                         hover:bg-blue-600 transition-colors disabled:opacity-50
                         disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

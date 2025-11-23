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
    <div className="mb-4 pt-2">
      {/* Title Input - Always Visible */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleTitleKeyDown}
        placeholder={getPlaceholder()}
        className="w-full px-3 py-2 bg-background border border-border rounded-md
                   focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                   placeholder:text-muted-foreground"
        aria-label="Quick add task"
      />

      {/* Expanded Form - Shown when user presses Cmd+Enter / Ctrl+Enter */}
      {expanded && (
        <form onSubmit={handleExpandedSubmit} className="mt-3 space-y-3 p-4 border border-border rounded-md bg-muted/30">
          {/* Description Field */}
          <div>
            <label htmlFor="task-description" className="block text-sm font-medium mb-1">
              Description (optional)
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setShowCalendar(false)}
              placeholder="Add more details..."
              rows={3}
              className="w-full px-3 py-2 bg-background border border-border rounded-md
                         focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                         placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Tags Field */}
          <div>
            <label htmlFor="task-tags" className="block text-sm font-medium mb-1">
              Tags (optional, comma-separated)
            </label>
            <input
              id="task-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              onFocus={() => setShowCalendar(false)}
              placeholder="work, urgent, ideas"
              className="w-full px-3 py-2 bg-background border border-border rounded-md
                         focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                         placeholder:text-muted-foreground"
            />
          </div>

          {/* Priority Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">
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
                <span className="text-sm">Low</span>
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
                <span className="text-sm">Medium</span>
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
                <span className="text-sm">High</span>
              </label>
            </div>
          </div>

          {/* Due Date Picker */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Due Date (optional)
            </label>
            <div
              onClick={() => setShowCalendar(!showCalendar)}
              onFocus={() => setShowCalendar(true)}
              tabIndex={0}
              role="button"
              aria-label="Select due date"
              className="w-full flex items-center gap-2 p-3 border border-border rounded-md
                         bg-background hover:bg-accent/10
                         transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <CalendarIcon className="size-4 text-muted-foreground" />
              <span className="text-sm flex-1">
                {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
              </span>
              {dueDate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDueDate(undefined)
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
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
                  className="rounded-md border border-border"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm border border-border rounded-md
                         hover:bg-accent/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 text-sm bg-accent text-background rounded-md
                         hover:bg-accent/90 transition-colors disabled:opacity-50
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

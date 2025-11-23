// @ts-nocheck - Suppressing unused variable errors during initial component setup
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { dataService } from '../services/dataService'
import { showError, toast } from '../lib/toastUtils'
import { Calendar } from '@/components/ui/calendar'
import Modal from './modal'
import type { TaskData, UpdateTaskInput, TaskPriority, TaskStatus } from '../types/task'
import type { SidebarItemData } from '../types/sidebar'

interface EditTaskModalProps {
  task: TaskData
  isOpen: boolean
  onClose: () => void
  onSave: (updates: UpdateTaskInput) => Promise<void>
  onArchive: (taskId: string) => Promise<void>
  areas: SidebarItemData[]
  projects: SidebarItemData[]
}

export function EditTaskModal({
  task,
  isOpen,
  onClose,
  onSave,
  onArchive,
  areas,
  projects
}: EditTaskModalProps) {
  // Form state initialized from task
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [tags, setTags] = useState(task.tags?.join(', ') || '')
  const [priority, setPriority] = useState<TaskPriority>(task.priority)
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined
  )
  const [listId, setListId] = useState<string | undefined>(task.listId)
  const [showCalendar, setShowCalendar] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when task changes
  useEffect(() => {
    setTitle(task.title)
    setDescription(task.description || '')
    setTags(task.tags?.join(', ') || '')
    setPriority(task.priority)
    setStatus(task.status)
    setDueDate(task.dueDate ? new Date(task.dueDate) : undefined)
    setListId(task.listId)
    setShowCalendar(false)
    setIsSubmitting(false)
  }, [task])

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      return // Validation: title required
    }

    setIsSubmitting(true)

    try {
      // Build update object with only changed fields
      const updates: UpdateTaskInput = {}

      if (trimmedTitle !== task.title) {
        updates.title = trimmedTitle
      }

      const trimmedDescription = description.trim()
      if (trimmedDescription !== (task.description || '')) {
        updates.description = trimmedDescription || undefined
      }

      if (priority !== task.priority) {
        updates.priority = priority
      }

      if (status !== task.status) {
        updates.status = status
      }

      // Parse tags
      const parsedTags = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
      const currentTags = task.tags || []
      if (JSON.stringify(parsedTags) !== JSON.stringify(currentTags)) {
        updates.tags = parsedTags.length > 0 ? parsedTags : undefined
      }

      // Format due date
      const formattedDueDate = dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined
      if (formattedDueDate !== task.dueDate) {
        updates.dueDate = formattedDueDate
      }

      if (listId !== task.listId) {
        updates.listId = listId
      }

      // Only call onSave if there are changes
      if (Object.keys(updates).length > 0) {
        await onSave(updates)
        toast({ title: 'Task updated successfully' })
      }

      onClose()
    } catch (error) {
      showError(error)
      setIsSubmitting(false)
    }
  }

  /**
   * Handle archive action
   */
  const handleArchive = async () => {
    setIsSubmitting(true)

    try {
      await onArchive(task.id)
      toast({ title: 'Task archived' })
      onClose()
    } catch (error) {
      showError(error)
      setIsSubmitting(false)
    }
  }

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Task"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Title Field */}
        <div>
          <label htmlFor="edit-task-title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            id="edit-task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full px-3 py-2 bg-background border border-border rounded-md
                       focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                       placeholder:text-muted-foreground"
            autoFocus
            disabled={isSubmitting}
          />
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="edit-task-description" className="block text-sm font-medium mb-1">
            Description (optional)
          </label>
          <textarea
            id="edit-task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onFocus={() => setShowCalendar(false)}
            placeholder="Add more details..."
            rows={3}
            className="w-full px-3 py-2 bg-background border border-border rounded-md
                       focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                       placeholder:text-muted-foreground resize-none"
            disabled={isSubmitting}
          />
        </div>

        {/* Area/Project Field */}
        <div>
          <label htmlFor="edit-task-list" className="block text-sm font-medium mb-1">
            Area/Project (optional)
          </label>
          <select
            id="edit-task-list"
            value={listId || ''}
            onChange={(e) => setListId(e.target.value || undefined)}
            onFocus={() => setShowCalendar(false)}
            className="w-full px-3 py-2 bg-background border border-border rounded-md
                       focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                       text-sm"
            disabled={isSubmitting}
          >
            <option value="">None (Inbox)</option>
            {areas.length > 0 && (
              <optgroup label="Areas">
                {areas.map((area) => (
                  <option key={area.key} value={area.key}>
                    {area.title}
                  </option>
                ))}
              </optgroup>
            )}
            {projects.length > 0 && (
              <optgroup label="Projects">
                {projects.map((project) => (
                  <option key={project.key} value={project.key}>
                    {project.title}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* Tags Field */}
        <div>
          <label htmlFor="edit-task-tags" className="block text-sm font-medium mb-1">
            Tags (optional, comma-separated)
          </label>
          <input
            id="edit-task-tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            onFocus={() => setShowCalendar(false)}
            placeholder="work, urgent, ideas"
            className="w-full px-3 py-2 bg-background border border-border rounded-md
                       focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                       placeholder:text-muted-foreground"
            disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              <span className="text-sm">High</span>
            </label>
          </div>
        </div>

        {/* Status Selector */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Status
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="active"
                checked={status === 'active'}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                onClick={() => setShowCalendar(false)}
                className="mr-2"
                disabled={isSubmitting}
              />
              <span className="text-sm">Active</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="completed"
                checked={status === 'completed'}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                onClick={() => setShowCalendar(false)}
                className="mr-2"
                disabled={isSubmitting}
              />
              <span className="text-sm">Completed</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="archived"
                checked={status === 'archived'}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                onClick={() => setShowCalendar(false)}
                className="mr-2"
                disabled={isSubmitting}
              />
              <span className="text-sm">Archived</span>
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
                disabled={isSubmitting}
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
        <div className="flex gap-2 justify-between pt-2">
          <button
            type="button"
            onClick={handleArchive}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm border border-red-500/50 text-red-500 rounded-md
                       hover:bg-red-500/10 transition-colors disabled:opacity-50
                       disabled:cursor-not-allowed"
          >
            Archive
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm border border-border rounded-md
                         hover:bg-accent/10 transition-colors disabled:opacity-50
                         disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="px-4 py-2 text-sm bg-accent text-background rounded-md
                         hover:bg-accent/90 transition-colors disabled:opacity-50
                         disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

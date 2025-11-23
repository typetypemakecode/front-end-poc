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

  return null // Placeholder
}

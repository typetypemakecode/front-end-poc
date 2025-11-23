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

  return null // Placeholder
}

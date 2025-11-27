import { useState } from 'react'
import { ChevronDown, ChevronRight, Pencil, Trash2, Check, X } from 'lucide-react'
import type { NoteSection as NoteSectionType } from '../types/notes'

interface NoteSectionProps {
  section: NoteSectionType
  isCollapsed: boolean
  onToggleCollapse: () => void
  onUpdate: (updates: { title?: string; content?: string }) => Promise<void>
  onDelete: () => Promise<void>
  disabled?: boolean
}

export function NoteSection({
  section,
  isCollapsed,
  onToggleCollapse,
  onUpdate,
  onDelete,
  disabled = false
}: NoteSectionProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingContent, setIsEditingContent] = useState(false)
  const [editTitle, setEditTitle] = useState(section.title)
  const [editContent, setEditContent] = useState(section.content)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSaveTitle = async () => {
    const trimmed = editTitle.trim()
    if (!trimmed || trimmed === section.title) {
      setEditTitle(section.title)
      setIsEditingTitle(false)
      return
    }

    setIsSubmitting(true)
    try {
      await onUpdate({ title: trimmed })
      setIsEditingTitle(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveContent = async () => {
    if (editContent === section.content) {
      setIsEditingContent(false)
      return
    }

    setIsSubmitting(true)
    try {
      await onUpdate({ content: editContent })
      setIsEditingContent(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelTitle = () => {
    setEditTitle(section.title)
    setIsEditingTitle(false)
  }

  const handleCancelContent = () => {
    setEditContent(section.content)
    setIsEditingContent(false)
  }

  const handleDelete = async () => {
    if (window.confirm('Delete this section?')) {
      setIsSubmitting(true)
      try {
        await onDelete()
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="border border-border rounded-md bg-card/50 group">
      {/* Header */}
      <div className="flex items-center gap-2 p-2 hover:bg-accent/5 transition-colors">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
          disabled={disabled || isSubmitting}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {isEditingTitle ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 px-2 py-1 text-sm bg-background border border-border rounded
                         focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              autoFocus
              disabled={isSubmitting}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle()
                if (e.key === 'Escape') handleCancelTitle()
              }}
            />
            <button
              type="button"
              onClick={handleSaveTitle}
              disabled={isSubmitting}
              className="p-1 text-accent hover:text-accent/80 transition-colors"
              aria-label="Save title"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCancelTitle}
              disabled={isSubmitting}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cancel editing"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <span
              className="flex-1 text-sm font-medium cursor-pointer hover:text-accent transition-colors"
              onClick={() => !disabled && setIsEditingTitle(true)}
            >
              {section.title}
            </span>
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              disabled={disabled || isSubmitting}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Edit title"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={disabled || isSubmitting}
              className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
              aria-label="Delete section"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </>
        )}
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="px-3 pb-3">
          {isEditingContent ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md
                           focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                           placeholder:text-muted-foreground resize-none min-h-[100px]"
                placeholder="Add notes..."
                disabled={isSubmitting}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancelContent}
                  disabled={isSubmitting}
                  className="px-3 py-1 text-sm border border-border rounded-md
                             hover:bg-accent/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveContent}
                  disabled={isSubmitting}
                  className="px-3 py-1 text-sm bg-accent text-background rounded-md
                             hover:bg-accent/90 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => !disabled && setIsEditingContent(true)}
              className="text-sm text-muted-foreground cursor-pointer hover:text-foreground
                         transition-colors min-h-[40px] whitespace-pre-wrap"
            >
              {section.content || (
                <span className="italic">Click to add notes...</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

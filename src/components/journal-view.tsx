import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { dataService } from '../services/dataService'
import type { JournalEntry } from '../types/notes'

interface JournalViewProps {
  listId: string
  listTitle: string
  onBack: () => void
}

export function JournalView({ listId, listTitle, onBack }: JournalViewProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [newEntryContent, setNewEntryContent] = useState('')
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadEntries = useCallback(async () => {
    try {
      const data = await dataService.getJournalEntries(listId)
      setEntries(data)
    } catch (error) {
      console.error('Failed to load journal entries:', error)
    } finally {
      setIsLoading(false)
    }
  }, [listId])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const handleAddEntry = async () => {
    const trimmed = newEntryContent.trim()
    if (!trimmed) return

    setIsSubmitting(true)
    try {
      await dataService.createJournalEntry(listId, { content: trimmed })
      setNewEntryContent('')
      setIsAddingEntry(false)
      await loadEntries()
    } catch (error) {
      console.error('Failed to create entry:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartEdit = (entry: JournalEntry) => {
    setEditingEntryId(entry.id)
    setEditContent(entry.content)
  }

  const handleSaveEdit = async () => {
    if (!editingEntryId) return

    const trimmed = editContent.trim()
    if (!trimmed) return

    setIsSubmitting(true)
    try {
      await dataService.updateJournalEntry(listId, editingEntryId, { content: trimmed })
      setEditingEntryId(null)
      setEditContent('')
      await loadEntries()
    } catch (error) {
      console.error('Failed to update entry:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingEntryId(null)
    setEditContent('')
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (!window.confirm('Delete this entry?')) return

    setIsSubmitting(true)
    try {
      await dataService.deleteJournalEntry(listId, entryId)
      await loadEntries()
    } catch (error) {
      console.error('Failed to delete entry:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to tasks"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-medium">{listTitle}</h2>
          <p className="text-sm text-muted-foreground">Journal</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Add entry button/form */}
        {isAddingEntry ? (
          <div className="mb-4 space-y-2">
            <textarea
              value={newEntryContent}
              onChange={(e) => setNewEntryContent(e.target.value)}
              placeholder="Write your entry..."
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md
                         focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                         placeholder:text-muted-foreground resize-none min-h-[120px]"
              autoFocus
              disabled={isSubmitting}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddingEntry(false)
                  setNewEntryContent('')
                }}
                disabled={isSubmitting}
                className="px-3 py-2 text-sm border border-border rounded-md
                           hover:bg-accent/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddEntry}
                disabled={!newEntryContent.trim() || isSubmitting}
                className="px-3 py-2 text-sm bg-accent text-background rounded-md
                           hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Entry'}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingEntry(true)}
            className="w-full mb-4 px-4 py-3 text-sm text-muted-foreground border border-dashed border-border rounded-md
                       hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="text-center text-muted-foreground py-8">
            Loading...
          </div>
        )}

        {/* Empty state */}
        {!isLoading && entries.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p>No journal entries yet.</p>
            <p className="text-sm mt-1">Start writing to capture your thoughts.</p>
          </div>
        )}

        {/* Entries */}
        <div className="space-y-4">
          {entries.map(entry => (
            <div
              key={entry.id}
              className="border border-border rounded-md bg-card/50 overflow-hidden"
            >
              {/* Entry header */}
              <div className="flex items-center justify-between px-3 py-2 bg-card/30 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  {format(new Date(entry.createdAt), 'PPP')}
                </span>
                <div className="flex items-center gap-1">
                  {editingEntryId === entry.id ? (
                    <>
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        disabled={isSubmitting}
                        className="p-1 text-accent hover:text-accent/80 transition-colors"
                        aria-label="Save changes"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Cancel editing"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(entry)}
                        disabled={isSubmitting}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Edit entry"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEntry(entry.id)}
                        disabled={isSubmitting}
                        className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Entry content */}
              <div className="px-3 py-3">
                {editingEntryId === entry.id ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md
                               focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                               resize-none min-h-[100px]"
                    autoFocus
                    disabled={isSubmitting}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronRight, Plus, BookOpen } from 'lucide-react'
import { NoteSection } from './note-section'
import { dataService } from '../services/dataService'
import type { NoteSection as NoteSectionType } from '../types/notes'

interface NotesPanelProps {
  listId: string
  listTitle: string
  onOpenJournal: () => void
}

export function NotesPanel({ listId, listTitle: _listTitle, onOpenJournal }: NotesPanelProps) {
  const [sections, setSections] = useState<NoteSectionType[]>([])
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem(`notes-collapsed-${listId}`)
    return stored === 'true'
  })
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(`collapsed-sections-${listId}`)
      return new Set(stored ? JSON.parse(stored) : [])
    } catch {
      return new Set()
    }
  })
  const [isAddingSection, setIsAddingSection] = useState(false)
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Load sections
  const loadSections = useCallback(async () => {
    try {
      const data = await dataService.getSections(listId)
      setSections(data)
    } catch (error) {
      console.error('Failed to load sections:', error)
    } finally {
      setIsLoading(false)
    }
  }, [listId])

  useEffect(() => {
    loadSections()
  }, [loadSections])

  // Persist collapse state
  useEffect(() => {
    localStorage.setItem(`notes-collapsed-${listId}`, String(isCollapsed))
  }, [listId, isCollapsed])

  useEffect(() => {
    localStorage.setItem(`collapsed-sections-${listId}`, JSON.stringify([...collapsedSections]))
  }, [listId, collapsedSections])

  // Reset state when listId changes
  useEffect(() => {
    setIsLoading(true)
    setIsAddingSection(false)
    setNewSectionTitle('')
    const stored = localStorage.getItem(`notes-collapsed-${listId}`)
    setIsCollapsed(stored === 'true')
    try {
      const storedSections = localStorage.getItem(`collapsed-sections-${listId}`)
      setCollapsedSections(new Set(storedSections ? JSON.parse(storedSections) : []))
    } catch {
      setCollapsedSections(new Set())
    }
  }, [listId])

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handleToggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  const handleAddSection = async () => {
    const trimmed = newSectionTitle.trim()
    if (!trimmed) return

    try {
      await dataService.createSection(listId, { title: trimmed })
      setNewSectionTitle('')
      setIsAddingSection(false)
      await loadSections()
    } catch (error) {
      console.error('Failed to create section:', error)
    }
  }

  const handleUpdateSection = async (sectionId: string, updates: { title?: string; content?: string }) => {
    try {
      await dataService.updateSection(listId, sectionId, updates)
      await loadSections()
    } catch (error) {
      console.error('Failed to update section:', error)
      throw error
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    try {
      await dataService.deleteSection(listId, sectionId)
      await loadSections()
    } catch (error) {
      console.error('Failed to delete section:', error)
      throw error
    }
  }

  if (isLoading) {
    return null // Don't show loading state, just hide until ready
  }

  return (
    <div className="mb-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={handleToggleCollapse}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          <span>Notes</span>
          {isCollapsed && sections.length > 0 && (
            <span className="text-xs">({sections.length} sections)</span>
          )}
        </button>

        <div className="flex-1" />

        <button
          type="button"
          onClick={onOpenJournal}
          className="p-1.5 text-muted-foreground hover:text-accent transition-colors"
          aria-label="Open journal"
          title="Open journal"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsAddingSection(true)}
          className="p-1.5 text-muted-foreground hover:text-accent transition-colors"
          aria-label="Add section"
          title="Add section"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="space-y-2">
          {/* Sections */}
          {sections.map(section => (
            <NoteSection
              key={section.id}
              section={section}
              isCollapsed={collapsedSections.has(section.id)}
              onToggleCollapse={() => handleToggleSectionCollapse(section.id)}
              onUpdate={(updates) => handleUpdateSection(section.id, updates)}
              onDelete={() => handleDeleteSection(section.id)}
            />
          ))}

          {/* Add section form */}
          {isAddingSection && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="Section title..."
                className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md
                           focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                           placeholder:text-muted-foreground"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSection()
                  if (e.key === 'Escape') {
                    setIsAddingSection(false)
                    setNewSectionTitle('')
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSection}
                disabled={!newSectionTitle.trim()}
                className="px-3 py-2 text-sm bg-accent text-background rounded-md
                           hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingSection(false)
                  setNewSectionTitle('')
                }}
                className="px-3 py-2 text-sm border border-border rounded-md
                           hover:bg-accent/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Empty state */}
          {sections.length === 0 && !isAddingSection && (
            <div className="text-sm text-muted-foreground italic py-2">
              No notes yet. Click + to add a section.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

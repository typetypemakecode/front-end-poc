# Notes for Projects and Areas - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add collapsible notes sections and timestamped journal entries to projects and areas.

**Architecture:** Extend sidebar data model with `sections` and `journal` arrays. NotesPanel component displays above TaskList with collapsible sections. Journal accessible via dedicated view mode.

**Tech Stack:** React, TypeScript, Tailwind CSS, Headless UI, date-fns, localStorage

---

## Task 1: Add Note Types

**Files:**
- Create: `src/types/notes.ts`

**Step 1: Create the notes types file**

```typescript
// src/types/notes.ts

/**
 * A section within a project/area for structured notes (goals, resources, etc.)
 */
export interface NoteSection {
  id: string;
  title: string;
  content: string; // Markdown for now, Block[] later
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * A timestamped journal entry for running logs
 */
export interface JournalEntry {
  id: string;
  content: string; // Markdown for now
  createdAt: string;
  updatedAt: string;
}

/**
 * Input for creating a new section
 */
export interface CreateSectionInput {
  title: string;
  content?: string;
}

/**
 * Input for updating a section
 */
export interface UpdateSectionInput {
  title?: string;
  content?: string;
  order?: number;
}

/**
 * Input for creating a journal entry
 */
export interface CreateJournalEntryInput {
  content: string;
}

/**
 * Input for updating a journal entry
 */
export interface UpdateJournalEntryInput {
  content: string;
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/types/notes.ts
git commit -m "feat: add note types for sections and journal entries"
```

---

## Task 2: Extend Sidebar Types

**Files:**
- Modify: `src/types/sidebar.ts`

**Step 1: Add note imports and extend SidebarItemData**

Add imports at top of file:
```typescript
import type { NoteSection, JournalEntry } from './notes';
```

Add to `SidebarItemData` interface (after `showCount?: boolean;`):
```typescript
  sections?: NoteSection[];
  journal?: JournalEntry[];
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/types/sidebar.ts
git commit -m "feat: extend SidebarItemData with sections and journal"
```

---

## Task 3: Extend IDataService Interface

**Files:**
- Modify: `src/services/IDataService.ts`

**Step 1: Add imports**

Add to existing imports:
```typescript
import type { NoteSection, JournalEntry, CreateSectionInput, UpdateSectionInput, CreateJournalEntryInput, UpdateJournalEntryInput } from '../types/notes';
```

**Step 2: Add note methods to interface**

Add after `reorderTasks` method:

```typescript
  // Note section operations

  /**
   * Gets all sections for a project/area
   * @param listId - The project or area key
   * @returns Promise<NoteSection[]>
   */
  getSections(listId: string): Promise<NoteSection[]>;

  /**
   * Creates a new section in a project/area
   * @param listId - The project or area key
   * @param input - Section data
   * @returns Promise<NoteSection>
   */
  createSection(listId: string, input: CreateSectionInput): Promise<NoteSection>;

  /**
   * Updates a section
   * @param listId - The project or area key
   * @param sectionId - The section ID
   * @param updates - Partial section data
   * @returns Promise<NoteSection>
   */
  updateSection(listId: string, sectionId: string, updates: UpdateSectionInput): Promise<NoteSection>;

  /**
   * Deletes a section
   * @param listId - The project or area key
   * @param sectionId - The section ID
   * @returns Promise<void>
   */
  deleteSection(listId: string, sectionId: string): Promise<void>;

  /**
   * Reorders sections within a project/area
   * @param listId - The project or area key
   * @param sectionIds - Array of section IDs in new order
   * @returns Promise<void>
   */
  reorderSections(listId: string, sectionIds: string[]): Promise<void>;

  // Journal entry operations

  /**
   * Gets all journal entries for a project/area
   * @param listId - The project or area key
   * @returns Promise<JournalEntry[]>
   */
  getJournalEntries(listId: string): Promise<JournalEntry[]>;

  /**
   * Creates a new journal entry
   * @param listId - The project or area key
   * @param input - Entry data
   * @returns Promise<JournalEntry>
   */
  createJournalEntry(listId: string, input: CreateJournalEntryInput): Promise<JournalEntry>;

  /**
   * Updates a journal entry
   * @param listId - The project or area key
   * @param entryId - The entry ID
   * @param updates - Entry data
   * @returns Promise<JournalEntry>
   */
  updateJournalEntry(listId: string, entryId: string, updates: UpdateJournalEntryInput): Promise<JournalEntry>;

  /**
   * Deletes a journal entry
   * @param listId - The project or area key
   * @param entryId - The entry ID
   * @returns Promise<void>
   */
  deleteJournalEntry(listId: string, entryId: string): Promise<void>;
```

**Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: TypeScript errors about missing implementations in LocalDataService (expected)

**Step 4: Commit**

```bash
git add src/services/IDataService.ts
git commit -m "feat: add note methods to IDataService interface"
```

---

## Task 4: Implement LocalDataService Note Methods

**Files:**
- Modify: `src/services/LocalDataService.ts`

**Step 1: Add imports**

Add to existing imports:
```typescript
import type { NoteSection, JournalEntry, CreateSectionInput, UpdateSectionInput, CreateJournalEntryInput, UpdateJournalEntryInput } from '../types/notes';
```

**Step 2: Add helper methods for finding items**

Add after `generateTaskId()` method:

```typescript
  /**
   * Finds a project or area by key
   */
  private findListItem(listId: string): SidebarItemData | null {
    const area = this.localData.areas.find(a => a.key === listId);
    if (area) return area;
    const project = this.localData.projects.find(p => p.key === listId);
    return project || null;
  }

  /**
   * Generates a unique ID for a section
   */
  private generateSectionId(): string {
    return `section-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Generates a unique ID for a journal entry
   */
  private generateJournalEntryId(): string {
    return `journal-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
```

**Step 3: Add section methods**

Add after the helper methods:

```typescript
  // Note section methods

  async getSections(listId: string): Promise<NoteSection[]> {
    const item = this.findListItem(listId);
    if (!item) {
      return [];
    }
    const sections = item.sections || [];
    // Sort by order
    return [...sections].sort((a, b) => a.order - b.order);
  }

  async createSection(listId: string, input: CreateSectionInput): Promise<NoteSection> {
    const item = this.findListItem(listId);
    if (!item) {
      throw new Error(`List with id ${listId} not found`);
    }

    if (!item.sections) {
      item.sections = [];
    }

    const now = new Date().toISOString();
    const maxOrder = item.sections.reduce((max, s) => Math.max(max, s.order), -1);

    const newSection: NoteSection = {
      id: this.generateSectionId(),
      title: input.title,
      content: input.content || '',
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now
    };

    item.sections.push(newSection);
    this.persistLocalData();

    return { ...newSection };
  }

  async updateSection(listId: string, sectionId: string, updates: UpdateSectionInput): Promise<NoteSection> {
    const item = this.findListItem(listId);
    if (!item || !item.sections) {
      throw new Error(`List with id ${listId} not found`);
    }

    const sectionIndex = item.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) {
      throw new Error(`Section with id ${sectionId} not found`);
    }

    const updatedSection: NoteSection = {
      ...item.sections[sectionIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    item.sections[sectionIndex] = updatedSection;
    this.persistLocalData();

    return { ...updatedSection };
  }

  async deleteSection(listId: string, sectionId: string): Promise<void> {
    const item = this.findListItem(listId);
    if (!item || !item.sections) {
      throw new Error(`List with id ${listId} not found`);
    }

    const sectionIndex = item.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) {
      throw new Error(`Section with id ${sectionId} not found`);
    }

    item.sections.splice(sectionIndex, 1);
    this.persistLocalData();
  }

  async reorderSections(listId: string, sectionIds: string[]): Promise<void> {
    const item = this.findListItem(listId);
    if (!item || !item.sections) {
      throw new Error(`List with id ${listId} not found`);
    }

    sectionIds.forEach((id, index) => {
      const section = item.sections!.find(s => s.id === id);
      if (section) {
        section.order = index;
        section.updatedAt = new Date().toISOString();
      }
    });

    this.persistLocalData();
  }
```

**Step 4: Add journal methods**

Add after section methods:

```typescript
  // Journal entry methods

  async getJournalEntries(listId: string): Promise<JournalEntry[]> {
    const item = this.findListItem(listId);
    if (!item) {
      return [];
    }
    const entries = item.journal || [];
    // Sort by createdAt descending (newest first)
    return [...entries].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createJournalEntry(listId: string, input: CreateJournalEntryInput): Promise<JournalEntry> {
    const item = this.findListItem(listId);
    if (!item) {
      throw new Error(`List with id ${listId} not found`);
    }

    if (!item.journal) {
      item.journal = [];
    }

    const now = new Date().toISOString();

    const newEntry: JournalEntry = {
      id: this.generateJournalEntryId(),
      content: input.content,
      createdAt: now,
      updatedAt: now
    };

    item.journal.push(newEntry);
    this.persistLocalData();

    return { ...newEntry };
  }

  async updateJournalEntry(listId: string, entryId: string, updates: UpdateJournalEntryInput): Promise<JournalEntry> {
    const item = this.findListItem(listId);
    if (!item || !item.journal) {
      throw new Error(`List with id ${listId} not found`);
    }

    const entryIndex = item.journal.findIndex(e => e.id === entryId);
    if (entryIndex === -1) {
      throw new Error(`Journal entry with id ${entryId} not found`);
    }

    const updatedEntry: JournalEntry = {
      ...item.journal[entryIndex],
      content: updates.content,
      updatedAt: new Date().toISOString()
    };

    item.journal[entryIndex] = updatedEntry;
    this.persistLocalData();

    return { ...updatedEntry };
  }

  async deleteJournalEntry(listId: string, entryId: string): Promise<void> {
    const item = this.findListItem(listId);
    if (!item || !item.journal) {
      throw new Error(`List with id ${listId} not found`);
    }

    const entryIndex = item.journal.findIndex(e => e.id === entryId);
    if (entryIndex === -1) {
      throw new Error(`Journal entry with id ${entryId} not found`);
    }

    item.journal.splice(entryIndex, 1);
    this.persistLocalData();
  }
```

**Step 5: Verify TypeScript compiles**

Run: `npm run build`
Expected: No TypeScript errors

**Step 6: Commit**

```bash
git add src/services/LocalDataService.ts
git commit -m "feat: implement note methods in LocalDataService"
```

---

## Task 5: Create NoteSection Component

**Files:**
- Create: `src/components/note-section.tsx`

**Step 1: Create the NoteSection component**

```typescript
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
    <div className="border border-border rounded-md bg-card/50">
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
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/components/note-section.tsx
git commit -m "feat: create NoteSection component"
```

---

## Task 6: Create NotesPanel Component

**Files:**
- Create: `src/components/notes-panel.tsx`

**Step 1: Create the NotesPanel component**

```typescript
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

export function NotesPanel({ listId, listTitle, onOpenJournal }: NotesPanelProps) {
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
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/components/notes-panel.tsx
git commit -m "feat: create NotesPanel component"
```

---

## Task 7: Create JournalView Component

**Files:**
- Create: `src/components/journal-view.tsx`

**Step 1: Create the JournalView component**

```typescript
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
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/components/journal-view.tsx
git commit -m "feat: create JournalView component"
```

---

## Task 8: Integrate Notes into MainContent

**Files:**
- Modify: `src/components/main-content.tsx`

**Step 1: Add imports**

Add to existing imports:
```typescript
import { NotesPanel } from './notes-panel'
import { JournalView } from './journal-view'
```

**Step 2: Add viewMode state and list title state**

Add after existing useState hooks:
```typescript
const [viewMode, setViewMode] = useState<'tasks' | 'journal'>('tasks');
const [selectedListTitle, setSelectedListTitle] = useState<string>('');
```

**Step 3: Add effect to load list title and reset view mode**

Add after existing useEffect:
```typescript
// Load selected list title and reset view mode when list changes
useEffect(() => {
    setViewMode('tasks');
    if (selectedListId) {
        const config = dataService.getLocalSidebarConfig();
        const area = config.areas.find(a => a.key === selectedListId);
        const project = config.projects.find(p => p.key === selectedListId);
        setSelectedListTitle(area?.title || project?.title || '');
    } else {
        setSelectedListTitle('');
    }
}, [selectedListId]);
```

**Step 4: Add helper to check if selected list is an area/project**

Add after the state hooks:
```typescript
// Check if selected list is an area or project (not a smart list)
const isAreaOrProject = selectedListId && !['inbox', 'today', 'upcoming', 'past_due', 'tags', 'anytime', 'someday', 'logbook'].includes(selectedListId);
```

**Step 5: Update return statement**

Replace the entire return statement with:
```typescript
return (
    <div className='h-full px-4 py-4 flex flex-col overflow-hidden'>
        {/* Journal View */}
        {viewMode === 'journal' && selectedListId && selectedListTitle && (
            <JournalView
                listId={selectedListId}
                listTitle={selectedListTitle}
                onBack={() => setViewMode('tasks')}
            />
        )}

        {/* Tasks View */}
        {viewMode === 'tasks' && (
            <>
                {/* Notes Panel - only show for areas/projects */}
                {isAreaOrProject && selectedListTitle && (
                    <NotesPanel
                        listId={selectedListId}
                        listTitle={selectedListTitle}
                        onOpenJournal={() => setViewMode('journal')}
                    />
                )}

                <div className="flex flex-row text-muted-foreground text-xl" role="toolbar" aria-label="Task filters and actions">
                    <div className="flex items-center gap-3" role="group" aria-label="Status filters">
                        <button
                            key={1}
                            type="button"
                            className={`px-3 py-1 text-sm ${selectedFilterKey === 1 ? 'text-background bg-accent shadow-glow-emerald' : ' text-muted-foreground hover:bg-muted'} rounded`}
                            onClick={() => handleFilterChange(1)}
                            aria-pressed={selectedFilterKey === 1}
                            aria-label={`Show all tasks (${counts.all})`}
                        >
                            All ({counts.all})
                        </button>
                        <button
                            key={2}
                            type="button"
                            className={`px-3 py-1 text-sm ${selectedFilterKey === 2 ? 'text-background bg-accent shadow-glow-emerald' : ' text-muted-foreground hover:bg-muted'} rounded`}
                            onClick={() => handleFilterChange(2)}
                            aria-pressed={selectedFilterKey === 2}
                            aria-label={`Show active tasks (${counts.active})`}
                        >
                            Active ({counts.active})
                        </button>
                        <button
                            key={3}
                            type="button"
                            className={`px-3 py-1 text-sm ${selectedFilterKey === 3 ? 'text-background bg-accent shadow-glow-emerald' : ' text-muted-foreground hover:bg-muted'} rounded`}
                            onClick={() => handleFilterChange(3)}
                            aria-pressed={selectedFilterKey === 3}
                            aria-label={`Show completed tasks (${counts.completed})`}
                        >
                            Completed ({counts.completed})
                        </button>
                    </div>
                    <div className="justify-end flex flex-1 gap-4" role="group" aria-label="Task actions">
                        <button
                            type="button"
                            className='p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-accent'
                            aria-label="Filter tasks"
                        >
                            <Funnel className="w-6 h-6" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className='p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-accent'
                            aria-label="Sort tasks"
                        >
                            <ArrowUpNarrowWide className="w-6 h-6" aria-hidden="true" />
                        </button>
                    </div>
                </div>
                <div className='flex-1 overflow-y-auto px-4 space-y-2 min-h-0' role="region" aria-label="Task list">
                    <TaskList filterKey={selectedFilterKey} selectedListId={selectedListId || null} refreshKey={refreshKey} onCountsChange={handleCountsChange} />
                </div>
            </>
        )}
    </div>
)
```

**Step 6: Verify the app compiles and runs**

Run: `npm run build`
Expected: No TypeScript errors

Run: `npm run dev`
Expected: App runs, notes panel visible when selecting an area/project

**Step 7: Commit**

```bash
git add src/components/main-content.tsx
git commit -m "feat: integrate NotesPanel and JournalView into MainContent"
```

---

## Task 9: Manual Testing with Playwright

**Files:**
- None (testing only)

**Step 1: Start the development server if not running**

Run: `npm run dev`

**Step 2: Test notes panel visibility**

1. Open browser to localhost:5173
2. Click on an area (e.g., "Work") in the sidebar
3. Verify: Notes panel appears above the task filters with "Notes" header
4. Click on a smart list (e.g., "Today")
5. Verify: Notes panel is NOT shown for smart lists

**Step 3: Test section creation**

1. Click on an area (e.g., "Work")
2. Click the + button next to "Notes"
3. Enter "Goals" as section title
4. Click "Add"
5. Verify: Section appears with "Goals" title

**Step 4: Test section editing**

1. Click on the section content area
2. Enter some text
3. Click "Save"
4. Verify: Content is saved and displayed
5. Click on section title
6. Change the title
7. Press Enter
8. Verify: Title is updated

**Step 5: Test section collapse**

1. Click the chevron next to section title
2. Verify: Section content collapses
3. Click the main "Notes" chevron
4. Verify: Entire notes panel collapses
5. Refresh page
6. Verify: Collapse state is preserved

**Step 6: Test journal**

1. Click the book icon in the Notes header
2. Verify: Journal view opens
3. Click "New Entry"
4. Enter text and click "Add Entry"
5. Verify: Entry appears with today's date
6. Click Back arrow
7. Verify: Returns to task view
8. Click journal icon again
9. Verify: Entry is still there

**Step 7: Test existing functionality**

1. Verify task creation still works
2. Verify task editing still works
3. Verify task completion still works
4. Verify drag-and-drop still works
5. Verify sidebar counts still update correctly

**Step 8: Take screenshots documenting the features**

Use Playwright MCP to capture:
- Notes panel on a project
- Expanded section with content
- Journal view with entries

---

## Task 10: Final Commit and PR

**Step 1: Verify all tests pass**

Run: `npm run build`
Run: `npm run lint`

**Step 2: Review all changes**

Run: `git status`
Run: `git diff main`

**Step 3: Create final commit if needed**

If there are uncommitted changes:
```bash
git add -A
git commit -m "fix: address any remaining issues"
```

**Step 4: Push branch**

```bash
git push -u origin feature/project-notes
```

**Step 5: Create PR**

```bash
gh pr create --title "feat: add notes and journal to projects/areas" --body "$(cat <<'EOF'
## Summary

- Added collapsible notes sections to projects and areas
- Added timestamped journal entries with dedicated view
- Notes persist to localStorage
- Collapse state persists per project/area

## Changes

- New types: `NoteSection`, `JournalEntry` in `src/types/notes.ts`
- Extended `SidebarItemData` with `sections` and `journal` arrays
- Added 10 new data service methods for CRUD operations
- New components: `NoteSection`, `NotesPanel`, `JournalView`
- Integrated into `MainContent` with view mode switching

## Test plan

- [ ] Notes panel appears only for areas/projects (not smart lists)
- [ ] Can create, edit, delete sections
- [ ] Section content is editable inline
- [ ] Collapse state persists across page refreshes
- [ ] Journal entries can be created, edited, deleted
- [ ] Journal shows entries sorted by date (newest first)
- [ ] Existing task functionality unaffected

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Summary

This plan implements notes functionality in 10 tasks:

1. **Add Note Types** - Create type definitions
2. **Extend Sidebar Types** - Add sections/journal to SidebarItemData
3. **Extend IDataService** - Add interface methods
4. **Implement LocalDataService** - Add CRUD operations
5. **Create NoteSection** - Individual section component
6. **Create NotesPanel** - Container with collapse logic
7. **Create JournalView** - Dedicated journal page
8. **Integrate into MainContent** - Wire everything together
9. **Manual Testing** - Verify with Playwright
10. **Final Commit and PR** - Push and create PR

Each task has explicit file paths, complete code, and verification steps.

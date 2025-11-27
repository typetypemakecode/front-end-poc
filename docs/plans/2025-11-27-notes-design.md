# Notes for Projects and Areas - Design

## Overview

Add notes functionality to projects and areas, supporting two use cases:
1. **Structured header info** — Goals, resources, key decisions (visible with tasks)
2. **Running journal** — Timestamped entries for ongoing thoughts and updates (dedicated view)

## Design Decisions

- **Collapsible sections** above task list for structured info
- **Dedicated journal view** accessed via icon in project/area header
- **Markdown editing** to start, with data model supporting future block-based editor
- **Standalone notes** initially; searchable + linkable as future enhancement
- **Collapse state persists** per project/area

### Future Direction

Sections will evolve to support mixed content types (tasks, notes, checklists) within a single project/area — like a canvas with reorderable blocks. Current design accommodates this by keeping sections as a typed, ordered array.

## Data Model

### New Types

```typescript
// src/types/notes.ts

interface NoteSection {
  id: string;
  title: string;        // "Goals", "Resources", user-defined
  content: string;      // Markdown for now, Block[] later
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface JournalEntry {
  id: string;
  content: string;      // Markdown for now
  createdAt: string;    // Timestamp shown to user
  updatedAt: string;
}
```

### Extended SidebarItemData

```typescript
// src/types/sidebar.ts (additions)

interface SidebarItemData {
  // ...existing fields (key, title, iconName, count, priority, etc.)
  sections?: NoteSection[];    // Structured header info
  journal?: JournalEntry[];    // Running log
}
```

## UI Layout

### Main Content (with notes expanded)

```
┌─────────────────────────────────────────────────┐
│ [Project Title]                    [Notes icon] │
├─────────────────────────────────────────────────┤
│ ▼ Notes                            [+ Section]  │
│ ┌─────────────────────────────────────────────┐ │
│ │ ▸ Goals                                     │ │
│ │ ▸ Resources                                 │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ All (5)    Active (3)    Completed (2)          │
├─────────────────────────────────────────────────┤
│ □ Task 1                                        │
│ □ Task 2                                        │
└─────────────────────────────────────────────────┘
```

### Main Content (notes collapsed)

```
┌─────────────────────────────────────────────────┐
│ [Project Title]                    [Notes icon] │
├─────────────────────────────────────────────────┤
│ ▸ Notes (2 sections)               [+ Section]  │
├─────────────────────────────────────────────────┤
│ All (5)    Active (3)    Completed (2)          │
├─────────────────────────────────────────────────┤
│ □ Task 1                                        │
│ □ Task 2                                        │
└─────────────────────────────────────────────────┘
```

### Journal View

```
┌─────────────────────────────────────────────────┐
│ ← Back to [Project]              Journal        │
├─────────────────────────────────────────────────┤
│ [+ New entry]                                   │
├─────────────────────────────────────────────────┤
│ Nov 27, 2025                                    │
│ Met with team, decided to push deadline...      │
├─────────────────────────────────────────────────┤
│ Nov 25, 2025                                    │
│ Initial brainstorm on approach...               │
└─────────────────────────────────────────────────┘
```

### Collapse Behavior

- **Outer "Notes" toggle** — Collapses entire notes area to single line
- **Individual section toggles** — Collapse/expand each section independently
- **State persists** — Stored in localStorage per project/area

## Data Service Layer

### New Interface Methods

```typescript
// src/services/IDataService.ts (additions)

// Note sections
getSections(listId: string): Promise<NoteSection[]>;
createSection(listId: string, title: string, content?: string): Promise<NoteSection>;
updateSection(listId: string, sectionId: string, updates: {
  title?: string;
  content?: string;
  order?: number;
}): Promise<NoteSection>;
deleteSection(listId: string, sectionId: string): Promise<void>;

// Journal entries
getJournalEntries(listId: string): Promise<JournalEntry[]>;
createJournalEntry(listId: string, content: string): Promise<JournalEntry>;
updateJournalEntry(listId: string, entryId: string, content: string): Promise<JournalEntry>;
deleteJournalEntry(listId: string, entryId: string): Promise<void>;
```

### Storage Approach

Sections and journal entries embedded in sidebar config (areas/projects). This keeps related data together and simplifies export/import.

## Components

| Component | Purpose |
|-----------|---------|
| `NotesPanel.tsx` | Container for sections area, handles collapse state |
| `NoteSection.tsx` | Single section with title + content, inline editing |
| `NewSectionForm.tsx` | Form/input for creating new sections |
| `JournalView.tsx` | Full journal page with entry list |
| `JournalEntry.tsx` | Single timestamped entry, inline editing |
| `NewJournalEntryForm.tsx` | Input for creating new entries |
| `MarkdownEditor.tsx` | Simple textarea with markdown preview toggle |
| `MarkdownRenderer.tsx` | Renders markdown content |

### Component Hierarchy

```
MainContent
├── NotesPanel (collapsible)
│   ├── NoteSection (per section, each collapsible)
│   │   └── MarkdownEditor / MarkdownRenderer
│   └── NewSectionForm
├── TaskFilters (All/Active/Completed)
└── TaskList

JournalView (separate route or panel)
├── NewJournalEntryForm
└── JournalEntry (list)
    └── MarkdownEditor / MarkdownRenderer
```

## State Management

### App.tsx Additions

```typescript
// New state
const [viewMode, setViewMode] = useState<'tasks' | 'journal'>('tasks');
```

### NotesPanel Local State

```typescript
// Persisted to localStorage
const [notesCollapsed, setNotesCollapsed] = useState(() =>
  localStorage.getItem(`notes-collapsed-${listId}`) === 'true'
);

const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() =>
  new Set(JSON.parse(localStorage.getItem(`collapsed-sections-${listId}`) || '[]'))
);
```

### Data Flow

1. User selects project/area → `selectedListId` updates
2. `MainContent` fetches sections via `dataService.getSections(listId)`
3. User edits section → `dataService.updateSection()` → local state updates
4. User clicks journal icon → `viewMode` changes to `'journal'`
5. `JournalView` fetches entries via `dataService.getJournalEntries(listId)`
6. User adds entry → `dataService.createJournalEntry()` → list refreshes

Notes changes don't affect task counts, so no need to trigger global `refreshKey`.

## Implementation Phases

### Phase 1: Data layer + basic sections
- Add `NoteSection` and `JournalEntry` types
- Extend `IDataService` interface with note methods
- Implement in `LocalDataService`
- Create `NotesPanel` and `NoteSection` components
- Basic markdown textarea editing (no preview yet)

### Phase 2: Journal view
- Add `viewMode` state and navigation
- Create `JournalView` and `JournalEntry` components
- Journal icon in project/area header
- Back navigation to tasks

### Phase 3: Polish
- `MarkdownRenderer` for rendering content
- Collapse persistence (localStorage)
- Section reordering (drag-and-drop via @dnd-kit)
- Empty states and loading states

### Phase 4: Future enhancements (not in scope)
- Block-based editor (TipTap/BlockNote)
- Global search across notes
- Linking between notes/tasks
- Mixed section types (tasks + notes in same view)
- `ApiDataService` implementation

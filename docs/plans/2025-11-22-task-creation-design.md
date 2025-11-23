# Task Creation Feature Design

**Date:** 2025-11-22
**Status:** Approved

## Overview

Add inline task creation capability to the task list with context-aware defaults and optional expanded form for additional details.

## User Experience

### Entry Point
- Always-visible input field at the top of the task list
- Placeholder text changes based on context (e.g., "Add task to Work...")
- No click required to reveal - just start typing

### Quick Creation Flow
1. User types task title
2. Presses **Enter** → Task created immediately with context-aware defaults
3. Input clears, task appears in list, counts update

### Detailed Creation Flow
1. User types task title
2. Presses **Cmd+Enter** (Mac) / **Ctrl+Enter** (Windows)
3. Form expands inline to show:
   - Description (textarea)
   - Tags (text input)
   - Priority selector (Low/Med/High radio buttons)
   - Due date picker (calendar component)
4. User fills optional fields and clicks "Create" (or "Cancel" to collapse)

## Architecture

### New Component: `quick-add-task.tsx`

**Props:**
```typescript
interface QuickAddTaskProps {
  selectedListId: string | null;
  onTaskCreated: () => void;
}
```

**State:**
```typescript
const [title, setTitle] = useState('');
const [expanded, setExpanded] = useState(false);
const [description, setDescription] = useState('');
const [tags, setTags] = useState<string[]>([]);
const [priority, setPriority] = useState<TaskPriority>('low');
const [dueDate, setDueDate] = useState<Date | undefined>();
```

**Integration:**
- Add to `task-list.tsx` as first child before task items
- Pass `selectedListId` (already available in TaskList)
- Pass `onTaskCreated={onCountsChange}` to trigger refresh cascade

## Context-Aware Logic

### Smart List Handling

| Smart List | `listId` | `dueDate` | Notes |
|------------|----------|-----------|-------|
| inbox | `undefined` | `undefined` | Truly uncategorized |
| today | `undefined` | Today's date | Active tasks due today |
| upcoming | `undefined` | 3 days from now | Midpoint of 7-day range |
| past_due | N/A | N/A | Disable creation (derived view) |
| tags | `undefined` | `undefined` | Expand form to prompt for tags |
| anytime/someday/logbook | `undefined` | `undefined` | Not yet implemented |

### Area/Project Handling
- When viewing an area or project (e.g., "work", "home", "ios_app")
- Set `listId` to the selected area/project ID
- No automatic `dueDate` (user can set in expanded form)

### No Selection (All Tasks View)
- Create with no `listId`, no `dueDate`
- Task appears in Inbox

### Default Values
All new tasks receive:
- `priority: 'low'`
- `status: 'active'`
- `tags: []`
- `description: ''`
- Auto-generated: `id`, `createdAt`, `updatedAt`

## Data Flow

1. **User submits task:**
   ```typescript
   const taskInput: CreateTaskInput = {
     title: title.trim(),
     priority: expanded ? priority : 'low',
     status: 'active',
     description: expanded ? description : '',
     tags: expanded ? tags : [],
     dueDate: expanded ? formatDate(dueDate) : getContextualDueDate(),
     listId: getContextualListId()
   };
   ```

2. **Call data service:**
   ```typescript
   await dataService.createTask(taskInput);
   ```

3. **Trigger refresh:**
   ```typescript
   onTaskCreated(); // Cascades to sidebar counts + task list
   ```

4. **Reset form:**
   ```typescript
   setTitle('');
   setExpanded(false);
   // Reset other fields to defaults
   ```

## UI/UX Specifications

### Input Field Design
- Match existing task item styling (height, padding, borders)
- Focus state: accent border color
- Placeholder: "Add a task..." (context-aware)
- No auto-focus on page load

### Keyboard Interactions
- `Enter` → Create task with title only
- `Cmd+Enter` / `Ctrl+Enter` → Expand to full form
- `Escape` → Clear input (simple mode) or collapse (expanded mode)
- Standard tab navigation through form fields

### Expanded Form Layout
- Appears inline below title input
- Pushes existing tasks down (smooth transition)
- Full width of task items
- Fields stack vertically:
  1. Title (already filled, still editable)
  2. Description (textarea, 3 rows)
  3. Tags (text input with comma separation)
  4. Priority (radio group: Low/Med/High)
  5. Due date (calendar picker, reuse pattern from `new-list-form.tsx`)
  6. Actions: [Cancel] [Create] buttons

### Accessibility
- `aria-label="Quick add task"` on input
- Proper labels for all form fields
- Keyboard shortcut hint visible or discoverable
- Focus management when expanding/collapsing

## Error Handling

### Validation
- **Empty title:** Disable create button, show inline error
- **Trim whitespace:** Before validation and storage

### Network/Storage Failures
- Show toast notification (reuse existing toast pattern)
- Keep user's input text intact for retry
- Don't clear form on error

### Edge Cases
- **Past Due view:** Disable quick-add or show "Cannot create past due tasks" message
- **Very long title:** Store full text, handle display truncation in task component
- **Rapid creation:** Disable input during save operation
- **Special characters:** Handle properly (quotes, emojis, Unicode)

## Testing Strategy

### Unit Tests (`quick-add-task.test.ts`)
- ✓ Enter key creates task and clears input
- ✓ Cmd+Enter expands form
- ✓ Escape key clears/collapses appropriately
- ✓ Empty title validation prevents creation
- ✓ Context logic assigns correct `listId` for areas/projects
- ✓ Context logic assigns correct `dueDate` for smart lists
- ✓ Default values applied correctly (priority='low', status='active')

### Integration Tests
- ✓ Created task appears in task list immediately
- ✓ Sidebar counts update after creation
- ✓ Filter counts (All/Active/Completed) update correctly
- ✓ Task respects current list context
- ✓ Error state preserves user input
- ✓ Refresh cascade works (task list → sidebar → main content counts)

### Manual Testing Checklist
- [ ] Create task from each smart list (inbox, today, upcoming, tags)
- [ ] Create task from area and project views
- [ ] Create task from "All tasks" view (no selection)
- [ ] Verify keyboard shortcuts work (Enter, Cmd+Enter, Escape)
- [ ] Verify expanded form shows all fields
- [ ] Verify cancel button collapses without creating
- [ ] Verify validation prevents empty tasks
- [ ] Verify error handling shows toast and preserves input
- [ ] Verify accessibility (keyboard navigation, screen reader)

## Implementation Notes

### Dependencies
- Reuse `Calendar` component from `@/components/ui/calendar` (already used in `new-list-form.tsx`)
- Reuse date formatting from `date-fns` (already in project)
- Reuse toast pattern if available (check for existing toast implementation)

### Files to Modify
- **New:** `src/components/quick-add-task.tsx` (main component)
- **New:** `src/components/quick-add-task.test.ts` (unit tests)
- **Modify:** `src/components/task-list.tsx` (integrate QuickAddTask component)

### Type Safety
- Use existing types: `CreateTaskInput`, `TaskPriority`, `TaskStatus`
- No new types needed

## Open Questions / Future Enhancements
- Should we add a keyboard shortcut to focus the quick-add input? (e.g., `n` or `Cmd+N`)
- Should tags support autocomplete from existing tags?
- Should we show a visual indicator when task creation is in progress?
- Should expanded form remember last-used values (priority, tags) across sessions?

## Success Criteria
- ✓ Users can create tasks with just a title in under 2 seconds
- ✓ Tasks automatically assigned to correct list based on context
- ✓ Advanced users can add full details via Cmd+Enter
- ✓ No regressions to existing task list functionality
- ✓ All tests passing
- ✓ Accessible via keyboard and screen readers

# Task Editing Feature Design

**Date:** 2025-11-22
**Status:** Approved

## Overview

Add task editing capability with a modal dialog interface. Users can select a task and click an edit button to modify all task properties, including title, description, area/project assignment, tags, priority, status, and due date. Archive functionality replaces delete for safer, reversible task removal.

## User Experience

### Entry Point
- User clicks a task to select it (existing selection behavior)
- When selected, a small **Edit icon button** (pencil) appears in top-right corner of task card
- Clicking edit button opens "Edit Task" modal dialog

### User Flow

1. **Selection**: User clicks a task → card highlights with existing selected styling (green glow border)
2. **Edit trigger**: Edit button fades in at top-right corner of selected task card
3. **Modal opens**: Clicking edit button opens modal pre-populated with current task data
4. **Editing**: User modifies any fields (title, description, tags, priority, status, due date, area/project)
5. **Actions**: User can:
   - **Save** → Updates task, refreshes list, closes modal
   - **Archive** → Sets status to 'archived', refreshes list, closes modal
   - **Cancel** → Closes modal without changes
6. **Visual feedback**: After save/archive, task list and counts update automatically (reuse existing refresh cascade)

### Key Design Decisions
- Edit button only visible when task is selected (reduces visual clutter)
- Modal approach gives space for all fields without cramping the task list
- Archive (not delete) is safer and reversible
- Form is pre-populated, so users can quickly change just one field
- Reuses existing Modal component and form patterns from quick-add-task

## Architecture

### New Component: `edit-task-modal.tsx`

A dedicated modal component for editing tasks. Keeps editing logic separate from task display components.

**Props interface:**
```typescript
interface EditTaskModalProps {
  task: TaskData;           // The task being edited
  isOpen: boolean;          // Modal visibility
  onClose: () => void;      // Close without saving
  onSave: (updates: UpdateTaskInput) => Promise<void>;  // Save changes
  onArchive: (taskId: string) => Promise<void>;         // Archive task
  areas: SidebarItemData[]; // Available areas for dropdown
  projects: SidebarItemData[]; // Available projects for dropdown
}
```

### Integration Points

1. **task.tsx** - Add edit button
   - Small pencil icon (from lucide-react) in absolute position top-right
   - Only renders when `selected={true}`
   - onClick triggers opening the modal
   - Pass `onEdit` callback as prop

2. **task-list.tsx** - Manage modal state and callbacks
   - Add state: `const [editingTask, setEditingTask] = useState<TaskData | null>(null)`
   - Pass `onEdit` callback to each task: `onEdit={(task) => setEditingTask(task)}`
   - Render `<EditTaskModal>` with editing task when not null
   - Handle save: call `dataService.updateTask()`, refresh list
   - Handle archive: call `dataService.updateTask()` with `status: 'archived'`, refresh list
   - Fetch sidebar config for areas/projects dropdown

3. **Reusable pieces from quick-add-task:**
   - Calendar component for due date
   - Priority radio buttons
   - Form field styling patterns
   - Modal component

## Modal Form Structure

**Title**: "Edit Task"

**Form Fields (in order):**

1. **Title** (text input)
   - Pre-filled with current task title
   - Required field
   - Same styling as quick-add-task

2. **Description** (textarea)
   - Pre-filled with current description (or empty)
   - Optional
   - 3-4 rows height

3. **Area/Project** (select dropdown)
   - Options: "None (Inbox)", then all areas, then all projects
   - Grouped visually with separator or optgroup labels: "Areas" / "Projects"
   - Pre-selected to current `listId` value (or "None" if no listId)
   - onChange updates the listId that will be saved

4. **Tags** (text input)
   - Pre-filled with comma-separated current tags
   - Optional
   - Same pattern as quick-add-task

5. **Priority** (radio button group)
   - Options: Low, Medium, High
   - Pre-selected to current priority
   - Horizontal layout

6. **Status** (radio button group)
   - Options: Active, Completed, Archived
   - Pre-selected to current status
   - Horizontal layout
   - Allows users to un-archive if needed

7. **Due Date** (calendar picker)
   - Pre-filled with current due date (or empty)
   - Optional
   - Reuse calendar component from quick-add-task

**Action Buttons (bottom of modal):**
- **Left side**: [Archive] button (secondary/danger styling)
- **Right side**: [Cancel] [Save Changes] buttons

## Data Flow

### State Management in task-list.tsx

```typescript
const [editingTask, setEditingTask] = useState<TaskData | null>(null);
```

### Opening the Modal
1. Task component receives `onEdit` callback
2. User clicks edit button → `onEdit(task)` is called
3. task-list sets `setEditingTask(task)`
4. EditTaskModal renders with `isOpen={editingTask !== null}`

### Saving Changes

1. User modifies fields in modal, clicks "Save Changes"
2. Modal calls `onSave(updates)` with changed fields
3. task-list.tsx handles save:
   ```typescript
   const handleSave = async (updates: UpdateTaskInput) => {
     await dataService.updateTask(editingTask.id, updates);
     setEditingTask(null); // Close modal
     await onCountsChange(); // Trigger refresh cascade
   }
   ```
4. Refresh cascade updates: task list → counts → sidebar counts

### Archiving

1. User clicks "Archive" button
2. Modal calls `onArchive(taskId)`
3. task-list.tsx handles archive:
   ```typescript
   const handleArchive = async (taskId: string) => {
     await dataService.updateTask(taskId, { status: 'archived' });
     setEditingTask(null); // Close modal
     await onCountsChange(); // Trigger refresh cascade
   }
   ```

### Area/Project Dropdown Data
- task-list.tsx fetches sidebar config: `dataService.getLocalSidebarConfig()`
- Extracts areas and projects, passes to modal as props
- Ensures dropdown always shows current areas/projects

## Error Handling & Validation

### Validation Rules

1. **Title** - Required, cannot be empty or only whitespace
   - Disable "Save Changes" button if title is empty after trimming
   - Same validation as quick-add-task

2. **Tags** - Optional, split by comma and trim each
   - Filter out empty strings after splitting
   - Same validation as quick-add-task

3. **All other fields** - Optional, no special validation needed

### Error Scenarios

1. **Save fails (network/storage error)**
   - Show error toast using existing `showError()` from toastUtils
   - Keep modal open with user's changes intact (don't lose data)
   - User can retry or cancel

2. **Archive fails**
   - Same pattern: show error toast, keep modal open
   - User can retry or cancel

3. **Concurrent edits** (edge case)
   - Not handling in this phase
   - If two users edit same task, last write wins
   - Future: Could add optimistic locking with version numbers

### User Feedback

- **Success toast after save**: "Task updated successfully"
- **Success toast after archive**: "Task archived"
- **Error toast**: Reuse existing error handling from toastUtils
- **Loading state**: Disable buttons during save/archive operations to prevent double-clicks

### Edge Cases

- **Editing while task list filter changes**: Modal stays open, but task might disappear from list after save if it no longer matches filter (expected behavior)
- **Empty description/tags/dueDate**: Treat as clearing those fields (set to undefined in update)

## Files to Modify

- **New:** `src/components/edit-task-modal.tsx` (main component)
- **Modify:** `src/components/task.tsx` (add edit button)
- **Modify:** `src/components/task-list.tsx` (integrate EditTaskModal, manage state)

## Type Safety

- Use existing types: `TaskData`, `UpdateTaskInput`, `TaskPriority`, `TaskStatus`, `SidebarItemData`
- No new types needed

## Future Enhancements

**Out of scope for this phase:**

1. **View/Restore Archived Tasks**
   - Add "Archived" smart list or filter
   - Allow restoring archived tasks back to active
   - Bulk operations on archived tasks

2. **Delete Permanently**
   - Add ability to permanently delete archived tasks
   - With confirmation dialog for safety

3. **Keyboard Shortcuts**
   - Press "e" or "Enter" on selected task to open edit modal
   - Escape to close modal

4. **Optimistic Locking**
   - Prevent concurrent edit conflicts with version numbers
   - Show warning if task was modified by someone else

## Success Criteria

- ✓ Users can edit any task field through a modal dialog
- ✓ Edit button only appears on selected tasks
- ✓ Form is pre-populated with current values
- ✓ Archive functionality safely removes tasks (reversible)
- ✓ All changes trigger automatic refresh of lists and counts
- ✓ Validation prevents saving invalid data
- ✓ Error handling preserves user input on failures
- ✓ Accessible via keyboard and screen readers
- ✓ No regressions to existing task list functionality

# Task Editing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable users to edit existing tasks through a modal dialog interface with edit button on selected tasks.

**Architecture:** Add edit button to task component that appears on selection, create EditTaskModal component reusing quick-add-task form patterns, integrate with task-list for state management and data service calls.

**Tech Stack:** React, TypeScript, Tailwind CSS, Headless UI Modal, date-fns, lucide-react icons

---

## Task 1: Add Edit Button to Task Component

**Files:**
- Modify: `src/components/task.tsx`

**Step 1: Add onEdit prop to TaskProps interface**

In `src/components/task.tsx`, update the TaskProps interface (lines 8-20):

```typescript
export type TaskProps = {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    assignee?: string;
    tags?: Tag[];
    completed?: boolean;
    selected?: boolean;
    onclick?: (id: string) => void;
    onToggleComplete?: (id: string) => void;
    onEdit?: (id: string) => void; // Add this line
    dragHandle?: React.ReactNode;
}
```

**Step 2: Add Pencil icon import**

At the top of `src/components/task.tsx`, update the lucide-react import (line 1):

```typescript
import { Circle, CircleCheckBig, Pencil } from "lucide-react"
```

**Step 3: Add edit button to Task component**

In the Task component function, update the destructuring to include onEdit (line 22):

```typescript
export default function Task({ id, title, description, dueDate, assignee, tags, completed, selected, onclick, onToggleComplete, onEdit, dragHandle }: TaskProps) {
```

Then add the edit button inside the article element, after the flex container with dragHandle and circle button. Add this before the closing `</article>` tag (around line 77):

```typescript
            {/* Edit button - only visible when selected */}
            {selected && onEdit && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                    aria-label={`Edit task "${title}"`}
                    type="button"
                >
                    <Pencil className="w-4 h-4" aria-hidden="true" />
                </button>
            )}
        </article>
```

Also update the article element to add `relative` positioning (line 30):

```typescript
        <article
            className={`relative p-4 mt-6 ${selected ? 'bg-task-selected border border-primary shadow-glow-emerald' : 'bg-card border border-border'} rounded ${completed ? 'opacity-60' : ''} transition-opacity cursor-pointer`}
```

**Step 4: Update SortableTask to pass onEdit prop**

In `src/components/sortable-task.tsx`, update the function signature (line 7):

```typescript
export default function SortableTask({id, title, description, dueDate, assignee, tags, completed, selected, onclick, onToggleComplete, onEdit}: TaskProps) {
```

And pass it to the Task component (around line 30):

```typescript
            <Task
                id={id}
                title={title}
                description={description}
                dueDate={dueDate}
                assignee={assignee}
                tags={tags}
                completed={completed}
                selected={selected}
                onclick={onclick}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                dragHandle={dragHandleButton}
            />
```

**Step 5: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors

**Step 6: Commit**

```bash
git add src/components/task.tsx src/components/sortable-task.tsx
git commit -m "feat: add edit button to task component"
```

---

## Task 2: Create EditTaskModal Component (Part 1 - Structure and State)

**Files:**
- Create: `src/components/edit-task-modal.tsx`

**Step 1: Create component file with imports and interface**

Create `src/components/edit-task-modal.tsx`:

```typescript
import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { dataService } from '../services/dataService'
import { showError } from '../lib/toastUtils'
import { toast } from '../lib/toast'
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
  // State will be added in next step
  return null // Placeholder
}
```

**Step 2: Add component state**

Inside the EditTaskModal function, before the return statement, add state:

```typescript
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
```

**Step 3: Add effect to reset form when task changes**

After the state declarations, add useEffect:

```typescript
  // Reset form when task changes
  import { useEffect } from 'react' // Add to imports at top

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
```

Update the imports at the top to include useEffect:

```typescript
import { useState, useEffect } from 'react'
```

**Step 4: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors

**Step 5: Commit**

```bash
git add src/components/edit-task-modal.tsx
git commit -m "feat: create EditTaskModal component with state management"
```

---

## Task 3: Create EditTaskModal Component (Part 2 - Handlers)

**Files:**
- Modify: `src/components/edit-task-modal.tsx`

**Step 1: Add form submission handler**

After the useEffect, before the return statement, add:

```typescript
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
```

**Step 2: Add archive handler**

After handleSubmit, add:

```typescript
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
```

**Step 3: Add close handler**

After handleArchive, add:

```typescript
  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }
```

**Step 4: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors

**Step 5: Commit**

```bash
git add src/components/edit-task-modal.tsx
git commit -m "feat: add form handlers to EditTaskModal"
```

---

## Task 4: Create EditTaskModal Component (Part 3 - Form UI)

**Files:**
- Modify: `src/components/edit-task-modal.tsx`

**Step 1: Replace the return statement with Modal JSX**

Replace `return null` with the complete form:

```typescript
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
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors

**Step 3: Commit**

```bash
git add src/components/edit-task-modal.tsx
git commit -m "feat: add complete form UI to EditTaskModal"
```

---

## Task 5: Integrate EditTaskModal into TaskList

**Files:**
- Modify: `src/components/task-list.tsx`

**Step 1: Add imports**

At the top of `src/components/task-list.tsx`, add imports:

```typescript
import { EditTaskModal } from './edit-task-modal'
import type { UpdateTaskInput } from '../types/task'
```

**Step 2: Add state for editing task and sidebar config**

After the existing state declarations (around line 22), add:

```typescript
    const [editingTask, setEditingTask] = useState<TaskData | null>(null);
    const [areas, setAreas] = useState<SidebarItemData[]>([]);
    const [projects, setProjects] = useState<SidebarItemData[]>([]);
```

Also add the import for SidebarItemData at the top:

```typescript
import type { SidebarItemData } from '../types/sidebar'
```

**Step 3: Load sidebar config for areas/projects**

After the sensors configuration (around line 27), add a useEffect to load sidebar config:

```typescript
    // Load sidebar config for areas/projects dropdown
    useEffect(() => {
        const config = dataService.getLocalSidebarConfig();
        setAreas(config.areas || []);
        setProjects(config.projects || []);
    }, []);
```

**Step 4: Add edit handler**

After the handleDragEnd function (around line 113), add:

```typescript
    const handleEdit = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            setEditingTask(task);
        }
    };

    const handleSave = async (updates: UpdateTaskInput) => {
        if (!editingTask) return;

        await dataService.updateTask(editingTask.id, updates);
        setEditingTask(null);

        // Refresh counts and task list
        if (onCountsChange) {
            await onCountsChange();
        }
    };

    const handleArchive = async (taskId: string) => {
        await dataService.updateTask(taskId, { status: 'archived' });
        setEditingTask(null);

        // Refresh counts and task list
        if (onCountsChange) {
            await onCountsChange();
        }
    };
```

**Step 5: Pass onEdit to tasks**

In the task mapping (around line 140), add the onEdit prop:

```typescript
                                <SortableTask
                                    id={task.id}
                                    title={task.title}
                                    description={task.description}
                                    dueDate={task.dueDate}
                                    tags={task.tags?.map(tag => ({ label: tag, theme: 'emerald' as const }))}
                                    completed={task.status === 'completed'}
                                    selected={selectedTaskId === task.id}
                                    onclick={handleTaskClick}
                                    onToggleComplete={handleToggleComplete}
                                    onEdit={handleEdit}
                                />
```

**Step 6: Add EditTaskModal at the end**

After the closing `</>` fragment (around line 156), but before it, add the modal:

```typescript
            {/* Edit Task Modal */}
            {editingTask && (
                <EditTaskModal
                    task={editingTask}
                    isOpen={true}
                    onClose={() => setEditingTask(null)}
                    onSave={handleSave}
                    onArchive={handleArchive}
                    areas={areas}
                    projects={projects}
                />
            )}
        </>
```

**Step 7: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors

**Step 8: Commit**

```bash
git add src/components/task-list.tsx
git commit -m "feat: integrate EditTaskModal into TaskList"
```

---

## Task 6: Manual Testing with Playwright MCP

**Files:**
- None (testing only)

**Step 1: Start development server if not running**

Run: `npm run dev`
Expected: Server starts on http://localhost:5173

**Step 2: Test edit button appears on selection**

Using Playwright MCP:
1. Navigate to http://localhost:5173
2. Take snapshot of page
3. Click on a task in the list
4. Verify edit button (pencil icon) appears in top-right of selected task
5. Take screenshot to confirm

**Step 3: Test opening edit modal**

Using Playwright MCP:
1. Click the edit button on selected task
2. Verify modal opens with title "Edit Task"
3. Verify all fields are pre-populated with task data
4. Take screenshot to confirm

**Step 4: Test editing a task**

Using Playwright MCP:
1. Change the task title to "Updated Task Title"
2. Change description to "Updated description"
3. Change priority to "High"
4. Click "Save Changes"
5. Verify modal closes
6. Verify task in list shows updated title
7. Click task again and open edit modal
8. Verify changes persisted

**Step 5: Test area/project assignment**

Using Playwright MCP:
1. Open edit modal for a task
2. Change area/project dropdown to different value
3. Save changes
4. Navigate to that area/project in sidebar
5. Verify task appears in that list

**Step 6: Test archive functionality**

Using Playwright MCP:
1. Note the task count before archiving
2. Open edit modal for a task
3. Click "Archive" button
4. Verify modal closes
5. Verify task disappears from active list
6. Verify count decrements

**Step 7: Test validation**

Using Playwright MCP:
1. Open edit modal
2. Clear the title field
3. Verify "Save Changes" button is disabled
4. Add text back to title
5. Verify button is enabled again

**Step 8: Test cancel button**

Using Playwright MCP:
1. Open edit modal
2. Make some changes to fields
3. Click "Cancel"
4. Verify modal closes without saving
5. Reopen modal and verify original values

**Step 9: Document test results**

Create a comment summarizing:
- All features tested
- Any bugs found
- Screenshots showing functionality working

**Step 10: Commit if any fixes were needed**

If bugs were found and fixed during testing:
```bash
git add <fixed-files>
git commit -m "fix: address issues found during manual testing"
```

---

## Task 7: Verify No Regressions

**Files:**
- None (testing only)

**Step 1: Test task selection still works**

Using Playwright MCP:
1. Click various tasks
2. Verify selection state updates correctly
3. Verify only one task selected at a time

**Step 2: Test task completion toggle still works**

Using Playwright MCP:
1. Click circle button on a task
2. Verify task marks as completed (opacity changes)
3. Click again to mark incomplete
4. Verify counts update

**Step 3: Test drag-and-drop still works**

Using Playwright MCP:
1. Drag a task to different position
2. Verify visual feedback during drag
3. Verify order persists after drop

**Step 4: Test quick-add-task still works**

Using Playwright MCP:
1. Type title in quick-add input
2. Press Enter
3. Verify task creates and appears in list
4. Test Cmd+Enter to open create modal
5. Verify create modal still works

**Step 5: Test filtering still works**

Using Playwright MCP:
1. Click "Active" filter button
2. Verify only active tasks show
3. Click "Completed" filter
4. Verify only completed tasks show
5. Click "All" filter
6. Verify all tasks show

**Step 6: Test smart list filtering**

Using Playwright MCP:
1. Click "Today" smart list
2. Verify tasks filter correctly
3. Click "Upcoming" smart list
4. Verify tasks filter correctly
5. Click different areas/projects
6. Verify tasks filter by listId

**Step 7: Document regression test results**

Create a comment summarizing:
- All existing features tested
- Confirmation no regressions found
- Any issues discovered

**Step 8: Final commit if needed**

If any regression fixes were needed:
```bash
git add <fixed-files>
git commit -m "fix: resolve regressions in existing functionality"
```

---

## Task 8: Push to Remote

**Files:**
- None (git operations)

**Step 1: Review all commits**

Run: `git log --oneline -10`
Expected: See clean commit history for the feature

**Step 2: Push feature branch**

Run: `git push -u origin feature/task-editing`
Expected: Branch pushed to remote successfully

**Step 3: Verify push succeeded**

Run: `git status`
Expected: "Your branch is up to date with 'origin/feature/task-editing'"

**Step 4: Document completion**

Create final summary comment with:
- Feature complete and pushed
- All tests passing
- Ready for review/PR

---

## Success Criteria

- ✓ Edit button appears on selected tasks
- ✓ Edit modal opens with pre-populated data
- ✓ All fields are editable (title, description, area/project, tags, priority, status, due date)
- ✓ Save updates task and refreshes list/counts
- ✓ Archive sets status to archived and refreshes
- ✓ Cancel closes without saving
- ✓ Validation prevents empty titles
- ✓ Error handling shows toasts and preserves user input
- ✓ No regressions to existing functionality
- ✓ All tested with Playwright MCP

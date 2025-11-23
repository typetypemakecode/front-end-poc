# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React + TypeScript + Vite task management application with a sidebar-based UI. Uses Tailwind CSS v4 for styling, Headless UI for accessible components, and @dnd-kit for drag-and-drop functionality.

## Development Commands

```bash
# Start development server with HMR
npm run dev

# Build for production (runs TypeScript compiler + Vite build)
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Data Service Layer

The application uses a **Strategy Pattern** for data management via `src/services/`:

- **`IDataService`** - Interface defining all data operations (sidebar + tasks)
- **`LocalDataService`** - localStorage implementation for local development
- **`ApiDataService`** - REST API implementation for production
- **`dataService.ts`** - Factory that creates the appropriate service based on environment variables

Switch between local/API mode via `.env`:
```bash
VITE_USE_API=false  # Use localStorage
VITE_USE_API=true   # Use API endpoints
VITE_API_BASE_URL=http://localhost:3000/api
```

The singleton `dataService` is exported from `src/services/dataService.ts` and should be imported throughout the app.

#### Data Service Methods

**Sidebar operations:**
- `getSidebarConfig()` - Fetch sidebar configuration
- `getLocalSidebarConfig()` - Synchronous access to cached sidebar data
- `addArea(title, iconName?, priority?)` - Create new area
- `addProject(title, iconName?, priority?)` - Create new project

**Task operations:**
- `getTasks(listId?, status?, page?, limit?)` - Get tasks with optional filtering and pagination
- `getTaskCounts(listId?)` - Get task counts by status (all, active, completed, archived)
- `getTask(id)` - Get single task by ID
- `createTask(input)` - Create new task
- `updateTask(id, updates)` - Update existing task
- `deleteTask(id)` - Delete task

**Mock Data:**
- `src/data/sidebarConfig.json` - Initial sidebar data (smart lists, areas, projects)
- `src/services/mockTaskData.ts` - 26 sample tasks distributed across all areas and projects
  - Ensures every sidebar list has at least one task for testing
  - Includes tasks for inbox, today, upcoming, past_due, tags smart lists
  - Tasks use `listId` matching area/project keys: `work`, `home`, `health`, `ios_app`, `website`, `marketing`
  - Task dates are relative to current date for realistic testing
  - Includes tasks with all three statuses: active, completed, archived

### Component Structure

**Layout:**
- **`App.tsx`** - Root component with Header, Sidebar, and MainContent
- **`header.tsx`** - Top navigation bar
- **`sidebar.tsx`** - Main sidebar container, manages state and integrates with dataService
- **`main-content.tsx`** - Main content area with task filtering and TaskList

**Sidebar components:**
- `sidebar-list.tsx` - Renders a section of sidebar items
- `sidebar-item.tsx` - Individual sidebar item display
- `modal.tsx` - Reusable modal using Headless UI Dialog
- `new-list-form.tsx` - Form for creating new areas/projects

**Task components:**
- `task-list.tsx` - Loads tasks from dataService, handles task state and completion
  - Filters tasks based on selected smart list or area/project using `filterTasksByList` utility
  - Supports All/Active/Completed status filtering
  - Implements drag-and-drop reordering using @dnd-kit/sortable
- `task.tsx` - Individual task display with completion toggle and drag handle

**Utilities:**
- `utils/taskFilters.ts` - Shared filtering logic for smart lists
  - `filterTasksByList(tasks, listId)` - Filters tasks by smart list type or listId
  - Handles date parsing and comparison for date-based smart lists
  - Used by both `task-list.tsx` and `main-content.tsx` for consistent filtering

### Type System

The application maintains separate **data types** (for API/storage) and **component types** (for React):

**Sidebar types** (`src/types/sidebar.ts`):
- **Data types**: `SidebarItemData`, `SidebarConfigData` - Icons as string names
- **Component types**: `SidebarItem`, `SidebarConfig` - Icons as Lucide components

**Task types** (`src/types/task.ts`):
- `TaskData` - Complete task object with all fields
- `CreateTaskInput` - Input for creating new tasks (omits id, timestamps)
- `UpdateTaskInput` - Partial update object for modifying tasks
- `TaskPriority` - `'low' | 'medium' | 'high'`
- `TaskStatus` - `'active' | 'completed' | 'archived'`

**Icon mapping**: `src/utils/iconMapper.ts` converts icon string names to Lucide icon components.

### Configuration

- **TypeScript**: Three configs - `tsconfig.json` (base), `tsconfig.app.json` (app code), `tsconfig.node.json` (build config)
- **Vite**: Configured with React plugin and Tailwind CSS v4 via `@tailwindcss/vite`
- **ESLint**: Flat config in `eslint.config.js` with React hooks and refresh plugins

## Key Patterns

1. **Data/Component Type Separation**: Data types (for API/storage) are separate from component types (for React). This prevents coupling between the data layer and UI.

2. **Icon Mapping**: Icons stored as string names in data layer, mapped to Lucide components via `iconMapper.ts` for rendering.

3. **Priority System**: Both sidebar items and tasks use `'low' | 'medium' | 'high'` priority levels.

4. **Task Status**: Tasks have three states - `'active'`, `'completed'`, `'archived'`.

5. **Environment-based Data Strategy**: Toggle between localStorage and REST API via `VITE_USE_API` environment variable without code changes. Both implementations maintain identical interfaces.

6. **Sidebar Structure**: Three main sections:
   - **Smart Lists** - Built-in lists with special counting logic:
     - **Inbox**: Uncategorized tasks with NO `dueDate` AND NO `listId`, excluding completed tasks (tasks in limbo)
     - **Today**: Active tasks due today (based on dueDate matching current date, excludes completed)
     - **Upcoming**: Active tasks due in the next 7 days (excluding today, excludes completed)
     - **Past Due**: Active overdue tasks (dueDate before today, excludes completed)
     - **Tags**: Tasks that have at least one tag (includes all statuses: active, completed, archived)
     - **Anytime, Someday, Logbook**: Not yet implemented (return 0)
   - **Areas** - User-created organizational areas (tasks assigned via `listId`)
   - **Projects** - User-created projects (tasks assigned via `listId`)

   **Important**:
   - Tasks should only use `listId` values that match actual areas/projects in the sidebar config
   - Smart lists like "inbox", "today", "upcoming", "tags" are virtual views based on task properties, not `listId` values
   - Smart list counts in sidebar exclude completed tasks (except Tags which includes all statuses)
   - The main content filter buttons (All/Active/Completed) work independently from sidebar counts

7. **Data Persistence**:
   - `LocalDataService` uses two localStorage keys: `sidebarConfig` and `tasks`
   - Falls back to mock data on first load
   - `ApiDataService` maintains client-side cache for offline fallback

8. **State Management Flow**:
   - `App.tsx` manages global state: `selectedListId` (which list is active) and `refreshKey` (triggers data refresh)
   - Clicking sidebar item toggles selection (clicking same item twice deselects → shows all tasks)
   - `MainContent` receives `selectedListId` and calculates counts for All/Active/Completed buttons based on filtered tasks
   - `TaskList` receives both `selectedListId` and `filterKey` (All/Active/Completed) to apply combined filtering
   - When tasks are modified, `onDataChange` callback triggers refresh cascade: sidebar counts → main content counts → task list

9. **Smart List Filtering Logic**:
   - Smart lists are **virtual views** - they don't use `listId`, they filter based on task properties
   - Date-based filtering uses local timezone (not UTC) via custom `parseDate()` helper in both `LocalDataService.ts` and `taskFilters.ts`
   - Filtering happens client-side after fetching tasks from dataService
   - Count buttons (All/Active/Completed) show counts for the **currently selected list only**, not global counts

10. **Drag-and-Drop Task Reordering**:
   - Uses @dnd-kit library for accessible, touch-friendly drag-and-drop
   - Task order persists via localStorage in `LocalDataService`
   - Drag handle appears on hover for visual affordance
   - Only works within the current filtered view (doesn't change task properties)

## API Endpoints (for ApiDataService)

When `VITE_USE_API=true`, the following endpoints are expected:

**Sidebar:**
- `GET /sidebar-config` - Get sidebar configuration with dynamic task counts for each list
  - Response includes `count` field for each smart list, area, and project
- `POST /areas` - Create new area
- `POST /projects` - Create new project

**Tasks:**
- `GET /tasks?listId={id}&status={status}&page={page}&limit={limit}` - Get tasks with optional filters and pagination
  - `listId` (optional): Filter by smart list, area, or project ID
  - `status` (optional): Filter by task status (`'active'` or `'completed'`)
  - `page` (optional): Page number for pagination (1-indexed)
  - `limit` (optional): Number of tasks per page
- `GET /tasks/counts?listId={id}` - Get task counts by status
  - `listId` (optional): Filter counts by smart list, area, or project ID
  - Response: `{ "all": number, "active": number, "completed": number, "archived": number }`
- `GET /tasks/{id}` - Get single task
- `POST /tasks` - Create task
- `PATCH /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task
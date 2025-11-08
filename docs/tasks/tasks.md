# Tasks

## UI

- [x] Restyle the new list modal to be less boilerplate
- [x] Work on the ui for the main content area
- [] right sidebar (task details)
- [] Dashboard View

## Functionality

- [x] add the functionality to the new list button click and show the modal
- [x] make the areas and projects pull from a json object
- [x] add the functionality to make the add area add an area
- [x] add the functionality to make the add project add a project
- [ ] figure out notes
- [ ] task objects
- [ ] smart list filters

---

## Code Improvements & Technical Debt

### HIGH PRIORITY

#### Error Handling
- [ ] Replace `alert()` with toast notification system (react-hot-toast or sonner)
- [ ] Add error boundaries to catch React errors
- [ ] Add retry logic for failed API requests
- [ ] Create proper error types and display meaningful messages
- [ ] Distinguish between network errors vs validation errors

#### Custom Hooks & State Management
- [ ] Extract `useSidebarData` hook for data fetching
- [ ] Extract `useCreateList` hook for create operations
- [ ] Remove tight coupling of state to Sidebar component
- [ ] Fix `sidebarData` nullable state handling (src/components/sidebar.tsx:13)

#### Type Safety
- [ ] Add runtime schema validation with Zod or Yup for API responses
- [ ] Create type-safe environment variable handling in `src/env.ts`
- [ ] Validate required env vars exist at startup
- [ ] Create icon name union type instead of string (prevents invalid icon names)
- [ ] Remove duplicate type definitions

#### Accessibility Fixes
- [ ] Convert clickable divs to buttons in sidebar-item.tsx:16-18
- [ ] Add proper ARIA labels for list sections
- [ ] Add keyboard navigation (arrow keys) for sidebar items
- [ ] Improve focus management after modal actions
- [ ] Add proper semantic HTML and roles

#### Basic Testing
- [ ] Set up Vitest
- [ ] Add React Testing Library
- [ ] Write unit tests for LocalDataService
- [ ] Write unit tests for ApiDataService
- [ ] Write tests for utility functions

### MEDIUM PRIORITY

#### State Management Architecture
- [ ] Evaluate React Query/TanStack Query for data fetching/caching
- [ ] OR evaluate Zustand for lightweight global state
- [ ] OR implement Context + useReducer for moderate complexity
- [ ] Implement automatic refetching after mutations
- [ ] Add optimistic updates for better UX

#### Performance Optimizations
- [ ] Memoize `mapToListItems()` with useMemo (sidebar.tsx:68)
- [ ] Add React.memo() to frequently re-rendering components
- [ ] Consider virtualization for long lists (react-virtual/react-window)
- [ ] Implement code splitting for routes
- [ ] Optimize bundle size

#### Code Organization
- [ ] Create `hooks/` directory for custom hooks
- [ ] Create `constants/` directory for magic strings and configs
- [ ] Create `api/` directory for API client logic
- [ ] Split `components/` into `ui/` and `features/` subdirectories
- [ ] Create `lib/` directory for third-party library configs
- [ ] Move shared utilities to dedicated files

#### Data Service Improvements
- [ ] Extract shared `generateKey()` function to utils
- [ ] Extend IDataService with update operations
- [ ] Extend IDataService with delete operations
- [ ] Implement proper cache invalidation strategy
- [ ] Add AbortController support for request cancellation
- [ ] Add request deduplication

#### Styling & Design System
- [ ] Fix typo: `backdrop:blur-sm` → `backdrop-blur-sm` (sidebar.tsx:104)
- [ ] Create `cn()` utility function for className composition (clsx/tailwind-merge)
- [ ] Extract repeated Tailwind patterns to reusable components
- [ ] Document color/spacing tokens in CLAUDE.md or separate docs
- [ ] Create consistent component API patterns

### LOW PRIORITY

#### Comprehensive Testing
- [ ] Add integration tests for data services
- [ ] Add component integration tests
- [ ] Add E2E tests with Playwright or Cypress
- [ ] Add visual regression testing
- [ ] Achieve 80%+ test coverage

#### Developer Experience
- [ ] Add Prettier with configuration
- [ ] Set up Husky for pre-commit hooks
- [ ] Add lint-staged for pre-commit linting/formatting
- [ ] Add commitlint for conventional commits
- [ ] Set up GitHub Actions for CI/CD
- [ ] Add automatic type checking in CI
- [ ] Add bundle size analysis

#### Advanced Features
- [ ] Add request cancellation for in-flight requests
- [ ] Implement optimistic updates UI pattern
- [ ] Add undo/redo functionality
- [ ] Add keyboard shortcuts system
- [ ] Add offline support with service workers
- [ ] Add data export/import functionality

#### Code Quality
- [ ] Add JSDoc comments to complex functions
- [ ] Remove console.log statements or gate with debug flag
- [ ] Add proper logging infrastructure
- [ ] Implement feature flags system
- [ ] Add analytics/telemetry infrastructure

---

## Architecture Notes

### Current Issues Identified

1. **State Management**: Sidebar component manages all state locally (130+ lines), making it difficult to scale
2. **Error Handling**: Minimal error handling with poor UX (alerts)
3. **Type Safety**: Several gaps including nullable states, unvalidated API responses, and loose icon typing
4. **Component Architecture**: Mixed responsibilities (data fetching + state + UI rendering)
5. **Performance**: No memoization, unnecessary re-renders
6. **Testing**: No tests present in codebase
7. **Code Duplication**: `generateKey()` duplicated in both services

### Recommended Architecture Improvements

```
src/
├── api/              # API client configuration and base methods
├── components/
│   ├── ui/           # Reusable UI components (buttons, inputs, modals)
│   └── features/     # Feature-specific components (sidebar, header, etc)
├── hooks/            # Custom React hooks (useSidebarData, useCreateList, etc)
├── services/         # Data service layer (existing Strategy pattern)
├── lib/              # Third-party library configs (react-query, etc)
├── constants/        # App constants, config values, magic strings
├── types/            # TypeScript type definitions
└── utils/            # Pure utility functions
```

### Key Patterns to Implement

1. **Custom Hooks Pattern**: Extract data fetching/mutations into reusable hooks
2. **Error Boundary Pattern**: Catch and handle React errors gracefully
3. **Optimistic Updates**: Update UI immediately, rollback on failure
4. **Request Cancellation**: Cancel in-flight requests on component unmount
5. **Schema Validation**: Runtime validation of external data (API responses)

---

## Areas & Projects Enhancement: Descriptions and Due Dates

### Phase 1: Foundation (Minimal disruption)
- [x] Add `description?: string` field to `SidebarItemData` type (src/types/sidebar.ts)
- [x] Add `dueDate?: string` field to `SidebarItemData` type (src/types/sidebar.ts)
- [x] Update mock data in `src/data/sidebarConfig.json` with sample descriptions and due dates
- [x] Enhance `NewListForm` component to include description textarea field
- [x] Enhance `NewListForm` component to include due date picker (only for projects)
- [x] Update `IDataService` interface with new optional parameters for `addArea()` and `addProject()`
- [x] Update `LocalDataService` to persist description and due date fields
- [x] Update `ApiDataService` to send description and due date to backend

### Phase 2: Basic Display (Quick wins)
- [ ] Show description as tooltip on sidebar item hover (sidebar-item.tsx)
- [ ] Add small due date badge next to count for projects with due dates
- [ ] Implement color-coded due date indicators (green: 7+ days, yellow: 2-7 days, orange: tomorrow, red: overdue)
- [ ] Add subtle 🗒️ indicator icon for items that have descriptions
- [ ] Style overdue projects with red icon tint or warning indicator
- [ ] Add "days remaining" calculation utility for projects
- [ ] Update sidebar item layout to accommodate new visual indicators

### Phase 3: Rich Experience (Full feature set)
- [ ] Create detail panel/modal component for viewing full area/project details
- [ ] Add inline editing capability for descriptions and due dates
- [ ] Implement progress indicators (X/Y tasks complete) for areas/projects
- [ ] Add sorting options (by due date, by priority, by name) for projects
- [ ] Add filtering options ("Show only overdue", "Show only with due dates")
- [ ] Create visual timeline or calendar view for projects
- [ ] Add project completion tracking (auto-suggest marking complete when all tasks done)
- [ ] Add celebration animation when project is marked complete
- [ ] Implement "Edit Details" option in context menu or detail view
- [ ] Add ability to mark projects as complete/archived
- [ ] Show creation date and last updated metadata
- [ ] Support markdown formatting in descriptions (optional enhancement)


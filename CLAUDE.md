# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React + TypeScript + Vite application with a sidebar-based UI. Uses Tailwind CSS v4 for styling and Headless UI for accessible components.

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

- **`IDataService`** - Interface defining data operations
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

### Component Structure

- **`App.tsx`** - Root component with Header and Sidebar layout
- **`components/`** - UI components:
  - `sidebar.tsx` - Main sidebar container, manages state and integrates with dataService
  - `sidebar-list.tsx` - Renders a section of sidebar items
  - `sidebar-item.tsx` - Individual item display
  - `modal.tsx` - Reusable modal using Headless UI Dialog
  - `new-list-form.tsx` - Form for creating new areas/projects
  - `header.tsx` - Top navigation bar

### Type System

`src/types/sidebar.ts` contains two parallel type structures:
- **Data types** (`SidebarItemData`, `SidebarConfigData`) - Used for API/storage, icons as string names
- **Component types** (`SidebarItem`, `SidebarConfig`) - Used in React components, icons as Lucide components

`src/utils/iconMapper.ts` converts icon string names to Lucide icon components.

### Configuration

- **TypeScript**: Three configs - `tsconfig.json` (base), `tsconfig.app.json` (app code), `tsconfig.node.json` (build config)
- **Vite**: Configured with React plugin and Tailwind CSS v4 via `@tailwindcss/vite`
- **ESLint**: Flat config in `eslint.config.js` with React hooks and refresh plugins

## Key Patterns

1. **Icon Mapping**: Icons stored as string names in data layer, mapped to Lucide components via `iconMapper.ts`
2. **Priority System**: Items have `low | medium | high` priority levels
3. **Sidebar Sections**: Three main sections - Smart Lists, Areas, Projects
4. **Environment-based Data Strategy**: Toggle between local and API data sources without code changes
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development Server:**
```bash
npm run dev          # Start development server on http://localhost:3000
```

**Building and Production:**
```bash
npm run build        # Build for production
npm run start        # Start production server
```

**Code Quality:**
```bash
npm run lint         # Run ESLint
```

## Architecture Overview

This is a Next.js 15 application using the App Router pattern with TypeScript and Tailwind CSS 4. The application is a dashboard system for ProjectDuo Information System (PDIS) with a modular architecture.

### Core Architecture Patterns

**Module System:** The application implements a dynamic module loading system that allows users to switch between different functional modules without page navigation. This is achieved through:
- `ModuleContext` - React Context for global module state management
- `ModuleRegistry` - Central registry mapping module IDs to React components
- `WorkingArea` - Conditional renderer that displays either active module or default dashboard

**Authentication:** Simple mock authentication system using React Context (`UserContext`) with predefined users. No real OAuth integration currently implemented.

**State Management:** Pure React Context API approach with no external state libraries:
- `UserContext` - User authentication and profile data
- `ModuleContext` - Active module state for dynamic loading

### Key Components Structure

**Dashboard Layout (`src/app/dashboard/layout.tsx`):**
- Sidebar with collapsible module navigation
- Module activation handlers
- Resizable layout system using `react-resizable-panels`

**Module System (`src/components/modules/`):**
- 21 individual module components (Service Center, GenAd Tools, GenOps Tools)
- `ModuleRegistry.tsx` - Central component mapping
- Each module follows consistent layout pattern with icons and "Coming Soon" states

**UI Components (`src/components/ui/`):**
- Radix UI primitives with custom styling
- Sidebar, resizable panels, tooltips, dropdowns
- Lucide React icons throughout

### Technology Stack

- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS 4 with custom color scheme (orange/blue branding)
- **Components:** Radix UI primitives, custom sidebar implementation
- **Icons:** Lucide React
- **Drag & Drop:** @dnd-kit for todo list functionality
- **Calendar:** FullCalendar React integration
- **Fonts:** Montserrat from Google Fonts

### Module Development Pattern

When adding new modules:
1. Create component in `src/components/modules/[ModuleName]Module.tsx`
2. Follow the established layout pattern with header, icon, and content area
3. Add to `ModuleRegistry.tsx` with appropriate module ID
4. Update sidebar menu arrays in dashboard layout with matching `moduleId`

### Context Providers Hierarchy

```
RootLayout (UserProvider)
  └── DashboardLayout (SidebarProvider → ModuleProvider)
      └── Dashboard content with module switching
```

### Important Development Notes

- Always use escaped versions of apostrophes and special characters
- Avoid 'any' type usage - maintain strict TypeScript typing
- Components should be client-side (`"use client"`) when using hooks or interactivity
- Follow the established naming conventions for consistency
- Check `docs/MODULE_SYSTEM_ARCHITECTURE.md` for detailed module system documentation
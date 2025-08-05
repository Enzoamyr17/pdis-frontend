# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

We have a CHANGES.md file in CHANGES/CHANGES.md, whenever i prompt (generate CHANGES) you will insert the changes that we have done in this session, there’s gonna be a separate section for Frontend, Backend and Database make sure to put it in the right section accordingly for each change so basically all Frontend changes will just be in ## Frontend then all backend changes will be in ## Backend and so with Database changes. Keep it concise, as small as possible and clear.

Additionally, before doing so, you will need to ask me the current date and time to include that information in the CHANGES.md

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
npm run lint         # Run ESLint with TypeScript strict mode
```

**Database Management:**
```bash
npx prisma studio    # Open Prisma Studio for database management
npx prisma migrate dev # Run database migrations
npx prisma generate  # Generate Prisma client
```

## Architecture Overview

This is a **Next.js 15.4.2** application using the App Router pattern with **TypeScript** and **Tailwind CSS 4**. The application is a production-ready dashboard system for ProjectDuo Information System (PDIS) with comprehensive authentication, database integration, and Google Calendar API functionality.

### Core Architecture Patterns

**Authentication System (FULLY IMPLEMENTED):**
- **NextAuth.js v4** with PrismaAdapter for database sessions
- **Dual providers**: Google OAuth2 (with calendar scopes) + Credentials (email/password)
- **Profile completion workflow** with `profileCompleted` status tracking
- **Token management**: Automatic refresh token handling for Google APIs
- **Session strategy**: Database sessions (not JWT) for proper session table usage

**Module System:** Dynamic module loading system allowing users to switch between 21 functional modules without page navigation:
- `ModuleContext` - React Context for global module state management
- `ModuleRegistry` - Central registry mapping module IDs to React components  
- `WorkingArea` - Conditional renderer that displays either active module or default dashboard
- **Local storage persistence** for active module state

**Database Integration:**
- **PostgreSQL** with **Prisma ORM v6.13.0**
- **Comprehensive schema**: User, Account, Session, Address, Permission models
- **Employee data structure**: Office, Group, Department hierarchies with Philippine address system
- **Module permissions**: REQUESTOR/APPROVER role-based access

**State Management:** Pure React Context API approach:
- `ModuleContext` - Active module state for dynamic loading
- `AuthContext` - Wraps NextAuth SessionProvider
- No external state libraries (Redux, Zustand, etc.)

### Key Components Structure

**Dashboard Layout (`src/app/dashboard/layout.tsx`):**
- **Resizable sidebar** with collapsible module navigation using `react-resizable-panels`
- **User profile dropdown** with sign-out functionality
- **Module activation handlers** with local storage persistence
- **Responsive design** with mobile-friendly collapsing

**Module System (`src/components/modules/`):**
- **21 implemented modules** organized by business function:
  - **Service Center** (11 modules): Supplies/Vehicle Requisition, Property Management, etc.
  - **GenAd Tools** (7 modules): OPEX Budget, Performance Management, HR tools, etc.
  - **GenOps Tools** (2 modules): Creation of JO/PEP
  - **Big Calendar**: Full Google Calendar integration
- `ModuleRegistry.tsx` - Central component mapping with type safety
- **Consistent layout pattern**: Header with icon, content area, and "Coming Soon" states

**Authentication Components:**
- **Login page** (`src/app/page.tsx`) with dual sign-in options
- **Profile completion** (`src/app/auth/complete-profile/`) for new users
- **Protected routes** with middleware authentication checks

**UI Components (`src/components/ui/`):**
- **Radix UI primitives** with custom Tailwind styling
- **Custom implementations**: Sidebar, resizable panels, tooltips, dropdowns
- **Lucide React icons** throughout the application
- **Form components** with proper TypeScript typing

### Technology Stack

**Core Framework:**
- **Next.js 15.4.2** with App Router
- **React 19.1.0** with TypeScript 5 (strict mode)
- **Tailwind CSS 4.1.11** with custom color scheme (orange #F47B20, blue #1B2E6E)

**Authentication & Database:**
- **NextAuth.js 4.24.11** with PrismaAdapter
- **Prisma 6.13.0** with PostgreSQL
- **bcryptjs** for secure password hashing

**UI & Styling:**
- **Radix UI** primitives for accessible components
- **Custom Tailwind configuration** with brand colors and utilities
- **Montserrat font** from Google Fonts
- **Lucide React icons** for consistent iconography

**Calendar & Productivity:**
- **FullCalendar 6.1.18** (React, DayGrid, TimeGrid, Interaction plugins)
- **Google APIs 154.1.0** for calendar integration
- **@dnd-kit** for drag-and-drop functionality in todo lists

**Development Tools:**
- **ESLint 9** with Next.js configuration
- **TypeScript strict mode** with comprehensive type checking
- **Prisma Studio** for database management

### Google Calendar Integration

**Status: FULLY OPERATIONAL**

**Implementation (`src/lib/google-calendar.ts`):**
- **OAuth2 client management** with automatic token refresh
- **Database token storage** in Account table with refresh handling
- **Error handling** with detailed logging and user-friendly messages
- **Account status debugging** via `/api/auth/account-status`

**Features:**
- **Full CRUD operations**: Create, read, update, delete calendar events
- **Google Meet integration**: Automatic conference link generation
- **Multiple calendar views**: Month, week, day views with FullCalendar
- **Real-time sync** with Google Calendar API
- **Event management**: Click-to-edit/delete functionality
- **Date selection**: Click-and-drag event creation

**API Endpoints:**
- `GET/POST /api/calendar/events` - Event listing and creation
- `PUT/DELETE /api/calendar/events/[eventId]` - Individual event operations

### Database Schema

**Core Models:**
- **User**: Extended with employee vital records (name, position, office, department, contact info, address)
- **Account**: OAuth provider tokens with refresh token handling
- **Session**: NextAuth session management (properly utilized with database strategy)
- **Address**: Philippine address structure (region, province, city, barangay)
- **Permission**: Module-based permissions (REQUESTOR/APPROVER roles)

**Organizational Structure:**
- **Office**: PROJECT_DUO_GENERAL_ADMINISTRATION, PROJECT_DUO_GENERAL_OPERATIONS
- **Groups**: ASG (Admin Support), AFG (Accounting Finance), SOG (Sales Operations), CG (Creatives)
- **Departments**: 10 departments mapped to groups (Asset Management, People Management, etc.)

### Module Development Pattern

**Adding New Modules:**
1. Create component in `src/components/modules/[ModuleName]Module.tsx`
2. Follow established layout pattern with header, icon, and content area
3. Add to `ModuleRegistry.tsx` with appropriate module ID and type safety
4. Update sidebar menu arrays in dashboard layout with matching `moduleId`
5. Implement proper TypeScript interfaces for all props and state
6. Add permission checks if required for the module

**Module Structure Template:**
```tsx
"use client"
import { ModuleIcon } from "lucide-react"

export default function NewModule() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-6 border-b border-gray-200">
        <ModuleIcon className="h-6 w-6 text-blue" />
        <h1 className="text-xl font-semibold text-gray-900">Module Name</h1>
      </div>
      <div className="flex-1 p-6">
        {/* Module content */}
      </div>
    </div>
  )
}
```

### Context Providers Hierarchy

```
RootLayout (AuthProvider)
  └── DashboardLayout (SidebarProvider → ModuleProvider)
      └── Dashboard content with conditional module rendering
          └── Active module or default dashboard view
```

### Important Development Notes

**TypeScript Requirements:**
- **Strict mode enabled** - no `any` types allowed
- **Proper interface definitions** for all components and API responses
- **Type-safe database queries** with Prisma generated types
- **NextAuth type extensions** in `src/types/next-auth.d.ts`

**Authentication Patterns:**
- **Database sessions** (not JWT) for proper Session table usage
- **Profile completion checks** in middleware and page components
- **Token refresh handling** for Google API operations
- **Protected route patterns** with `getServerSession`

**Code Quality Standards:**
- **ESLint compliance** with no warnings or errors
- **Consistent naming conventions** with camelCase for variables, PascalCase for components
- **Client-side components** explicitly marked with `"use client"` when using hooks
- **Proper error handling** with try-catch blocks and user-friendly messages

**Google Calendar Integration:**
- **Always check token validity** before API calls
- **Handle refresh token scenarios** gracefully
- **Provide debugging information** in development mode
- **Use proper TypeScript types** for Google Calendar API responses

### Development Workflow

**Getting Started:**
1. Run `npm run dev` for development server
2. Use `npx prisma studio` for database management
3. Check `npm run lint` before committing changes
4. Test authentication flows with both Google OAuth and credentials

**Common Tasks:**
- **Adding modules**: Follow the established pattern in `ModuleRegistry.tsx`
- **Database changes**: Create migrations with `npx prisma migrate dev`
- **UI updates**: Use existing Tailwind classes and Radix components
- **API development**: Follow RESTful patterns with proper error handling

**Remember to not reset database always when migrating, find ways to migrate without resetting our database data.

**We have a CHANGES.md file in CHANGES/CHANGES.md, whenever i prompt (generate CHANGES) you will insert the changes that we have done in this session, there’s gonna be a separate section for Frontend, Backend and Database make sure to put it in the right section accordingly for each change so basically all Frontend changes will just be in ## Frontend then all backend changes will be in ## Backend and so with Database changes. Keep it concise, as small as possible and clear.

Additionally, before doing so, you will need to ask me the current date and time to include that information in the CHANGES.md
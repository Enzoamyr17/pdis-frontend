# Changes will be logged here every after session, before doing /clear

## Frontend

### August 5, 2025 - 10:20 AM
- **IMCF UI Enhancement**: Implemented conditional visibility for Package Fee and Daily Fees sections/columns
  - Package Fee field/column now hides when any Daily Fees have values in both card and table views
  - Daily Fees section/column now hides when Package Fee has a value in both card and table views
  - Improved user experience by displaying only one fee type at a time to prevent confusion
  - Maintained all existing functionality and validation logic for fee calculations

### August 5, 2025 - 9:30 AM
- **Toast Notification System**: Enhanced UserTodoList with Sonner toast notifications for all user actions
  - Added success toasts for task addition, completion/incompletion, and deletion
  - Positioned toasts in bottom-right corner with custom brand color styling
  - Integrated with global Toaster configuration for consistent UI experience
- **BigCalendar Performance Optimization**: Improved event handling to eliminate unnecessary API calls
  - Modified `handleEventClick` to use initially loaded events data instead of making individual API requests
  - Enhanced event interaction performance by leveraging cached calendar events
  - Maintained data consistency while reducing server load
- **Calendar Widget Management**: Implemented smart widget visibility control in dashboard
  - Calendar widget automatically hides when BigCalendar module is active to prevent UI duplication
  - Maintains clean interface by showing only relevant calendar components
  - Preserves normal widget functionality when other modules are active
- **Event Interaction Feedback**: Added real-time loading toasts for calendar event operations
  - Drag operations show "Updating event..." with success/error feedback
  - Resize operations show "Resizing event..." with appropriate status updates
  - Removed unnecessary refresh button from BigCalendar header for cleaner UI
- **Toast Theme Integration**: Customized Sonner toast styling to match application brand colors
  - Success toasts: Light green backgrounds with brand green borders
  - Error toasts: Light red backgrounds with brand red borders  
  - Info toasts: Light blue backgrounds with brand blue borders
  - Warning toasts: Light orange backgrounds with brand orange borders
  - Added dark mode support with appropriate color adjustments

### August 4, 2025 - 1:20 PM
- **WorkflowStatus Component Enhancements**: Major refactoring of stage status system and interaction patterns
  - Updated interface to use `status` field instead of `isCompleted` boolean with 4 status types: completed (green + check), ongoing (yellow + clock), re-validation (orange + arrow left), cancelled (red + X)
  - Converted hover animations to click-based interactions with expandedStage state management
  - Added automatic collapse on mouse leave from component container
  - Implemented dynamic status styling with `getStatusStyles()` function for consistent color coding
  - Added cursor pointer and smooth transitions for better user experience
- **FormStatus Component**: Created duplicate of WorkflowStatus with permanently expanded state for static display
  - Removed all interactive functionality (click handlers, hover states, mouse events)
  - Made all stages permanently display in expanded form with visible names and dates
  - Static component for form display purposes without user interactions

### August 4, 2025 - 11:20 AM
- **WorkflowStatus Component**: Extracted Status Group 1 block from ServiceRequestTrackerModule into reusable WorkflowStatus component
  - Created `src/components/ui/WorkflowStatus.tsx` with props for request, costCenter, and stages array
  - Updated ServiceRequestTrackerModule to use new WorkflowStatus component with configurable workflow stages
  - Maintained all original styling and animations with improved code organization

### August 4, 2025 - 12:38 AM
- **IMCF Duplicate Detection Enhancement**: Enhanced duplicate detection system to show specific IM numbers in error messages
  - Modified `checkForDuplicateIM` function to return detailed duplicate information including which IM number contains the duplicate
  - Updated all duplicate detection toast messages to show "already added as IM #X" instead of generic messages
  - Enhanced visual duplicate warning to display specific IM number in red warning box
- **IMCF Remarks System**: Complete implementation of remarks functionality for IM personnel entries
  - Added `remarks` field to IMPersonnel interface and all related data structures
  - Implemented remarks display in both card and table views with proper visual distinction
  - Added dedicated remarks section in card view with textarea input for editing
  - Created remarks column in table view showing both regular remarks (blue) and duplicate remarks (orange)
- **IMCF Duplicate Logic Backend Integration**: Updated backend duplicate checking to allow forms with remarks
  - Modified duplicate checking logic to allow duplicates when current person has `duplicateRemark` OR existing person has `remarks`
  - Updated personnel creation/update to save `duplicateRemark` as `remarks` field in database
  - Enhanced form submission error handling to show detailed backend duplicate messages instead of generic errors
- **IMCF Form Loading States**: Added comprehensive loading indicators for form editing
  - Implemented `isLoadingEditForm` state with full-screen loading overlay during form data fetching
  - Added loading states to edit buttons with spinner icons and disabled states
  - Created professional loading UI with backdrop blur and centered loading card

### August 4, 2025 - 12:01 AM
- **Sidebar Navigation Reorganization**: Complete restructure of dashboard sidebar layout
  - **Service Center**: Updated with Request to Pay, Cash Advance, Reimbursement, IM Clearance Form, JO for Messengerial Service, Vehicle Req, Flight Booking
  - **GenAd Tools**: Reorganized with GenAd PEP, PD Bulletins, User Management, IM Management, Client Management, Vendor Management
  - **GenOps Tools**: Updated with Client Management, GenOps PEP, and integrated Reports section
  - **PD Directory**: New section with Client, Vendor, User, and IM subsections
- **Disabled Items Styling**: Added gray-out styling and disabled functionality for incomplete modules (Gate Pass In out, Equipment Rental, Fabrication, Performance Management, Creatives JO)
- **New Modules Created**: PDDirectoryModule with tabbed interface, VendorManagementModule, GenOpsClientManagementModule, SystemReportsModule
- **ModuleRegistry Updates**: Added all new module mappings and updated titles to match new naming convention
- **Icon Display Fix**: Corrected sidebar icons to only show when sidebar is collapsed, maintaining proper UX pattern

## Backend

## Database

# Changes will be logged here every after session, before doing /clear

## Frontend

### August 7, 2025 - 11:35 AM
- **IMCF IM Reference System Frontend**: Implemented frontend components for IM database reference system
  - Updated IMPersonnel interface to include `imId` reference field for linking to IM database records
  - Modified selectIM function to store IM reference ID instead of duplicating data
  - Enhanced form submission and saving to include IM references in API calls
  - Updated form loading logic to handle synced IM data and populate fields from referenced records
- **IMCF GCash Auto-Sync UI**: Implemented user interface for automatic GCash synchronization
  - Added visual indicators showing "(Synced from IM Database)" for referenced personnel
  - Made GCash fields read-only when personnel is linked to IM database record
  - Enhanced data loading to prioritize IM database values over stored duplicates
- **IMCF Data Interface Enhancement**: Updated frontend interfaces to support new IM reference system
  - Modified IMCFFormListItem interface to handle optional IM references and nested IM data
  - Enhanced loadIMCFForEdit function to properly construct full names from IM database records
  - Updated personnel data mapping to use IM database values when available, fallback to stored values

### August 6, 2025 - 3:00 PM
- **IMCF List View Field Enhancement**: Added missing Auth GCash and Auth GCash Name fields to table view
  - Added Auth GCash and Auth GCash Name columns to match Card view functionality
  - Applied consistent min-width styling to all input forms in List view for better UX
  - Enhanced form usability with proper field sizing across different screen sizes
- **IMCF Fee Column Logic Fix**: Resolved Package Fee and Daily Fees visibility issues in table view
  - Fixed logic to show both columns when personnel have empty fees (allowing choice of fee type)
  - Changed from global visibility to per-row logic - each person can independently choose fee type
  - Maintained mutual exclusivity per person while allowing mixed fee types across different personnel
  - Resolved issue where saved personnel with package fees would hide daily fees option for new personnel
- **IMCF View Switching Auto-Scroll**: Implemented automatic scrolling to current work when switching between views
  - Added smart personnel detection to identify currently edited (unsaved) personnel
  - Auto-scroll targets most recently added unsaved personnel for better workflow continuity
  - Added data-personnel-id attributes to table rows for consistent targeting across both views
  - Enhanced UX by maintaining context when switching between Card and Table views

### August 6, 2025 - 2:26 PM
- **Service Request Tracker Search & Filter System**: Comprehensive search and sort functionality implementation
  - Added real-time search with suggestions dropdown supporting both startsWith and includes matching
  - Implemented priority-based suggestions (exact matches first, then partial matches) limited to 5 results
  - Created sort functionality with Date Needed (Closest First), Request (ascending), and Requestor Name (ascending)
  - Enhanced date parsing to handle DD/MM/YYYY format with proper chronological sorting
- **Service Request Tracker Data Enhancement**: Expanded sample data for comprehensive testing
  - Added multiple VRF, IMCF, SRF, and PRF request types with varied workflow statuses
  - Included diverse requestor names and date ranges to showcase search and sort capabilities
  - Created different workflow status combinations (completed, ongoing, cancelled, user, pending)
- **Service Request Tracker Visual Status Indicators**: Implemented date-based border styling system
  - Added red borders with 40% opacity for overdue requests (past dateNeeded)
  - Implemented yellow borders with 40% opacity for requests due today
  - Enhanced WorkflowStatus component with internal date calculation logic for self-contained styling
  - Added shadow effects to improve visual hierarchy and component distinction

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

### August 7, 2025 - 11:35 AM
- **IMCF IM Reference System Backend**: Implemented backend API support for IM database reference system
  - Updated PersonnelData interface to include `imId` field for IM database references
  - Modified IMCF creation and update endpoints to handle IM references in data storage
  - Enhanced personnel creation logic to use IM references when available, storing minimal duplicate data
  - Updated data retrieval to include IM data via database joins for automatic synchronization
- **IMCF Duplicate Detection with IM References**: Enhanced duplicate checking system for IM references
  - Modified duplicate checking logic to work with both IM references and traditional name-based checking
  - Updated duplicate detection queries to handle IM ID-based comparisons for more accurate results
  - Enhanced existing form exclusion logic to work properly with new reference system

### August 4, 2025 - 12:38 AM
- **IMCF Duplicate Logic Backend Integration**: Updated backend duplicate checking to allow forms with remarks
  - Modified duplicate checking logic to allow duplicates when current person has `duplicateRemark` OR existing person has `remarks`
  - Updated personnel creation/update to save `duplicateRemark` as `remarks` field in database
  - Enhanced form submission error handling to show detailed backend duplicate messages instead of generic errors

## Database

### August 7, 2025 - 11:35 AM
- **IMCF Personnel IM Reference Schema**: Added IM database reference system to IMCFPersonnel table
  - Added `imID` reference field to IMCFPersonnel table linking to IM table
  - Made `registeredName`, `ownGcash`, `authGcash`, and `authGcashAccName` fields optional when IM reference exists
  - Added foreign key constraint with RESTRICT deletion to maintain data integrity
  - Created database index on `imID` field for improved query performance
- **IM Table Relation Enhancement**: Extended IM model to support IMCF personnel references
  - Added `imcfPersonnel` relation array to IM model for bidirectional relationship
  - Applied database schema changes using Prisma db push without data loss
  - Maintained backward compatibility with existing IMCF records

### August 4, 2025 - 12:38 AM
- **IMCF Remarks Field**: Added `remarks` field support for storing duplicate remarks and general notes for IM personnel entries

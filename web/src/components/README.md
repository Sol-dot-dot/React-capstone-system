# Components Structure

This directory contains all React components organized by functionality for better maintainability and discoverability.

## Directory Structure

### `/auth`
- **LoginForm.jsx** - User authentication form component

### `/dashboard`
- **Dashboard.jsx** - Main dashboard component with analytics and overview
- **LegacyDashboard.js** - Legacy dashboard (kept for reference)

### `/layout`
- **Sidebar.jsx** - Main navigation sidebar component
- **TopBar.jsx** - Top navigation bar with user menu and notifications

### `/management`
- **BookManagement.jsx** - Book catalog management (CRUD operations)
- **BorrowingManagement.jsx** - Book borrowing process management
- **ReturningManagement.jsx** - Book return process management
- **PenaltyManagement.jsx** - Fine and penalty management system
- **UserManagement.jsx** - User account management (admin functions)
- **ClearanceRequirements.jsx** - Student clearance requirements management

### `/monitoring`
- **ActivityLogs.jsx** - System activity and audit logs
- **MonitoringDashboard.jsx** - System monitoring and performance metrics

### `/ui`
- **avatar.jsx** - Avatar component for user profile pictures
- **badge.jsx** - Badge component for status indicators
- **button.jsx** - Reusable button component
- **card.jsx** - Card container component
- **ChatbotWidget.jsx** - AI chatbot interface component
- **dialog.jsx** - Modal dialog component
- **input.jsx** - Form input component
- **SearchResults.jsx** - Search results display component
- **separator.jsx** - Visual separator component

## Naming Conventions

- All component files use `.jsx` extension for consistency
- Component names follow PascalCase convention
- File names match component names exactly
- UI components use lowercase file names for consistency with design system

## Import Paths

All components use relative imports based on their new folder structure:
- UI components: `../ui/componentName`
- Cross-folder imports: `../../folder/componentName`
- Context imports: `../../contexts/ContextName`

## Removed Files

The following files were removed during cleanup:
- Duplicate/legacy components (old versions without "Modern" prefix)
- Unused CSS files (styles now handled by Tailwind CSS)
- Test files and unused components
- Components not referenced in the main App.js routing


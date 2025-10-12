# Overview

Alma Pay (Almared Pay) is a comprehensive bulk payment and financial management system designed for organizations. The platform enables organizations to manage petty cash, bulk payments, collections, bank deposits, and team workflows with robust approval mechanisms and detailed reporting.

Built with React, TypeScript, and Vite, the application features a modern UI using shadcn/ui components and Radix UI primitives. It supports both system administrators (who manage multiple organizations) and organization users (who manage their organization's finances).

## Migration to Replit (October 2025)

This project was successfully migrated from Lovable to Replit as a **frontend-only application**. Key changes:

- **Application Type**: Frontend-only React app with Vite
- **API Integration**: Connects to existing external API at `https://bulksrv.almaredagencyuganda.com`
- **Development Server**: Configured Vite to run on port 5000 with host `0.0.0.0` for Replit proxy compatibility
- **Workflow**: "Start application" runs `npm run dev` (Vite dev server on port 5000)
- **Removed Components**: 
  - Eliminated unnecessary backend server setup (Express, Drizzle ORM, PostgreSQL integration)
  - Removed unused backend dependencies
  - AI/Supabase functionality remains in codebase but is not actively used
- **Organization Owner Access**: The user credentials used during organization creation automatically grant full administrative access to that organization through the existing API's authentication system

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Routing**: React Router v6 with protected routes
- **State Management**: React Context API for authentication, React Query for server state

### Component Structure
The application follows a feature-based component organization:
- **Layouts**: Separate layouts for system admin (`SystemAdminLayout`) and organization users (`OrganizationLayout`)
- **Protected Routes**: Role-based and permission-based route protection using `ProtectedRoute` component
- **Responsive Design**: Mobile-first approach with dedicated mobile navigation (`MobileBottomNav`) and responsive desktop sidebar
- **Code Splitting**: Lazy-loaded routes and components for optimal performance

### Authentication & Authorization
- **Context-based Auth**: `AuthContext` provides authentication state and user permissions throughout the app
- **Permission System**: Granular permission checks using `hasPermission` and `hasAnyPermission` helpers
- **Role Hierarchy**: Three main roles - system admin, manager, and staff, each with specific permission sets defined in `rolePermissions`
- **Multi-factor Authentication**: OTP verification support via email and SMS through `otpService`
- **Session Management**: Token-based authentication with refresh token support

### Key Design Patterns
- **Lazy Loading**: All page components are lazy-loaded to reduce initial bundle size
- **Compound Components**: Complex UI patterns (e.g., tabs, dialogs) use composition
- **Custom Hooks**: Shared logic extracted into hooks like `useOrganization`, `useOrganizationData`, `useAuth`
- **Service Layer**: API calls abstracted into service modules (`authService`, `organizationService`, `paymentService`)

## API Integration

### Service Architecture
The application uses a service-oriented architecture for API communication:

- **Payment Service** (`paymentService.ts`): Comprehensive integration with payment API endpoints including:
  - Currency and country management
  - Bulk payments (create, check, process)
  - Payment links generation
  - Transaction tracking
  - Collections and mobile money withdrawals
  
- **Organization Service** (`organizationService.ts`): Handles organization-specific operations:
  - Staff management
  - Wallet operations
  - Organization CRUD operations
  
- **User Service** (`userService.ts`): User profile and account management

- **Auth Service** (`authService.ts`): Authentication flows including login, logout, token refresh, and password management

- **OTP Service** (`otpService.ts`): One-time password operations for email/SMS verification and password reset

### API Configuration
- Base URL configured in `api-config.ts`
- Bearer token authentication
- Centralized error handling with toast notifications
- Type-safe request/response interfaces using TypeScript

## Data Management

### State Management Strategy
- **Local State**: Component-level state with React hooks (useState, useEffect)
- **Global State**: Authentication and user context via Context API
- **Server State**: React Query would be used for caching and synchronization (currently configured but not fully implemented)
- **Form State**: React Hook Form with Zod validation (configured via `@hookform/resolvers`)

### Demo Data System
The application includes a comprehensive demo data system for development and testing:
- `demoData.ts`: Sample organizations and users with various roles
- `reportData.ts`: Sample transaction data for reports and analytics
- Local storage used for persisting demo user modifications

## Feature Modules

### Petty Cash Management
- Transaction creation and tracking
- Approval workflows
- Bill payments integration
- Reconciliation tools
- Detailed reporting with filtering and exports

### Bulk Payments
- Batch payment creation with CSV upload support
- Recipient validation (name verification against telecom providers)
- Dual payment modes: Mobile Money and Bank Transfer
- Multi-level approval system
- Payment processing and tracking

### Collections
- Payment link generation with QR codes
- Mobile money collection initiation
- Collection tracking and history
- Payment link management

### Bank Deposits
- Deposit request creation
- Approval workflows
- Multiple deposit types (cash, check, transfer)
- Bank account management

### Reporting & Analytics
- Department-wise expense tracking
- Transaction trend analysis
- Export capabilities (CSV, PDF)
- Customizable date ranges and filters
- Visual charts using Recharts library

### User & Team Management
- Staff onboarding and role assignment
- Permission management
- Department organization
- Activity tracking

## External Dependencies

### Third-party UI Libraries
- **Radix UI**: Headless UI primitives for accessible components (dialogs, dropdowns, tabs, etc.)
- **Lucide React**: Icon library for consistent iconography
- **Recharts**: Chart library for data visualization
- **date-fns**: Date manipulation and formatting
- **Embla Carousel**: Carousel/slider functionality

### Form & Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation (via @hookform/resolvers)

### Utilities
- **class-variance-authority**: Type-safe variant styling
- **clsx** & **tailwind-merge**: Conditional className handling
- **cmdk**: Command palette functionality

### Backend Integration
- **External Payment API**: `https://bulksrv.almaredagencyuganda.com/payments/` - Handles all payment operations
- Authentication via Bearer tokens stored in localStorage
- RESTful endpoints for all financial operations

### Planned Integrations
- **Supabase**: Configured but not actively used (potential future database)
- **PostgreSQL**: May be added later for persistent data storage
- **Mobile Money Providers**: MTN and Airtel for payment processing
- **Banking APIs**: For direct bank transfers and account verification

### Development Tools
- **TypeScript**: Type safety with relaxed strictness for rapid development
- **ESLint**: Code quality with React-specific rules
- **Lovable Tagger**: Component tagging for development mode
- **Vite**: Fast build tool with code splitting and optimization

### Deployment
- **Vercel**: Configured with SPA routing via `vercel.json`
- Static asset optimization
- Environment-based builds (development and production modes)
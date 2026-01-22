# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Take-a-Seat is a coworking space booking application frontend built with Next.js 16 and React 19. It connects to a Strapi CMS backend for data management.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run start    # Start production server
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **UI**: shadcn/ui (new-york style) with Radix UI primitives
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack React Query for server state
- **Backend**: Strapi CMS (API at `NEXT_PUBLIC_STRAPI_API_URL`)
- **Date handling**: Moment.js

### Directory Structure
- `app/` - Next.js App Router pages and layouts
- `components/` - React components organized by domain (admin, auth, bookings, users, etc.)
- `components/ui/` - shadcn/ui base components
- `models/` - TypeScript classes with Strapi serialization/deserialization
- `hooks/` - Custom React hooks, including data fetching hooks
- `contexts/` - React contexts (AuthContext, ConfirmDialogContext)
- `providers/` - Provider wrappers (QueryProvider, ThemeProvider)
- `lib/strapi/` - Strapi API utilities
- `config/` - App configuration (site config, fonts)

### Data Layer Pattern

Models in `models/` follow a consistent pattern for Strapi integration:
- `static contentType` - Strapi content type name
- `static fromJson()` - Factory method to create instance from Strapi response
- `toJson()` - Serialize for Strapi API calls
- `static strapiAPIParams` - Returns `{ contentType, factory }` for API hooks

Example usage:
```typescript
const { fetchAll } = useStrapiAPI();
const bookings = await fetchAll({
  ...Booking.strapiAPIParams,
  queryParams: { populate: "*" }
});
```

### Authentication
- `AuthContext` manages JWT-based auth with Strapi
- JWT stored in localStorage
- `useAuth()` hook provides user, login, logout, signup, and role checking
- hCaptcha integration for auth endpoints

### Key Hooks
- `useStrapiAPI()` - Generic CRUD operations for Strapi content types
- `useCalendar()` - Complex hook for calendar view with availability/booking logic
- `useWeekSelector()` - Week navigation state management

### Path Aliases
The `@/` alias maps to the project root (configured in tsconfig.json).

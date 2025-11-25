# Project Structure

## Directory Organization

```
src/
├── components/
│   ├── layout/          # AppLayout, AppSidebar
│   ├── ui/              # shadcn components (50+ reusable UI primitives)
│   └── NavLink.tsx      # Custom navigation component
├── context/
│   └── AppContext.tsx   # Global state management with localStorage sync
├── hooks/
│   ├── use-mobile.tsx   # Responsive breakpoint detection
│   └── use-toast.ts     # Toast notification hook
├── integrations/
│   └── supabase/        # Supabase client (configured but optional)
├── lib/
│   └── utils.ts         # Utility functions (cn for className merging)
├── pages/               # Route components (one per feature)
│   ├── Dashboard.tsx
│   ├── Tasks.tsx
│   ├── Kanban.tsx
│   ├── Sprints.tsx
│   ├── UserStories.tsx
│   ├── Team.tsx
│   ├── Risks.tsx
│   ├── ProfitSharing.tsx
│   ├── DevOps.tsx
│   └── NotFound.tsx
├── types/
│   └── index.ts         # TypeScript type definitions for all entities
├── utils/
│   ├── constants.ts     # App-wide constants
│   └── sampleData.ts    # Sample data initialization
├── App.tsx              # Root component with routing
├── main.tsx             # Entry point
└── index.css            # Global styles with CSS variables
```

## Architecture Patterns

### State Management
- **Context API**: Single `AppContext` provides global state
- **localStorage Sync**: All entities auto-persist to localStorage
- **CRUD Operations**: Context exposes add/update/delete methods for each entity type

### Routing
- **Layout Route**: All pages wrapped in `AppLayout` (sidebar + main content)
- **Catch-all**: `*` route renders `NotFound` component
- **Navigation**: Custom `NavLink` component for active state styling

### Component Conventions
- **UI Components**: Located in `src/components/ui/`, follow shadcn patterns
- **Page Components**: One file per route in `src/pages/`
- **Layout Components**: Shared layout structure in `src/components/layout/`

### Data Models
All types defined in `src/types/index.ts`:
- Task, UserStory, Sprint, TeamMember, Risk, ProfitShare, KPIMetrics

### Styling Approach
- **Tailwind Utility Classes**: Primary styling method
- **CSS Variables**: HSL color tokens in `index.css`
- **cn() Helper**: Merge className strings with tailwind-merge
- **Glassmorphic Effects**: Backdrop blur, translucent backgrounds

## Key Files

- **App.tsx**: Routing setup, provider wrappers
- **AppContext.tsx**: All CRUD logic and state management
- **types/index.ts**: TypeScript interfaces for data models
- **sampleData.ts**: Initial data seeding
- **tailwind.config.ts**: Theme extensions, custom colors, animations

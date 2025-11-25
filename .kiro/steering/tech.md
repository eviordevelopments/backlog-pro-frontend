# Tech Stack

## Core Technologies

- **Build Tool**: Vite 5.4
- **Framework**: React 18.3 with TypeScript 5.8
- **Styling**: Tailwind CSS 3.4 with custom design tokens
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React Context API (`AppContext`)
- **Routing**: React Router v6
- **Data Persistence**: localStorage (client-side)

## Key Libraries

- **Forms**: react-hook-form + zod validation
- **Charts**: Recharts for data visualization
- **Drag & Drop**: @dnd-kit for kanban functionality
- **Icons**: lucide-react
- **Utilities**: clsx, tailwind-merge, class-variance-authority
- **Date Handling**: date-fns
- **Toasts**: sonner
- **Backend (optional)**: Supabase client configured but not actively used

## Common Commands

```bash
# Development server (port 8080)
npm run dev

# Production build
npm run build

# Development build
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview
```

## TypeScript Configuration

- Path alias: `@/*` maps to `./src/*`
- Relaxed settings: `noImplicitAny: false`, `strictNullChecks: false`
- Skip lib check enabled for faster builds

## Build Configuration

- **Dev Server**: Runs on `::` (all interfaces) port 8080
- **SWC Plugin**: Fast React refresh with @vitejs/plugin-react-swc
- **Development Mode**: Includes lovable-tagger for component tracking

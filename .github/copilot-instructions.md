# Agent Expenses Tracker - AI Coding Guidelines

## Project Overview
Full-stack expense tracking app for daily collections with settlements and audit trails. Docs-driven development where `docs/*.md` files are the source of truth.

## Architecture
- **Frontend**: React/TypeScript with Vite, Tailwind CSS (glassmorphism theme), custom hooks for data management
- **Backend**: Express/TypeScript API with Supabase client
- **Database**: Supabase (Postgres), with local SQLite schema for reference
- **Key Principle**: Immutability - historical daily collections are read-only; use settlements for late payments

## Key Patterns
- **Data Flow**: Frontend hooks (`useCollections`, `useExpenses`) fetch from backend API routes (`/api/collections/:month`)
- **Settlement Logic**: Never edit past records; create settlement transactions linked to `applied_to_month`
- **Weekly Expenses**: Tracked separately from collections, calculated as `net = collections - expenses`
- **Audit Trail**: All changes timestamped, payment events logged immutably

## Developer Workflows
- **Local Dev**: Run `npm run dev` in both `backend/` and `frontend/` directories
- **Build**: `npm run build` in backend (TypeScript compile), `npm run build` in frontend (Vite)
- **Database**: Use Supabase dashboard for schema changes; migrations in `backend/src/db/`
- **Testing**: No automated tests yet; manual verification via UI

## Conventions
- **File Structure**: Controllers in `backend/src/controllers/`, routes in `routes/`, components in `frontend/src/components/`
- **API Responses**: Always `{ success: boolean, data?: any, error?: string }`
- **Date Handling**: Use `YYYY-MM` for months, ISO dates; leverage `date-fns` for formatting
- **Styling**: Tailwind with custom glassmorphism classes; theme toggle persists in localStorage
- **Error Handling**: Try-catch in controllers, user-friendly messages in frontend

## Examples
- **Adding Collection**: POST to `/api/collections` with `{ date, expected_amount, collected_amount, status }`
- **Settlement**: POST to `/api/settlements` with `{ settlement_date, amount, applied_to_month }`
- **Component**: Use `clsx` for conditional classes, e.g., `clsx('bg-green-500', { 'opacity-50': disabled })`

Reference: `docs/05-data-model.md` for schema, `docs/01-vision.md` for philosophy.
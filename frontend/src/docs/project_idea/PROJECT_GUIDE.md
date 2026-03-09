# Agent Expenses Tracker - Universal Project Guide

This document serves as the **Single Source of Truth** and **Universal Context** for the Agent Expenses Tracker project. It is designed to provide any AI agent or developer with a complete understanding of the project's vision, features, data model, UX rules, and technical architecture.

---

## 1. Vision & Philosophy

**Purpose**: A daily payment tracking system for small recurring collections, supporting partial payments, late settlements, and weekly expenses, with a strong audit trail.

### Core Principles
- **Docs-as-Code**: Markdown files in `docs/` drive development. AI reads these docs to generate and validate code.
- **Immutability & Integrity**: Past financial data is never edited. Corrections or late payments are recorded as new transactions (Settlements).
- **Derived State**: Balances and statuses are calculated on-the-fly from granular transaction records to avoid consistency bugs.

---

## 2. Key Features

- **Daily Collection Tracking**: Monitor expected vs. collected amounts daily. Statuses: ✅ **Full**, 🟡 **Partial**, ❌ **Missed**.
- **Settlements (Late Payments)**: Record payments today to clear debts from past months without altering historical records.
- **Weekly Expenses**: Track operational costs separately from collections, calculated at the weekly level.
- **Financial Health / Debt Explorer**: A bird's-eye view of all outstanding income and expense debts across all months.
- **Reports**: Instant monthly summaries and weekly net profit calculations.
- **Telegram Integration**: Support for sending summaries and notifications to a Telegram bot.

---

## 3. Data Model

### Entities & Transactions
- **`DailyCollection`**: Records a specific day's collection. (Date, Expected, Collected, Status, Notes).
- **`WeeklyExpense`**: Operational costs for a specific week.
- **`Settlement`**: A payment received today applied to a past month's debt.
- **`SettlementAllocation`**: Links a Settlement to specific `DailyCollection` records to track exactly which days are "settled later".
- **`ExpensePayment`**: Records payments made towards specific weekly expenses.

### Calculation Logic (The "Golden Rules")
- **Monthly Collected** = Sum(Daily Collected) + Sum(Settlements applied to this month) - Overlap Adjustment.
- **Monthly Expected** = Sum(Daily Expected).
- **Net Outstanding** = (Monthly Expected - Daily Collected) - Settlements.
- **Weekly Net** = (Sum of Daily Collections + Weekly Settlements) - Sum(Weekly Expenses).

---

## 4. UX & Interaction Rules

- **The One-Click Full**: Clicking an empty cell for "Today" immediately marks it as **Full**.
- **Visual Priority**:
    - **Green**: Fully Paid on time.
    - **Purple/Blue**: Settled via later payment.
    - **Yellow**: Partial payment remaining.
    - **Red**: Missed (0 collected).
- **Sacred History**: Past months are Read-Only. Direct edits to past days are blocked; use the Settlement flow instead.
- **Optimistic UI**: UI updates immediately on action (e.g., settling debt in Debt Explorer) with background sync and rollback on failure.

---

## 5. Technical Architecture

### Frontend (React + Vite)
- **Framework**: React with TypeScript and Tailwind CSS.
- **State Management**: React Hooks (`useMemo`, `useState`, `useEffect`) and custom hooks for data fetching.
- **Icons**: Lucide-React.
- **Date Handling**: `date-fns`.

### Backend (Supabase)
- **Database**: PostgreSQL (via Supabase).
- **Auth**: Supabase Auth (configured for `default_user` in current iteration).
- **Key Tables**: `daily_collections`, `weekly_expenses`, `settlements`, `settlement_allocations`, `expense_payments`.

### Core Directory Structure
- `/docs`: Detailed design, wireframes, and requirements (Sources of Truth).
- `/frontend/src/components`: UI components (Grid, Summary, Modals, Explorer).
- `/frontend/src/hooks`: Data logic and Supabase interaction.
- `/frontend/src/types`: TypeScript interfaces for the data model.
- `/frontend/src/utils`: Helper functions for calculations and formatting.

---

## 6. Development Workflow

1. **Update Docs**: Modify `.md` files in `docs/` for any requirement or design change.
2. **AI Sync**: Feed the updated docs to the AI to generate/refactor code.
3. **Verify**: Use the "Financial Health" view and "Monthly Summary" to verify that calculations remain correct after changes.
4. **Audit**: Always check `settlement_allocations` to ensure late payments are correctly linked to original debts.

---

## 7. Environment & Config
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`: Connection to the database.
- `VITE_TELEGRAM_BOT_TOKEN` / `VITE_TELEGRAM_CHAT_ID`: For summary reporting.

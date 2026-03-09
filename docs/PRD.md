# Product Requirements Document (PRD): Agent Expenses Tracker

## 1. Project Overview
The **Agent Expenses Tracker** is a specialized financial management tool designed for tracking daily recurring collections and weekly operational expenses. It is built for agents or small business owners who need a rigorous audit trail and the ability to handle partial payments and late settlements without compromising historical data integrity.

## 2. Problem Statement
Many small businesses struggle with tracking daily micro-payments where customers often pay partially or settle debts days/weeks later. Standard accounting tools are often too complex, while spreadsheets lack the validation and "immutability" needed to prevent accidental historical edits, leading to trust issues in the financial records.

## 3. Goals & Objectives
*   **Data Integrity**: Ensure past months' data remains read-only and immutable.
*   **Flexible Collections**: Support Full, Partial, and Missed payment states for every day.
*   **Settlement Logic**: Enable "catching up" on past debts through a dedicated settlement system that records new transactions instead of editing old ones.
*   **Operational Clarity**: Provide clear weekly and monthly summaries of gross income, expenses, and net profit.

## 4. Key Features
### 4.1 Daily Collection Grid
*   Interactive calendar/grid view for the current month.
*   Daily status indicators: ✅ Full, 🟡 Partial (with amount), ❌ Missed.
*   Support for notes per entry.

### 4.2 Settlement System
*   Track outstanding balances from previous months.
*   Record new "Settlement" payments applied to specific past months.
*   Visual indicators of "Debt Recovery" in monthly reports.

### 4.3 Weekly Expense Management
*   Categorized expense tracking (e.g., Fuel, Maintenance, Salaries).
*   Automatic calculation of Net Weekly Income.

### 4.4 Reporting Dashboard
*   Monthly summaries: Total Expected vs. Collected vs. Settled.
*   Weekly profit/loss breakdowns.
*   Mobile-optimized interface for quick daily updates.

## 5. Technical Stack
*   **Frontend**: React (Vite) with TypeScript.
*   **Styling**: Tailwind CSS for a responsive, modern UI.
*   **Backend/Database**: Supabase (PostgreSQL) for secure auth and persistent storage.
*   **Methodology**: "Docs as Code" – Markdown files serve as the living source of truth for all logic.

## 6. Constraints & Rules
*   **History is Sacred**: No "edit" button for past months' daily collections.
*   **Audit Trail**: Every settlement must be a new transaction linked to a past period.
*   **Logic over Storage**: Balances and net profits are computed on-the-fly to ensure consistency with the transaction log.

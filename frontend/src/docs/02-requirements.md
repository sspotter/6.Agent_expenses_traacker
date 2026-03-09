# Requirements

## 1. Daily Collection
- **Track Daily Status**: Each day must have a clear status:
    - ✅ **Full**: Collected expected amount.
    - 🟡 **Partial**: Collected less than expected (must store specific collected amount).
    - ❌ **Missed**: Collected nothing (0 amount).
- **Inputs**:
    - Expected Amount (set per month/default).
    - Collected Amount (user input).
    - Notes (optional).
- **Constraint**: Daily records for past months must be **read-only**.

## 2. Settlements (Late Payments)
- **Problem**: Users often pay the remaining balance of a partial payment weeks later.
- **Requirement**: Allow recording a "Settlement" payment in the current period that pays off a debt from a previous month.
- **Constraint**: **Never edit historical daily records**. A settlement is a new transaction linked to past debt, not a modification of the past.
- **Audit**: System must show how much of a past month's outstanding balance has been settled.

## 3. Weekly Expenses
- **Tracking**: Allow adding expenses (amount, category, note) for specific weeks.
- **Separation**: Expenses should be tracked separately from daily collections, usually summarized by week.
- **Calculation**: Net Weekly Income = (Sum of Daily Collections for Week) - (Sum of Weekly Expenses).

## 4. Reporting & Summaries
- **Monthly Summary**:
    - Total Expected vs. Total Collected.
    - Outstanding Balance (Sum of deficits).
    - "Settled Later" amount (for tracking recovery of debt).
- **Weekly Summary**:
    - Income, Expense, and Net Profit per week.
- **Navigation**: Ability to switch between months.
- **Mobile View**: optimized for verifying "today's" status quickly.

# UX Rules

## 1. Core Principles
- **Minimize Effort**: Marking "Full Collection" for today should take **1 click**.
- **Prevent Mistakes**: Never overwrite data silently.
- **History is Sacred**: Past months are **Read-Only**.

## 2. Daily Interactions
- **One-Click Full**: Clicking an empty cell for "Today" immediately marks it as **Full** (assuming expected amount).
- **Partial Payment**: Requires explicit user input of the collected amount. Field auto-focuses on open.
- **Missed Day**: Requires explicit confirmation to prevent accidental clicks.
- **Visual Priority**: Color > Amount > Icon.
    - Green = Full
    - Yellow = Partial
    - Red = Missed

## 3. Settlement Logic (Crucial)
- **Principle**: A payment made later for a past debt is a **new transaction**, not an edit of the past.
- **Rule**: Users cannot edit cells in past months.
- **Flow**: User clicks "Settle" (or similar) in the *current* month to pay off *past* outstanding balances.
- **Display**: The past month shows the original partial status but includes a visual indicator (e.g., "Settled later") to show the debt is cleared.

## 4. Weekly Expenses
- Expenses are added to a specific **Week**, not a specific **Day**.
- Expenses instantly update the Weekly Net and Monthly Summary.

## 5. Reports & Feedback
- **Real-time**: Summaries update instantly upon data entry.
- **Outstanding**: Clearly distinguishes between "Outstanding" (raw deficit) and "Remaining" (deficit minus settlements).
- **Mobile First**: Critical actions (add collection) must be easily accessible on mobile.

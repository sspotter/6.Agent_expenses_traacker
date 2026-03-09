# Project Tasks & Status

## ✅ Completed Recently
- **Phase 13: Audit Trail & Trust**
  - Created `payment_events` table for immutable logging.
  - Added History Sidebar to Daily Collections and Weekly Expenses.
  - Implemented automatic recording of all financial movements.
- **Phase 14: Visual Overhaul & Dark Mode**
  - Implemented CSS variable system for dynamic theming.
  - Added Theme Toggle (Sun/Moon) with persistence.
  - Refreshed all modals and cards with premium glassmorphism.
- **Phase 10: Financial Polish & UI Alignment** (Confirmed by User)
  - Fixed missing `expense_payments` table.
  - Synced Weekly Expense backgrounds with grid status colors.
  - Displayed "Today's Date" in header.
  - Enhanced Expense Payment Modal with Multi-action buttons.
- **Automatic Note Timestamps**
  - Prepend `[Date Time]` to all notes.
  - Added system notes for bulk adds and settlements.

## 🛠️ In Progress / Next Steps
- [x] **Fix Debt Explorer Settling Logic**
  - [x] Correct income debt calculation to account for `settlement_allocations`.
  - [x] Update "Settle" button to "Pay Now" in Debt Explorer.
  - [x] Ensure "Pay Now" triggers settlement with pre-filled balance.
- [x] **Phase 19: Settlement Visibility & Status Sync**
  - [x] Fix: Debt Explorer showing $0 total while still listing "Pay Now" items. (Added unallocated credit logic).
  - [x] Refinement: Logic to ignore items in Debt Explorer if their balance is fully covered by allocations.
  - [x] UI: Visual "Fully Settled" state for historical days in the main grid once allocations match the gap.
  - [x] UI: Unified "Amount / Expected" display that shows 100% completion for settled days.
  - [x] Calculation: Ensure monthly summaries correctly distinguish between "Gross Debt" and "Net Debt" (Debt - Settlements).
  - [x] Fix: Manual "FULL" status no longer inflates profit on settled days (Surplus subtraction logic).
- [x] **Phase: Settlement Attribution & Completion Rules**
  - [x] **Calculation Refactor**: Redefine completion percentage as uncapped progress (can exceed 100%).
  - [x] **Status Decoupling**: Ensure `DailyCollection` status remains immutable based ONLY on same-day money.
  - [x] **Settlement Indicators**: Display "Settled Later" hints on yellow/red cards instead of turning them green (Audit Integrity).
  - [x] **Manual Edit Protection**: Implement safeguards/warnings when editing days that have already been settled to prevent double counting.
  - [x] **Summary Re-alignment**: Clear separation of "Daily Collected" vs "Settlements" in summary panels.
- [ ] **Phase 20: Bug Fixes & UI Refinements**
  - [x] Fix: Nested button error in DailyGrid causing hydration/DOM issues.
  - [x] UI: Implement **Purplish ("Resolved")** style for settled cards to differentiate from on-time "Full" payments.
  - [x] UI: Update settled cards to show full amount (e.g. 100/100) while preserving historical status label.
  - [x] Logic: Refine automated notes to include initial payment amounts and settlement history for clear audit trails.
  - [ ] DB: Fix 404/400 schema mismatch on `payment_events` and `settlement_allocations`.
- [ ] **Phase 15: Visualization & Trends**

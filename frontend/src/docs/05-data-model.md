# Data Model

## 1. Core Philosophy
- **Immutability**: Days never change once the month is passed.
- **Transactions**: Money movements (collections, settlements) are distinct records.
- **Derived State**: Balances are calculated, not stored.

## 2. Entities

### `DailyCollection`
Represents the status of a specific day.
- **id**: UUID
- **date**: DATE (Unique per user)
- **expected_amount**: DECIMAL
- **collected_amount**: DECIMAL
- **status**: ENUM (FULL, PARTIAL, MISSED)
- **notes**: TEXT
- *Constraint*: `collected_amount` <= `expected_amount`.

### `WeeklyExpense`
Represents operational costs for a week.
- **id**: UUID
- **week_start_date**: DATE
- **week_end_date**: DATE
- **amount**: DECIMAL
- **category**: STRING
- **notes**: TEXT

### `Settlement`
Represents a payment received in the current period to cover a past debt.
- **id**: UUID
- **settlement_date**: DATE (Date money was received - usually Today)
- **amount**: DECIMAL
- **applied_to_month**: YYYY-MM (The past month being settled)
- **notes**: TEXT
- *Logic*: This amount reduces the "Outstanding Balance" of the target month but adds to the "Cash in Hand" of the current month.

## 3. Computed Views (Frontend/Backend Logic)

### Monthly Summary
- **Total Expected**: Sum(`expected_amount`)
- **Total Collected**: Sum(`collected_amount`)
- **Gross Outstanding**: Total Expected - Total Collected
- **Settled Amount**: Sum(`Settlement.amount`) where `applied_to_month` = current month
- **Net Outstanding**: Gross Outstanding - Settled Amount

## 4. Relationships
- One User -> Many DailyCollections
- One User -> Many WeeklyExpenses
- One User -> Many Settlements

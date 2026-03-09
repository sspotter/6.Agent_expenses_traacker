# Worker Isolation & Switching – Implementation Plan

This document defines the **exact implementation steps** required to complete multi-worker support with **full data isolation**, **smooth switching**, **persistent unlock**, and a **default worker experience**.

This is a **blocking milestone**: no further features should be built until this is complete.

---

## 1. Current State (What Works / What Breaks)

### What Works
- Workers table exists
- `worker_id` is saved correctly on new records
- Switching workers via URL + password works
- Data is persisted in DB correctly per `worker_id`

### What Is Broken (By Design, Not Bugs)
- On refresh, UI shows **no data**
- Queries are **not filtered by `worker_id`**
- Default worker is not auto-selected cleanly
- Password unlock is **lost on refresh**
- There is no explicit "log out / lock" action

All of this is expected until worker-scoping is fully implemented.

---

## 2. Core Rule (Non-Negotiable)

> **Every read and write in the app must be scoped by `activeWorkerId`.**

If this rule is violated, data will either:
- Not appear after refresh, or
- Leak across workers

---

## 3. Phase 1 – Default Worker Bootstrap

### Goal
When the app opens:
- A worker is always selected
- Data always loads
- No blank state unless the worker truly has no data

### Tasks

1. Ensure exactly ONE default worker exists
   - First worker created OR worker with no password

2. On app load:
   - Load workers list
   - If URL has no slug → redirect to default worker
   - Set `activeWorker`

3. Persist last active worker
   - Save `activeWorkerId` to `localStorage`
   - On load:
     - Prefer stored worker
     - Fallback to default worker

---

## 4. Phase 2 – ActiveWorker as Global Source of Truth

### Goal
All data flows from **one place**.

### Tasks

1. `WorkerContext` must expose:

```ts
activeWorker: Worker | null
activeWorkerId: string | null
loading: boolean
```

2. No component may:
- Read data without `activeWorkerId`
- Write data without `activeWorkerId`

3. Switching worker must:
- Clear derived UI state
- Trigger full refetch
- Show skeleton UI

---

## 5. Phase 3 – Fix ALL Read Queries (Why Nothing Shows After Refresh)

### Root Cause
Records exist in DB, but queries are unscoped.

### Mandatory Rule

❌ This is illegal:
```ts
supabase.from('daily_collections').select('*')
```

✅ This is required:
```ts
supabase
  .from('daily_collections')
  .select('*')
  .eq('worker_id', activeWorkerId)
```

### Tables Affected
- daily_collections
- weekly_expenses
- settlements
- settlement_allocations
- expense_payments
- payment_events

### Tasks
- Audit **every hook** in `/hooks`
- Add `workerId` as an argument
- Block execution if `workerId === null`

---

## 6. Phase 4 – Fix ALL Write Operations

### Goal
No record can ever be created without a worker.

### Tasks

1. Every insert must include:
```ts
worker_id: activeWorkerId
```

2. Add runtime guard:
```ts
if (!activeWorkerId) throw new Error('No active worker');
```

3. Database should enforce:
```sql
ALTER TABLE ... ALTER COLUMN worker_id SET NOT NULL;
```
(after migration is complete)

---

## 7. Phase 5 – Persistent Password Unlock (Critical UX Fix)

### Problem
Password unlock is stored in memory only → lost on refresh.

### Solution
Persist unlock state **per worker**.

### Tasks

1. On successful password unlock:
```ts
localStorage.setItem(`worker_unlocked_${workerId}`, 'true');
```

2. On app load:
- Read unlock flags from localStorage
- Rehydrate `unlockedWorkers` set

3. Unlock logic becomes:
```ts
const isUnlocked =
  !worker.password_hash ||
  unlockedWorkers.has(worker.id);
```

---

## 8. Phase 6 – Explicit Lock / Switch (Instead of Refresh)

### Goal
Refreshing should NOT be the way to log out.

### Tasks

1. Add "Lock Worker" action in avatar dropdown

2. On lock:
```ts
remove localStorage worker_unlocked_<id>
remove activeWorkerId
navigate to default worker
```

3. Password is required again only after lock

---

## 9. Phase 7 – Skeleton Loading (Per Worker)

### Goal
Worker switching feels instant and safe.

### Tasks

1. When `activeWorkerId` changes:
- Set global loading = true
- Clear data state

2. Show skeleton for:
- Monthly grid
- Summary cards
- Weekly expenses

3. Hide skeleton only after:
- All worker-scoped queries resolve

---

## 10. Phase 8 – Mental Model (For All Devs & AI)

> **Workers are isolated universes.**

- Switching worker = switching database
- Refresh should restore the same universe
- Password controls *access*, not *data*

If something feels weird:
👉 Check where `worker_id` is missing.

---

## 11. Definition of Done ✅

- Refresh preserves visible data
- Each worker sees only their own records
- Default worker loads automatically
- Password unlock survives refresh
- Locking is explicit, not accidental
- No insert/query works without `worker_id`

---

This document must be kept in `/docs/worker-isolation.md` and treated as **source of truth**.
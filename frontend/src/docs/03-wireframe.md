# Wireframe

## 1. Page Layout (Desktop)
```
┌──────────────────────────────────────────────┐
│ Header / Month Navigation                    │
│ ◀ Prev    [ Month Year ]    Next ▶           │
├──────────────────────────────────────────────┤
│ Monthly Summary Panel                        │
│ Expected | Collected | Outstanding | Settled │
├──────────────────────────────────────────────┤
│ Daily Collection Grid (Main Area)            │
│ [Rows = Days 1-31] [Cols = Weeks 1-5]        │
├──────────────────────────────────────────────┤
│ Weekly Expense & Totals Row                  │
│ [Income] [Expense] [Net] per week            │
└──────────────────────────────────────────────┘
```

## 2. Daily Grid Structure
- **Rows**: Days (1–31)
- **Columns**: Weeks (W1–W5)
- **Cell Content**:
    - **Status Icon**: ✅ (Full), 🟡 (Partial), ❌ (Missed)
    - **Amount**: Show collected amount if Partial (e.g., "50").
    - **Interaction**: Click to open "Edit Collection" modal.

## 3. Mobile Layout
To avoid horizontal scrolling, the grid collapses into tabs:
```
[ W1 ] [ W2 ] [ W3 ] [ W4 ] [ W5 ]

Day 1   ✅ Full
Day 2   🟡 Partial (50 / 100)
Day 3   ❌ Missed
...
```

## 4. Interaction Modals

### Daily Collection Modal
```
┌──────────────────────────────┐
│ Day 5 – March 2026           │
├──────────────────────────────┤
│ Expected: 100                │
│ Collected: [   50   ]        │
│ Status: ( ) Full (●) Partial │
│ Notes: [___________________] │
│ [ Cancel ]   [ Save ]        │
└──────────────────────────────┘
```

### Settlement Modal
(Opened from Outstanding Balance or specific flow)
```
┌──────────────────────────────────────────┐
│ Settle Previous Balance                  │
├──────────────────────────────────────────┤
│ Outstanding from: March 2026             │
│ Amount received now: [  50  ]            │
│ Apply to: (●) Oldest First ( ) Specific  │
│ [ Cancel ]      [ Apply Settlement ]     │
└──────────────────────────────────────────┘
```

## 5. Visual States
- **Locked Month**: Visual indicator (e.g., 🔒 icon) when viewing past months. All inputs disabled.

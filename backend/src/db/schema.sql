-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Daily Collection Table
CREATE TABLE IF NOT EXISTS daily_collections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    expected_amount REAL NOT NULL,
    collected_amount REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK(status IN ('FULL', 'PARTIAL', 'MISSED')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- Weekly Expenses Table
CREATE TABLE IF NOT EXISTS weekly_expenses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    week_start_date TEXT NOT NULL,
    week_end_date TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Settlements Table
CREATE TABLE IF NOT EXISTS settlements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    settlement_date TEXT NOT NULL,
    amount REAL NOT NULL,
    applied_to_month TEXT NOT NULL, -- Format YYYY-MM
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

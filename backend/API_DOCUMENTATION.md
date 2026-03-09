# Agent Expenses Tracker - API Documentation

## Base URL
```
http://localhost:3000
```

## Endpoints

### 1. Daily Collections

#### Get Collections by Month
```http
GET /api/collections/:month
```
**Parameters:**
- `month` (string): Format `YYYY-MM` (e.g., `2026-01`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "date": "2026-01-15",
      "expected_amount": 100,
      "collected_amount": 80,
      "status": "PARTIAL",
      "notes": "Customer paid partial",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

#### Create or Update Collection
```http
POST /api/collections
```
**Body:**
```json
{
  "date": "2026-01-15",
  "expected_amount": 100,
  "collected_amount": 80,
  "status": "PARTIAL",
  "notes": "Optional notes"
}
```

#### Update Collection
```http
PUT /api/collections/:id
```
**Body:**
```json
{
  "expected_amount": 100,
  "collected_amount": 100,
  "status": "FULL",
  "notes": "Updated notes"
}
```

---

### 2. Weekly Expenses

#### Get Expenses by Month
```http
GET /api/expenses/:month
```

#### Create Expense
```http
POST /api/expenses
```
**Body:**
```json
{
  "week_start_date": "2026-01-06",
  "week_end_date": "2026-01-12",
  "amount": 50,
  "category": "Fuel",
  "notes": "Optional notes"
}
```

#### Update Expense
```http
PUT /api/expenses/:id
```

#### Delete Expense
```http
DELETE /api/expenses/:id
```

---

### 3. Settlements

#### Get Settlements by Month
```http
GET /api/settlements/:month
```

#### Create Settlement
```http
POST /api/settlements
```
**Body:**
```json
{
  "settlement_date": "2026-01-15",
  "amount": 50,
  "applied_to_month": "2025-12-01",
  "notes": "Settling December partial"
}
```

---

### 4. Monthly Summary

#### Get Monthly Summary
```http
GET /api/summary/:month
```

**Response:**
```json
{
  "success": true,
  "data": {
    "month": "2026-01",
    "totalExpected": 3000,
    "totalCollected": 2800,
    "grossOutstanding": 200,
    "settledAmount": 50,
    "netOutstanding": 150,
    "totalExpenses": 200,
    "cashInHand": 2600
  }
}
```

## Status Codes
- `200` - Success
- `400` - Bad Request (missing required fields)
- `500` - Server Error

## Notes
- All endpoints use Supabase RLS policies to ensure users only access their own data
- Authentication is handled via Supabase Auth (user_id automatically set)
- Dates should be in ISO format (YYYY-MM-DD)
- Amounts are stored as numeric values

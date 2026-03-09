export type CollectionStatus = 'FULL' | 'PARTIAL' | 'MISSED';
export interface Worker {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  slug: string;
  password_hash?: string;
  is_default?: boolean;
  is_admin?: boolean;
  is_suspended?: boolean;
  created_at: string;
}

export interface WorkerTelegramChat {
  id: string;
  worker_id: string;
  chat_id: string;
  label?: string;
  is_active: boolean;
  created_at: string;
}

export interface DailyCollection {
  id: string;
  user_id: string;
  worker_id: string;
  date: string; // YYYY-MM-DD
  expected_amount: number;
  collected_amount: number;
  status: CollectionStatus;
  notes?: string;
  is_expected_override?: boolean;
}

export interface WeeklyExpense {
  id: string;
  user_id: string;
  worker_id: string;
  week_start_date: string;
  week_end_date: string;
  amount: number;
  category?: string;
  notes?: string;
}

export interface Settlement {
  id: string;
  user_id: string;
  worker_id: string;
  settlement_date: string;
  amount: number;
  applied_to_month: string; // YYYY-MM
  target_date?: string; // YYYY-MM-DD for granular settlements
  source: 'SURPLUS' | 'CASH' | 'OTHER';
  source_reference_id?: string; // References monthly_surplus.id if source is SURPLUS
  notes?: string;
}

export type SettlementSource = 'SURPLUS' | 'CASH' | 'OTHER';

export interface MonthlySurplus {
  id: string;
  worker_id: string;
  month: number; // 1-12
  year: number;
  amount_total: number;
  amount_unallocated: number;
  created_at: string;
  updated_at: string;
}

export interface ExpensePayment {
  id: string;
  user_id: string;
  worker_id: string;
  expense_id: string;
  payment_date: string;
  amount: number;
  notes?: string;
}

export interface MonthSummary {
  month: string; // YYYY-MM
  total_expected: number;
  total_collected: number;
  gross_outstanding: number;
  settled_amount: number;
  net_outstanding: number;
  income_debt: number;
  expense_debt: number;
  total_debt: number;
  worked_expected: number;
  surplus_total: number; // Total over-collections in month
  surplus_unallocated: number; // Surplus not yet used in settlements
  attendance: {
    full: number;
    partial: number;
    missed: number;
  };
}
export interface SettlementAllocation {
  id: string;
  worker_id: string;
  settlement_id: string;
  collection_id: string;
  allocated_amount: number;
}

export interface PaymentEvent {
  id: string;
  user_id: string;
  worker_id: string;
  entity_type: 'DAILY_COLLECTION' | 'WEEKLY_EXPENSE';
  entity_id: string;
  event_type: 'COLLECTED' | 'SETTLED' | 'PAID' | 'CREATED';
  amount: number;
  event_date: string;
  reference_id?: string;
  metadata?: any;
  created_at: string;
}

export interface MonthlyNote {
  id: string;
  user_id: string;
  worker_id: string;
  month: string; // YYYY-MM
  text: string;
  is_checked: boolean;
  created_at: string;
  updated_at: string;
}

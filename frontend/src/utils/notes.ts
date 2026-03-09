import { format, parseISO } from 'date-fns';

/**
 * Basic timestamped note without bullets
 */
export function simpleTimestamp(notes: string): string {
  const timestamp = format(new Date(), 'MMM d, h:mm a');
  const cleanNotes = notes.trim() || 'No additional notes';
  return `[${timestamp}] ${cleanNotes}`;
}

/**
 * Appends a timestamp prefix to a note string.
 * Format: [Jan 20, 2:14 AM] Your note...
 * • Collected $50
 *   → Partial payment
 *   → Paid on Jan 20, 2026
 */
export function withTimestamp(notes?: string): string | null {
  if (!notes || !notes.trim()) return null;
  const timestamp = format(new Date(), 'MMM d, h:mm a');
  return `[${timestamp}] ${notes.trim()}`;
}

/**
 * Specifically for automated settlement notes
 * • Settled $50
 *   → Settlement from April
 *   → Settled on Apr 2, 2026
 */
export function settlementNote(amount: number, sourceMonth: string): string {
  const timestamp = format(new Date(), 'MMM d, h:mm a');
  const settledOn = format(new Date(), 'MMM d, yyyy');
  
  // sourceMonth is usually YYYY-MM
  let monthName = sourceMonth;
  try {
    monthName = format(parseISO(`${sourceMonth}-01`), 'MMMM');
  } catch (e) {}

  return `\n\n• Settled $${amount}\n  → Settlement from ${monthName}\n  → Settled on ${settledOn}`;
}

/**
 * Fallback Generic System Note
 */
export function systemNote(action: string, details?: string): string {
  const timestamp = format(new Date(), 'MMM d, h:mm a');
  return `[${timestamp}] ${action}${details ? ` - ${details}` : ''}`;
}


export function paymentTimestamp(
  notes: string,
  amount: number,
  status: string,
  date: Date | string
): string {
  const timestamp = format(new Date(), 'MMM d, h:mm a');
  const displayDate =
    typeof date === 'string'
      ? format(parseISO(date), 'MMM d, yyyy')
      : format(date, 'MMM d, yyyy');

  const cleanNotes = notes.trim() || 'No additional notes';
  const statusLabel =
    status === 'FULL' ? 'Full' :
    status === 'PARTIAL' ? 'Partial' : 'Missed';

  return `[${timestamp}] ${cleanNotes}
• Collected $${amount}
  → ${statusLabel} payment
  → Paid on ${displayDate}`;
}

// WhatsApp Inbox — pure helpers (no I/O, fully unit-tested).
// DB access lives in the route handlers following repo patterns.

export const INBOUND = 'inbound';
export const OUTBOUND = 'outbound';

const DIRECTIONS = new Set([INBOUND, OUTBOUND]);
const MESSAGE_STATUSES = new Set([
  'received',
  'read',
  'queued',
  'sent',
  'delivered',
  'failed',
]);

export function isDirection(v: unknown): v is 'inbound' | 'outbound' {
  return typeof v === 'string' && DIRECTIONS.has(v);
}

export function isMessageStatus(v: unknown): boolean {
  return typeof v === 'string' && MESSAGE_STATUSES.has(v);
}

/**
 * Normalize a phone number to digits with country code.
 * Nigerian 0813… (11 digits starting 0) → 234813…
 * Already-coded 234… numbers pass through. Everything else: digits only.
 */
export function normalizePhone(raw: unknown): string {
  const digits = String(raw ?? '').replace(/\D+/g, '');
  if (/^0\d{10}$/.test(digits)) return `234${digits.slice(1)}`;
  return digits;
}

export function validPhone(phone: string): boolean {
  return /^\d{7,15}$/.test(phone);
}

export function validBody(body: unknown): body is string {
  return typeof body === 'string' && body.trim().length >= 1 && body.length <= 4096;
}

export interface InboundParsed {
  phoneNumberId: string;
  from: string;
  text: string;
  providerId: string;
  sentAt: string;
}

/** Extract the first inbound text message from a Meta Cloud API webhook payload. */
export function extractInbound(payload: unknown): InboundParsed | null {
  if (!payload || typeof payload !== 'object') return null;
  const entry = (payload as { entry?: unknown }).entry;
  if (!Array.isArray(entry) || entry.length === 0) return null;
  const changes = (entry[0] as { changes?: unknown }).changes;
  if (!Array.isArray(changes) || changes.length === 0) return null;
  const value = (changes[0] as { value?: unknown }).value as Record<string, unknown> | undefined;
  if (!value || typeof value !== 'object') return null;
  const messages = value.messages;
  if (!Array.isArray(messages) || messages.length === 0) return null;
  const m = messages[0] as Record<string, unknown>;
  const textObj = m.text as { body?: unknown } | undefined;
  const text = typeof textObj?.body === 'string' ? textObj.body : '';
  const from = typeof m.from === 'string' ? m.from : '';
  if (!text || !from) return null;
  const metadata = value.metadata as { phone_number_id?: unknown } | undefined;
  return {
    phoneNumberId:
      typeof metadata?.phone_number_id === 'string' ? metadata.phone_number_id : '',
    from: normalizePhone(from),
    text,
    providerId: typeof m.id === 'string' ? m.id : '',
    sentAt:
      typeof m.timestamp === 'string'
        ? new Date(Number(m.timestamp) * 1000).toISOString()
        : new Date().toISOString(),
  };
}

export interface StatusUpdate {
  providerId: string;
  status: string;
}

/** Extract delivery-status updates (delivered/read/failed) from a webhook payload. */
export function extractStatuses(payload: unknown): StatusUpdate[] {
  if (!payload || typeof payload !== 'object') return [];
  const entry = (payload as { entry?: unknown }).entry;
  if (!Array.isArray(entry)) return [];
  const out: StatusUpdate[] = [];
  for (const e of entry) {
    const changes = (e as { changes?: unknown }).changes;
    if (!Array.isArray(changes)) continue;
    for (const c of changes) {
      const value = (c as { value?: unknown }).value as Record<string, unknown> | undefined;
      const statuses = value?.statuses;
      if (!Array.isArray(statuses)) continue;
      for (const s of statuses) {
        const row = s as Record<string, unknown>;
        if (typeof row.id === 'string' && typeof row.status === 'string') {
          out.push({ providerId: row.id, status: row.status });
        }
      }
    }
  }
  return out;
}

/** Map Meta status strings onto our ledger statuses (unknown → null = ignore). */
export function mapProviderStatus(status: string): string | null {
  if (status === 'delivered') return 'delivered';
  if (status === 'read') return 'read';
  if (status === 'failed' || status === 'undelivered') return 'failed';
  if (status === 'sent') return 'sent';
  return null;
}

export function preview(body: string, max = 120): string {
  const flat = body.replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
}

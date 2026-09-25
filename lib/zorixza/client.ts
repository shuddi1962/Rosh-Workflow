// Zorixza shell — authenticated JSON fetch helper (same-origin cookies).
// Throws AuthError on 401 so pages can redirect to /login.

export class AuthError extends Error {
  constructor() {
    super('Session expired. Please sign in again.');
    this.name = 'AuthError';
  }
}

export async function zxFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', ...init });
  if (res.status === 401) throw new AuthError();
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    throw new Error(`Request failed (${res.status})`);
  }
  if (!res.ok) {
    const msg =
      typeof body === 'object' && body !== null && 'error' in body
        ? String((body as Record<string, unknown>).error)
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return body as T;
}

export function fmtNaira(n: number): string {
  if (!Number.isFinite(n)) return '₦0';
  return '₦' + Math.round(n).toLocaleString('en-NG');
}

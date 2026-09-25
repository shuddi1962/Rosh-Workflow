// Zorixza shell — authenticated JSON fetch helper (same-origin cookies).
// Throws AuthError on 401 so pages can redirect to /login.
// Automatically attempts one silent refresh (15m access JWT vs 7d refresh
// cookie) before giving up.

export class AuthError extends Error {
  constructor() {
    super('Session expired. Please sign in again.');
    this.name = 'AuthError';
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        return res.ok;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

async function readBody(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function apiError(body: unknown, status: number): Error {
  const msg =
    typeof body === 'object' && body !== null && 'error' in body
      ? String((body as Record<string, unknown>).error)
      : `Request failed (${status})`;
  return new Error(msg);
}

export async function zxFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res = await fetch(path, { credentials: 'include', ...init });
  if (res.status === 401) {
    // Access JWT may have expired mid-session — renew silently once, then retry.
    const renewed = await tryRefresh();
    if (renewed) {
      res = await fetch(path, { credentials: 'include', ...init });
    }
    if (res.status === 401) throw new AuthError();
  }
  const body = await readBody(res);
  if (!res.ok) throw apiError(body, res.status);
  return body as T;
}

/** Shell entry check: cookie truth first, silent refresh second, login last. */
export async function zxSession(): Promise<{ ok: boolean; userName: string }> {
  const me = await fetch('/api/auth/me', { credentials: 'include' });
  if (me.ok) {
    const body = (await readBody(me)) as { user?: { name?: string; full_name?: string } };
    const u = body.user ?? {};
    const name = String(u.name ?? u.full_name ?? '');
    if (name && typeof window !== 'undefined') {
      try {
        localStorage.setItem('userName', name);
      } catch {
        /* private mode — ignore */
      }
    }
    return { ok: true, userName: name || 'User' };
  }
  if (me.status === 401 && (await tryRefresh())) {
    return zxSession();
  }
  return { ok: false, userName: 'User' };
}

export function fmtNaira(n: number): string {
  if (!Number.isFinite(n)) return '₦0';
  return '₦' + Math.round(n).toLocaleString('en-NG');
}

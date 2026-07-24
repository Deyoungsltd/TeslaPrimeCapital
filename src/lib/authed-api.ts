/**
 * TeslaPrimeCapital — Authenticated API Helper (`authed-api.ts`)
 * Attaches the session access token as a Bearer credential to every platform
 * API call. Reads straight from the Zustand store so it works inside effects
 * and event handlers without a hook subscription.
 *
 * Server endpoints authenticate exclusively via `Authorization: Bearer`
 * (see `extractAuthenticatedUser`) — a bare `fetch()` is always anonymous.
 */

import { useSessionStore } from '@/lib/store/session.store';

export function authedApiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const { accessToken } = useSessionStore.getState();
  const headers = new Headers(init.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return fetch(input, { ...init, headers });
}

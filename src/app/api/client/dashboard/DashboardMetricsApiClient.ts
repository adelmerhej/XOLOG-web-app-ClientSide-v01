/* eslint-disable @typescript-eslint/no-explicit-any */

'use server';

import { signIn } from '@/app/api/auth';

// Use the same base URL pattern as other clients to avoid env/token mismatches
const apiRoot = process.env.REACT_APP_API_URL;
if (!apiRoot) {
  console.error('[DashboardMetricsApiClient] Missing REACT_APP_API_URL environment variable. Requests will fail.');
}
const baseUrl = `${apiRoot}/api/v1/clients`;

// Simple in-memory token cache to avoid signing in on every metric call in a single server runtime
let cachedToken: string | undefined;
let cachedTokenFetchedAt: number | undefined;
const TOKEN_TTL_MS = 1000 * 60 * 10; // 10 minutes

type CommonParams = {
  userId?: number;
};

async function getWithAuth(path: string, queryParams?: Record<string, string>, userId?: number) {
  try {
    // Reuse cached token if still fresh
    if (!cachedToken || !cachedTokenFetchedAt || Date.now() - cachedTokenFetchedAt > TOKEN_TTL_MS) {
      const signInResult = await signIn('admin@xolog.com', 'Admin@Xolog#16');
      if (signInResult && signInResult.isOk && signInResult.data && signInResult.data.token) {
        cachedToken = signInResult.data.token;
        cachedTokenFetchedAt = Date.now();
      } else {
        console.warn('[DashboardMetricsApiClient] Sign-in failed, proceeding without token. Result:', signInResult);
      }
    }
    const token = cachedToken;

    const qs = new URLSearchParams();
    qs.set('page', '1');
    qs.set('limit', '0');

    if (queryParams) {
      for (const [k, v] of Object.entries(queryParams)) {
        if (v !== undefined && v !== null) qs.set(k, v);
      }
    }

    if (userId) {
      qs.set('userId', String(userId));
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token is provided
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const requestUrl = `${baseUrl}${path}?${qs.toString()}`;
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      let bodyText: string | undefined;
      try { bodyText = await response.text(); } catch { /* ignore */ }
      console.error('[DashboardMetricsApiClient] Non-OK response', {
        path,
        status: response.status,
        statusText: response.statusText,
        url: requestUrl,
        body: bodyText?.slice(0, 500),
      });
      throw new Error(`Failed to fetch ${path} (status ${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('DashboardMetrics getWithAuth error', { path, queryParams, userId, error });
    return [];
  }
}

export async function fetchTotalToBeLoadedCount(params: CommonParams = {}) {
  const data = await getWithAuth('/to-be-loaded', { jobStatusType: 'To Be Loaded' }, params.userId);
  const items = (data && typeof data === 'object' && 'data' in data) ? (data as any).data : data;
  return Array.isArray(items) ? items.length : 0;
}

export async function fetchTotalOnWaterCount(params: CommonParams = {}) {
  const data = await getWithAuth('/on-water', { jobStatusType: 'On Water' }, params.userId);
  const items = (data && typeof data === 'object' && 'data' in data) ? (data as any).data : data;
  return Array.isArray(items) ? items.length : 0;
}

export async function fetchTotalUnderClearanceCount(params: CommonParams = {}) {
  const data = await getWithAuth('/under-clearance', { jobStatusType: 'Under Clearance' }, params.userId);
  const items = (data && typeof data === 'object' && 'data' in data) ? (data as any).data : data;
  return Array.isArray(items) ? items.length : 0;
}

export async function fetchTotalInvoicesCount() {
  const data = await getWithAuth('/invoice-status');
  const items = (data && typeof data === 'object' && 'data' in data) ? (data as any).data : data;
  if (!Array.isArray(items)) return 0;

  let total = 0;
  for (const item of items as any[]) {
    if (Array.isArray((item as any)?.Invoices)) total += (item as any).Invoices.length;
    else if (typeof (item as any)?.InvoicesCount === 'number') total += (item as any).InvoicesCount;
    else if (typeof (item as any)?.Invoices === 'number') total += (item as any).Invoices;
  }

  return total;
}
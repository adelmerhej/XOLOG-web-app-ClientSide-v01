/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

'use server';

import { signIn } from '@/app/api/auth';

// Use the same base URL pattern as other clients to avoid env/token mismatches
const baseUrl = `${process.env.REACT_APP_API_URL}/api/v1/clients`;

type CommonParams = {
  userId?: number;
};

async function getWithAuth(path: string, queryParams?: Record<string, string>, userId?: number) {
  try {
    const signInResult = await signIn('admin@xolog.com', 'Admin@Xolog#16');
    let token: string | undefined = undefined;
    if (signInResult && signInResult.isOk && signInResult.data && signInResult.data.token) {
      token = signInResult.data.token;
    }

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

    const response = await fetch(`${baseUrl}${path}?${qs.toString()}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('DashboardMetrics getWithAuth error', error);
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
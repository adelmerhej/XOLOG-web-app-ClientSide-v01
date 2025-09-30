/* eslint-disable @typescript-eslint/no-unused-vars */

'use server';

import { signIn } from '@/app/api/auth';

// Use the same base URL pattern as other clients to avoid env/token mismatches
const baseUrl = `${process.env.REACT_APP_API_URL}/api/v1/clients`;
const getData = async(queryString?: string, token?: string, userId?: number) => {

  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (userId) {
      queryParams.set('userId', userId.toString());
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token is provided
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}/to-be-loaded${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch to be loaded jobs');
    }

    const data = await response.json();

    return data;

  } catch (error) { /* empty */ }

};

// Client-side function to fetch ongoing jobs (for React components)
export async function getTobeLoadedData(rawParams: {
  page?: number;
  limit?: number;
  jobStatusType?: string;
  token?: string; // optional caller-provided token
  fullPaid?: string;
  statusType?: string;
  departmentId?: number;
  jobType?: number;
  userId?: number;
} = {}) {
  try {
    // Create a shallow copy so we don't mutate caller's object
    const params = { ...rawParams };

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.set('page', params.page.toString());
    if (params.limit !== undefined) queryParams.set('limit', params.limit.toString());
    if (params.jobStatusType) queryParams.set('jobStatusType', params.jobStatusType);
    if (params.statusType) queryParams.set('statusType', params.statusType);
    if (params.departmentId !== undefined) queryParams.set('departmentId', params.departmentId.toString());
    if (params.fullPaid) queryParams.set('fullPaid', params.fullPaid.toString());
    if (params.jobType !== undefined) queryParams.set('jobType', params.jobType.toString());
    if (params.userId !== undefined) queryParams.set('userId', params.userId.toString());

    // Only perform sign-in if no token provided
    let token = params.token;
    if (!token) {
      const signInResult = await signIn('admin@xolog.com', 'Admin@Xolog#16');
      if (signInResult?.isOk && signInResult.data?.token) {
        token = signInResult.data.token;
      }
    }

    if (!token) {
      console.warn('[getTobeLoadedData] No auth token available; request will proceed without Authorization header.');
    }

    const queryString = queryParams.toString();

    // Log minimal safe params (omit potentially large arrays / token value)
    console.debug('[getTobeLoadedData] Fetching with params', { ...params, token: token ? '[redacted]' : undefined });

    const data = await getData(queryString, token, params.userId);
    return data || [];
  } catch (error: unknown) {
    console.error('Error fetching to be loaded jobs:', error);
    throw error;
  }
}

export async function syncTobeLoadedData() {
  try {
    // Use the getData function to fetch all Client Invoices from MongoDB
    const signInResult = await signIn('admin@xolog.com', 'Admin@Xolog#16');
    let token: string | undefined = undefined;
    if (
      signInResult &&
      signInResult.isOk &&
      signInResult.data &&
      signInResult.data.token
    ) {
      token = signInResult.data.token;
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token is provided
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/v1/sync/sync-be-loaded`,
      {
        method: 'POST',
        headers: headers,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to sync to be loaded');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error syncing to be loaded:', error);
    throw error;
  }
}


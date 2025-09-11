/* eslint-disable @typescript-eslint/no-unused-vars */

'use server';

import { signIn } from '@/app/api/auth';

const baseUrl = `${process.env.REACT_APP_API_URL}/api/v1/clients/`;

const getData = async(queryString?: string, token?: string) => {

  try {

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token is provided
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}/under-clearance${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch ongoing jobs');
    }

    const data = await response.json();

    return data;

  } catch (error) { /* empty */ }

};

// Client-side function to fetch ongoing jobs (for React components)
export async function fetchOngoingJobs(params: {
  page?: number;
  limit?: number;
  jobStatusType?: string;
  token?: string;
  fullPaid?: string;
  statusType?: string;
  departmentId?: number;
  jobType?: number;
} = {}) {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.jobStatusType) queryParams.set('jobStatusType', params.jobStatusType);
    if (params.statusType) queryParams.set('statusType', params.statusType);
    if (params.departmentId) queryParams.set('departmentId', params.departmentId.toString());
    if (params.fullPaid) queryParams.set('fullPaid', params.fullPaid.toString());
    if (params.jobType) queryParams.set('jobType', params.jobType.toString());

    // Get the query string
    const queryString = queryParams.toString();

    // Use the getData function to fetch all Job Status from MongoDB
    const signInResult = await signIn('admin@xolog.com', 'Admin@Xolog#16');
    let token: string | undefined = undefined;
    if (signInResult && signInResult.isOk && signInResult.data && signInResult.data.token) {
      token = signInResult.data.token;
    }

    params.token = token;
    const data = await getData(queryString, params.token);

    // Return the data directly - assuming the API returns the expected format

    return data || data || [];

  } catch (error: unknown) {
    console.error('Error fetching ongoing jobs:', error);

    throw error;
  }
}

export async function syncOngoingJobsData() {
  try {

    // Use the getData function to fetch all Client Invoices from MongoDB
    const signInResult = await signIn('admin@xolog.com', 'Admin@Xolog#16');
    let token: string | undefined = undefined;
    if (signInResult && signInResult.isOk && signInResult.data && signInResult.data.token) {
      token = signInResult.data.token;
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token is provided
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/sync/sync-under-clearance`, {
      method: 'POST',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error('Failed to sync Ongoing Jobs');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error syncing Ongoing Jobs:', error);
    throw error;
  }
}

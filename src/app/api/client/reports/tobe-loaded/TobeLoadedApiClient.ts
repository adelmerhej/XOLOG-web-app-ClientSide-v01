/* eslint-disable @typescript-eslint/no-unused-vars */

// Use the same base URL pattern as other clients to avoid env/token mismatches
const baseUrl = `${process.env.REACT_APP_API_URL}/api/v1/clients`;
const getData = async(queryString?: string, token?: string) => {

  try {

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token is provided
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    console.log('Fetching ongoing jobs with token:', token);

    const response = await fetch(`${baseUrl}/to-be-loaded${queryString ? `?${queryString}` : ''}`, {
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
export async function fetchTobeLoadedData(params: {
  page?: number;
  limit?: number;
  jobStatusType?: string;
  token?: string;
  fullPaid?: string;
  statusType?: string;
  departmentId?: number;
  jobType?: number;
  userId?: string | number;
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
  if (params.userId !== undefined && params.userId !== null) queryParams.set('userId', String(params.userId));

    // Get the query string
    const queryString = queryParams.toString();

    // Use the getData function to fetch all Job Status from MongoDB
    // const signInResult = await signIn('admin@xolog.com', 'Admin@Xolog#16');
    // let token: string | undefined = undefined;
    // if (signInResult && signInResult.isOk && signInResult.data && signInResult.data.token) {
    //   token = signInResult.data.token;
    // }

    //params.token = token;
    const data = await getData(queryString, params.token);

    // Return the data directly - assuming the API returns the expected format

    return data || data || [];

  } catch (error: unknown) {
    console.error('Error fetching ongoing jobs:', error);

    throw error;
  }
}

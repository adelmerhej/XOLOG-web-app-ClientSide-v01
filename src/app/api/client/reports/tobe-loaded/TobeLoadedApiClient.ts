// Use NEXT_PUBLIC_* so it's available in the browser bundle
const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/clients`;
const getData = async(queryString?: string, token?: string) => {

  try {

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header only if token looks like a JWT to avoid 'jwt malformed'
    const isLikelyJwt = typeof token === 'string' && token.split('.').length === 3;
    if (isLikelyJwt) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Debug visibility
    // console.log('Fetching To Be Loaded data', { url: `${baseUrl}/to-be-loaded`, queryString, hasToken: Boolean(token) });

  const response = await fetch(`${baseUrl}/to-be-loaded${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('ToBeLoaded fetch failed', response.status, text);
      throw new Error(`Failed to fetch To Be Loaded (${response.status})`);
    }

    const data = await response.json();

    return data;

  } catch (error) {
    console.error('ToBeLoaded fetch error', error);
    throw error;
  }

};

// Client-side function to fetch ongoing jobs (for React components)
export async function fetchTobeLoadedData(params: {
  token?: string;
  userId?: string | number;
} = {}) {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    // Only include supported params for this endpoint
    if (params.userId !== undefined && params.userId !== null) {
      queryParams.set('userId', String(params.userId));
    }

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
  return data ?? [];

  } catch (error: unknown) {
  console.error('Error fetching To Be Loaded:', error);

    throw error;
  }
}

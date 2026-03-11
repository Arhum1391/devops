/**
 * API Client Configuration
 * Uses relative URLs - all API calls go to Next.js API routes (no separate backend)
 */

/**
 * Get the full API URL for an endpoint (relative to same origin)
 */
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `/api/${cleanEndpoint}`;
}

/**
 * Fetch wrapper with default configuration for API calls
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = getApiUrl(endpoint);
  
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  return fetch(url, defaultOptions);
}

/**
 * API response handler with error handling
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `API error: ${response.statusText}`);
  }
  
  return response.json();
}


import { buildAuthHeaders } from './token';

// This function is a wrapper around fetch that automatically adds the Authorization header with the Firebase ID token.
export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = await buildAuthHeaders(init.headers);

  return fetch(input, {
    ...init,
    headers,
  });
}

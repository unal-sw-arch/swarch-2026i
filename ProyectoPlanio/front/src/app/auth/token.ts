// This component return auth token and build auth headers for fetch requests.

import { firebaseAuth } from './firebase';

export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = firebaseAuth.currentUser;
  if (!user) {
    return null;
  }

  return user.getIdToken(forceRefresh);
}

export async function buildAuthHeaders(
  headers: HeadersInit = {},
  forceRefresh = false,
): Promise<HeadersInit> {
  const token = await getIdToken(forceRefresh);
  if (!token) {
    return headers;
  }

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}

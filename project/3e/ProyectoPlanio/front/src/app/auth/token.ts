// This component return auth token and build auth headers for fetch requests.

import { firebaseAuth } from './firebase';

export async function getIdToken(forceRefresh = false): Promise<string | null> {
  // Wait for Firebase auth state to be ready if currentUser is not immediately available
  const user =
    firebaseAuth.currentUser ??
    (await new Promise<typeof firebaseAuth.currentUser>((resolve) => {
      const unsubscribe = firebaseAuth.onAuthStateChanged((u) => {
        unsubscribe();
        resolve(u);
      });
    }));

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

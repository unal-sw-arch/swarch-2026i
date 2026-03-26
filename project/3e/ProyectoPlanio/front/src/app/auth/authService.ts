// This component comunicate with firebase to perform authentication operations
// just talking with firebase using the information from login and register forms.

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type UserCredential,
} from 'firebase/auth';
import { firebaseAuth } from './firebase';

const googleProvider = new GoogleAuthProvider();

export async function registerWithEmailAndPassword(
  name: string,
  email: string,
  password: string,
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  await updateProfile(credential.user, { displayName: name });
  return credential;
}

export async function loginWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(firebaseAuth, email, password);
}

export async function loginWithGoogle(): Promise<UserCredential> {
  const credential = await signInWithPopup(firebaseAuth, googleProvider);

  if (!credential.user.displayName) {
    const fallbackName = credential.user.email?.split('@')[0] ?? 'Planio User';
    await updateProfile(credential.user, { displayName: fallbackName });
  }

  return credential;
}

export async function logout(): Promise<void> {
  await signOut(firebaseAuth);
}

export function mapFirebaseError(error: unknown): string {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
      ? (error as { code: string }).code
      : '';

  const defaultMessage = 'Authentication failed. Please try again.';

  const errorMap: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'The email format is invalid.',
    'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
    'auth/user-not-found': 'No account exists with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/popup-closed-by-user': 'Google sign-in popup was closed.',
    'auth/cancelled-popup-request': 'Google sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
  };

  return errorMap[code] ?? defaultMessage;
}

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './firebase';
import type { AuthUser } from '../types';

const LOCAL_USER_KEY = 'cardforge_current_user';
const LOCAL_USERS_DB_KEY = 'cardforge_local_users';

function toAuthUser(user: FirebaseUser | null): AuthUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
  };
}

export function getStoredLocalUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function setStoredLocalUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
  } catch {}
}

export function formatAuthError(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const code = error.code || '';
  const msg = error.message || '';

  if (code === 'auth/email-already-in-use') {
    return 'This email address is already registered. Please log in instead.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/weak-password' || msg.includes('weak-password')) {
    return 'Password must be at least 6 characters long.';
  }
  if (code === 'auth/user-not-found') {
    return 'No account found with this email. Please click "Create Account" below to register.';
  }
  if (code === 'auth/wrong-password') {
    return 'Incorrect password. Please check your password and try again.';
  }
  if (code === 'auth/invalid-credential') {
    return 'Incorrect email or password. If you do not have an account yet, click "Create Account" to sign up.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Sign in window was closed before completion.';
  }
  if (code === 'auth/cancelled-popup-request') {
    return 'Sign in was cancelled.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many failed attempts. Please try again in a few minutes.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network error. Please check your internet connection.';
  }

  return msg.replace(/^Firebase:\s*/, '') || 'Authentication failed. Please check your credentials.';
}

function getLocalUsersDB(): Record<string, { uid: string; email: string; pass: string; name: string }> {
  try {
    const localUsersRaw = localStorage.getItem(LOCAL_USERS_DB_KEY);
    const localUsers = localUsersRaw ? JSON.parse(localUsersRaw) : {};
    
    // Seed default demo accounts if not present
    if (!localUsers['sarah.jenkins@aurastudio.design']) {
      localUsers['sarah.jenkins@aurastudio.design'] = {
        uid: 'demo_user_01',
        email: 'sarah.jenkins@aurastudio.design',
        pass: 'demo123',
        name: 'Sarah Jenkins',
      };
    }
    if (!localUsers['demo@cardforge.app']) {
      localUsers['demo@cardforge.app'] = {
        uid: 'demo_user_02',
        email: 'demo@cardforge.app',
        pass: 'demo123',
        name: 'Demo User',
      };
    }
    return localUsers;
  } catch {
    return {};
  }
}

export async function signUpWithEmail(email: string, password: string, displayName?: string): Promise<AuthUser> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  if (isFirebaseConfigured && auth) {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const user = toAuthUser(cred.user);
    if (!user) throw new Error('Failed to create account');
    if (displayName && displayName.trim()) {
      user.displayName = displayName.trim();
    }
    setStoredLocalUser(user);
    return user;
  }

  // Local storage fallback for offline / unconfigured Firebase
  const localUsers = getLocalUsersDB();

  if (localUsers[cleanEmail] && localUsers[cleanEmail].uid !== 'demo_user_01') {
    const err: any = new Error('This email is already in use. Please log in.');
    err.code = 'auth/email-already-in-use';
    throw err;
  }

  const uid = 'usr_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  const name = displayName?.trim() || cleanEmail.split('@')[0];
  localUsers[cleanEmail] = { uid, email: cleanEmail, pass: password, name };
  localStorage.setItem(LOCAL_USERS_DB_KEY, JSON.stringify(localUsers));

  const authUser: AuthUser = {
    uid,
    email: cleanEmail,
    displayName: name.charAt(0).toUpperCase() + name.slice(1),
    photoURL: null,
  };
  setStoredLocalUser(authUser);
  notifyLocalAuthListeners(authUser);
  return authUser;
}

export async function loginWithEmail(email: string, password: string): Promise<AuthUser> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    throw new Error('Please enter your email and password');
  }

  if (isFirebaseConfigured && auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const user = toAuthUser(cred.user);
      if (!user) throw new Error('Failed to sign in');
      setStoredLocalUser(user);
      return user;
    } catch (err: any) {
      throw err;
    }
  }

  // Local storage fallback
  const localUsers = getLocalUsersDB();
  const existing = localUsers[cleanEmail];

  // Special convenience for demo account in local mode: allow demo login
  if (cleanEmail === 'sarah.jenkins@aurastudio.design' || cleanEmail === 'demo@cardforge.app') {
    const demoUser = await loginAsDemoUser();
    return demoUser;
  }

  if (!existing) {
    const err: any = new Error('No account found with this email. Please click "Create Free Account" to sign up.');
    err.code = 'auth/user-not-found';
    throw err;
  }

  if (existing.pass !== password) {
    const err: any = new Error('Incorrect password. Please try again.');
    err.code = 'auth/wrong-password';
    throw err;
  }

  const authUser: AuthUser = {
    uid: existing.uid,
    email: existing.email,
    displayName: existing.name || existing.email.split('@')[0],
    photoURL: null,
  };
  setStoredLocalUser(authUser);
  notifyLocalAuthListeners(authUser);
  return authUser;
}

export async function sendPasswordReset(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address');
  }

  if (isFirebaseConfigured && auth) {
    await sendPasswordResetEmail(auth, cleanEmail);
    return;
  }

  // Local mode simulation: check if account exists
  const localUsers = getLocalUsersDB();
  if (!localUsers[cleanEmail] && cleanEmail !== 'sarah.jenkins@aurastudio.design') {
    const err: any = new Error('No account found with this email.');
    err.code = 'auth/user-not-found';
    throw err;
  }
}

export async function loginWithGoogle(): Promise<AuthUser> {
  if (isFirebaseConfigured && auth && googleProvider) {
    const cred = await signInWithPopup(auth, googleProvider);
    const user = toAuthUser(cred.user);
    if (!user) throw new Error('Google sign-in failed');
    setStoredLocalUser(user);
    return user;
  }

  // Demo Google Login fallback for offline/preview mode
  const mockUid = 'goog_' + Math.random().toString(36).substring(2, 10);
  const authUser: AuthUser = {
    uid: mockUid,
    email: 'alex.morgan@gmail.com',
    displayName: 'Alex Morgan',
    photoURL: '',
  };
  setStoredLocalUser(authUser);
  notifyLocalAuthListeners(authUser);
  return authUser;
}

export async function loginAsDemoUser(): Promise<AuthUser> {
  const authUser: AuthUser = {
    uid: 'demo_user_01',
    email: 'user@example.com',
    displayName: 'Card Owner',
    photoURL: '',
  };
  setStoredLocalUser(authUser);
  notifyLocalAuthListeners(authUser);
  return authUser;
}

export async function logoutUser(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch {}
  }
  setStoredLocalUser(null);
  notifyLocalAuthListeners(null);
}

// Local event dispatcher for instantaneous UI reaction
const localAuthListeners = new Set<(user: AuthUser | null) => void>();

function notifyLocalAuthListeners(user: AuthUser | null) {
  localAuthListeners.forEach((listener) => {
    try {
      listener(user);
    } catch {}
  });
}

export function subscribeToAuth(callback: (user: AuthUser | null) => void): () => void {
  if (isFirebaseConfigured && auth) {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const user = toAuthUser(firebaseUser);
      setStoredLocalUser(user);
      callback(user);
    });
    return unsubscribe;
  }

  // Non-Firebase / offline subscription
  localAuthListeners.add(callback);
  // Send current state
  callback(getStoredLocalUser());
  return () => {
    localAuthListeners.delete(callback);
  };
}

export function getStoredUser(): AuthUser | null {
  if (isFirebaseConfigured && auth?.currentUser) {
    return toAuthUser(auth.currentUser);
  }
  return getStoredLocalUser();
}

export function saveStoredUser(user: AuthUser | null): void {
  setStoredLocalUser(user);
}

export type { AuthUser };

export const signInWithGoogle = loginWithGoogle;
export const signInWithEmail = loginWithEmail;
export const signInDemoUser = loginAsDemoUser;

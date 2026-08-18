import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Support both NEXT_PUBLIC_FB_* and VITE_FIREBASE_* environment patterns
const apiKey =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FB_API_KEY) ||
  import.meta.env.VITE_FIREBASE_API_KEY ||
  (import.meta.env as any).NEXT_PUBLIC_FB_API_KEY ||
  '';

const authDomain =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FB_AUTH_DOMAIN) ||
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
  (import.meta.env as any).NEXT_PUBLIC_FB_AUTH_DOMAIN ||
  '';

const projectId =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FB_PROJECT_ID) ||
  import.meta.env.VITE_FIREBASE_PROJECT_ID ||
  (import.meta.env as any).NEXT_PUBLIC_FB_PROJECT_ID ||
  '';

const storageBucket =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FB_STORAGE_BUCKET) ||
  import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
  (import.meta.env as any).NEXT_PUBLIC_FB_STORAGE_BUCKET ||
  '';

const messagingSenderId =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FB_MESSAGING_SENDER_ID) ||
  import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
  (import.meta.env as any).NEXT_PUBLIC_FB_MESSAGING_SENDER_ID ||
  '';

const appId =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FB_APP_ID) ||
  import.meta.env.VITE_FIREBASE_APP_ID ||
  (import.meta.env as any).NEXT_PUBLIC_FB_APP_ID ||
  '';

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

export const isFirebaseConfigured = Boolean(
  apiKey && projectId && apiKey !== 'MY_FIREBASE_API_KEY' && apiKey.length > 5
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let googleProviderInstance: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    googleProviderInstance = new GoogleAuthProvider();
    googleProviderInstance.setCustomParameters({ prompt: 'select_account' });
  } catch (err) {
    console.warn('[Firebase] Initialization notice (using local offline storage):', err);
  }
}

export { app };
export const auth = authInstance;
export const db = dbInstance;
export const googleProvider = googleProviderInstance;

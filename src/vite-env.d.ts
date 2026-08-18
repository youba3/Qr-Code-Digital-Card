/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly NEXT_PUBLIC_FB_API_KEY?: string;
  readonly NEXT_PUBLIC_FB_AUTH_DOMAIN?: string;
  readonly NEXT_PUBLIC_FB_PROJECT_ID?: string;
  readonly NEXT_PUBLIC_FB_STORAGE_BUCKET?: string;
  readonly NEXT_PUBLIC_FB_MESSAGING_SENDER_ID?: string;
  readonly NEXT_PUBLIC_FB_APP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

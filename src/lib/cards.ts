import { doc, getDoc, setDoc } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { db, isFirebaseConfigured } from './firebase';
import type { CardData, SocialProfile } from '../types';

const LOCAL_CARDS_PREFIX = 'cardforge_card_';
const LOCAL_DRAFT_KEY = 'cardforge_draft';
const SLUG_TO_UID_KEY = 'cardforge_slug_to_uid';

export const INITIAL_TEMPLATE_CARD: CardData = {
  slug: '',
  fullName: 'Sarah Jenkins',
  title: 'Lead Product Designer',
  company: 'Aura Studio',
  phone: '+1 (555) 234-5678',
  email: 'sarah@aurastudio.design',
  website: 'aurastudio.design',
  photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  theme: '#101c5e',
  layout: 'vertical',
  socials: [
    { platform: 'phone', value: '+1 (555) 234-5678', onCard: true },
    { platform: 'email', value: 'sarah@aurastudio.design', onCard: true },
    { platform: 'website', value: 'aurastudio.design', onCard: true },
    { platform: 'linkedin', value: 'sarahjenkins', onCard: true },
    { platform: 'twitter', value: 'sarahdesigns', onCard: true },
    { platform: 'instagram', value: 'sarah.j.creative', onCard: true },
    { platform: 'github', value: 'sarahjenkins', onCard: false },
    { platform: 'dribbble', value: 'sarahjenkins', onCard: true },
  ],
  scans: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Creates an initial clean card for a newly signed-up user with a stable slug
 */
export function createNewUserCard(uid: string, email?: string | null, displayName?: string | null): CardData {
  const safeSlug = (uid ? uid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) : nanoid(8)).toLowerCase();
  const userName = displayName || (email ? email.split('@')[0] : 'Your Name');
  const cleanName = userName.charAt(0).toUpperCase() + userName.slice(1);

  return {
    slug: safeSlug,
    fullName: cleanName,
    title: 'Professional Title',
    company: 'Company / Project',
    phone: '',
    email: email || '',
    website: '',
    photo: '',
    theme: '#101c5e',
    layout: 'vertical',
    socials: [
      { platform: 'email', value: email || '', onCard: true },
      { platform: 'linkedin', value: '', onCard: true },
      { platform: 'phone', value: '', onCard: true },
      { platform: 'website', value: '', onCard: true },
    ],
    scans: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Loads the user's card from Firestore (or localStorage fallback)
 */
export async function loadCard(uid: string, fallbackEmail?: string | null, displayName?: string | null): Promise<CardData> {
  if (!uid) {
    return loadLocalDraftCard();
  }

  // 1. Attempt Firestore fetch if configured
  if (isFirebaseConfigured && db) {
    try {
      const cardDocRef = doc(db, 'cards', uid);
      const snap = await getDoc(cardDocRef);
      if (snap.exists()) {
        const data = snap.data() as CardData;
        const normalized: CardData = {
          ...createNewUserCard(uid, fallbackEmail, displayName),
          ...data,
          slug: data.slug || uid.slice(0, 8).toLowerCase(),
          layout: 'vertical',
        };
        // Cache locally
        saveLocalUserCard(uid, normalized);
        return normalized;
      }
    } catch (err) {
      console.warn('[Firestore] Error loading card from cloud (checking local backup):', err);
    }
  }

  // 2. Check local storage cache for this user
  const cached = getLocalUserCard(uid);
  if (cached) {
    return cached;
  }

  // 3. Brand new user card creation
  const fresh = createNewUserCard(uid, fallbackEmail, displayName);
  saveLocalUserCard(uid, fresh);

  // Auto-persist fresh initial card to Firestore asynchronously
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'cards', uid), fresh);
    } catch (err) {
      console.warn('[Firestore] Initial card seed notice:', err);
    }
  }

  return fresh;
}

/**
 * Saves the card to Firestore cards/{uid} and local storage
 */
export async function saveCard(card: CardData, uid?: string | null): Promise<CardData> {
  const finalCard: CardData = {
    ...card,
    layout: 'vertical',
    updatedAt: new Date().toISOString(),
    scans: card.scans ?? 0,
  };

  // 1. If UID exists, save to user specific key and Firestore
  if (uid) {
    saveLocalUserCard(uid, finalCard);

    // Register slug mapping for local lookup
    registerSlugMapping(finalCard.slug, uid);

    if (isFirebaseConfigured && db) {
      try {
        const cardDocRef = doc(db, 'cards', uid);
        await setDoc(cardDocRef, finalCard, { merge: true });
      } catch (err) {
        console.warn('[Firestore] Cloud sync notice:', err);
      }
    }
  } else {
    // Guest draft
    saveLocalDraftCard(finalCard);
  }

  // Also sync to server-side API for fallback public accessibility
  try {
    fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalCard),
    }).catch(() => {});
  } catch {}

  return finalCard;
}

// Local Storage Helpers
export function getLocalUserCard(uid: string): CardData | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_CARDS_PREFIX}${uid}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveLocalUserCard(uid: string, card: CardData): void {
  try {
    localStorage.setItem(`${LOCAL_CARDS_PREFIX}${uid}`, JSON.stringify(card));
  } catch {}
}

export function loadLocalDraftCard(): CardData {
  try {
    const raw = localStorage.getItem(LOCAL_DRAFT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { ...INITIAL_TEMPLATE_CARD, slug: nanoid(8).toLowerCase() };
}

export function saveLocalDraftCard(card: CardData): void {
  try {
    localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(card));
  } catch {}
}

function registerSlugMapping(slug: string, uid: string) {
  try {
    const raw = localStorage.getItem(SLUG_TO_UID_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    map[slug] = uid;
    localStorage.setItem(SLUG_TO_UID_KEY, JSON.stringify(map));
  } catch {}
}

export function getUidBySlugFromLocal(slug: string): string | null {
  try {
    const raw = localStorage.getItem(SLUG_TO_UID_KEY);
    if (raw) {
      const map: Record<string, string> = JSON.parse(raw);
      if (map[slug]) return map[slug];
    }
  } catch {}
  return null;
}

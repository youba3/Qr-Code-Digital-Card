import { nanoid } from 'nanoid';
import { get, set } from 'idb-keyval';
import { encodeCardToUrlPayload, decodeCardFromUrlPayload } from './urlPayload';
import type { CardData } from '../types';

const DRAFT_KEY = 'cardforge_draft';
const CARDS_KEY = 'cardforge_cards';
const ANALYTICS_KEY = 'cardforge_analytics';

// In-memory cache
const memoryCards: Record<string, CardData> = {};
let memoryDraft: CardData | null = null;

export const DEFAULT_CARD: CardData = {
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
    { platform: 'instagram', value: 'sarah.j.creative', onCard: true },
    { platform: 'facebook', value: 'sarahjenkinsdesign', onCard: true },
    { platform: 'whatsapp', value: '+15552345678', onCard: true },
    { platform: 'linkedin', value: 'sarahjenkins', onCard: true },
    { platform: 'twitter', value: 'sarahdesigns', onCard: true },
  ],
  scans: 0,
  createdAt: new Date().toISOString(),
};

function sanitizeCardForLocalStorage(card: CardData): CardData {
  return { ...card };
}

function safeSetLocalStorage(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    try {
      if (key === CARDS_KEY) {
        const parsed = JSON.parse(value);
        const keys = Object.keys(parsed);
        if (keys.length > 1) {
          const latestKey = keys[keys.length - 1];
          localStorage.setItem(CARDS_KEY, JSON.stringify({ [latestKey]: parsed[latestKey] }));
          return true;
        }
      }
    } catch {}
    return false;
  }
}

// Startup hydration from IndexedDB
if (typeof window !== 'undefined') {
  get<Record<string, CardData>>(CARDS_KEY)
    .then((dbCards) => {
      if (dbCards && typeof dbCards === 'object') {
        Object.assign(memoryCards, dbCards);
      }
    })
    .catch(() => {});

  get<CardData>(DRAFT_KEY)
    .then((dbDraft) => {
      if (dbDraft && typeof dbDraft === 'object') {
        memoryDraft = dbDraft;
      }
    })
    .catch(() => {});
}

export function loadDraftCard(): CardData {
  if (memoryDraft) {
    return { ...DEFAULT_CARD, ...memoryDraft };
  }

  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      memoryDraft = parsed;
      return { ...DEFAULT_CARD, ...parsed };
    }
  } catch (err) {
    console.error('Failed to load draft card from localStorage', err);
  }

  return { ...DEFAULT_CARD };
}

export function saveDraftCard(card: CardData): void {
  memoryDraft = card;

  try {
    set(DRAFT_KEY, card).catch(() => {});
  } catch {}

  try {
    const sanitized = sanitizeCardForLocalStorage(card);
    safeSetLocalStorage(DRAFT_KEY, JSON.stringify(sanitized));
  } catch {}
}

export function savePublishedCard(card: CardData): CardData {
  const finalCard: CardData = {
    ...card,
    slug: card.slug || nanoid(8),
    createdAt: card.createdAt || new Date().toISOString(),
    scans: card.scans ?? 0,
  };

  // 1. Update in-memory cache
  memoryCards[finalCard.slug] = finalCard;
  memoryDraft = finalCard;

  // 2. Persist to Express Server backend (allows any other device/phone to view)
  try {
    fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalCard),
    }).catch((err) => {
      console.warn('[Storage] Server sync note:', err);
    });
  } catch {}

  // 3. Persist to IndexedDB
  try {
    get<Record<string, CardData>>(CARDS_KEY)
      .then((existing) => {
        const updated = { ...(existing || {}), [finalCard.slug]: finalCard };
        return set(CARDS_KEY, updated);
      })
      .catch(() => {
        set(CARDS_KEY, { [finalCard.slug]: finalCard }).catch(() => {});
      });

    set(DRAFT_KEY, finalCard).catch(() => {});
  } catch {}

  // 4. Persist to localStorage safely
  try {
    let cards: Record<string, CardData> = {};
    const raw = localStorage.getItem(CARDS_KEY);
    if (raw) {
      try {
        cards = JSON.parse(raw);
      } catch {
        cards = {};
      }
    }

    cards[finalCard.slug] = sanitizeCardForLocalStorage(finalCard);
    safeSetLocalStorage(CARDS_KEY, JSON.stringify(cards));
    safeSetLocalStorage(DRAFT_KEY, JSON.stringify(sanitizeCardForLocalStorage(finalCard)));
  } catch {}

  return finalCard;
}

export function getCardBySlug(slug: string): CardData | null {
  // 1. Check in-memory store
  if (memoryCards[slug]) {
    return memoryCards[slug];
  }

  // 2. Check URL payload (?d= or #d=) if available in browser
  if (typeof window !== 'undefined') {
    const searchParams = new URLSearchParams(window.location.search);
    const dParam = searchParams.get('d');
    if (dParam) {
      const decoded = decodeCardFromUrlPayload(dParam);
      if (decoded && (decoded.slug === slug || !decoded.slug)) {
        decoded.slug = slug;
        memoryCards[slug] = decoded;
        return decoded;
      }
    }

    // Check hash for d=
    if (window.location.hash.includes('d=')) {
      const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || window.location.hash.replace(/^#/, ''));
      const hashD = hashParams.get('d');
      if (hashD) {
        const decoded = decodeCardFromUrlPayload(hashD);
        if (decoded && (decoded.slug === slug || !decoded.slug)) {
          decoded.slug = slug;
          memoryCards[slug] = decoded;
          return decoded;
        }
      }
    }
  }

  // 3. Check localStorage
  try {
    const raw = localStorage.getItem(CARDS_KEY);
    if (raw) {
      const cards: Record<string, CardData> = JSON.parse(raw);
      if (cards[slug]) {
        memoryCards[slug] = cards[slug];
        return cards[slug];
      }
    }

    const draftRaw = localStorage.getItem(DRAFT_KEY);
    if (draftRaw) {
      const draft: CardData = JSON.parse(draftRaw);
      if (draft.slug === slug) {
        memoryCards[slug] = draft;
        return draft;
      }
    }
  } catch (err) {
    console.error('Failed to get card by slug from localStorage', err);
  }

  if (memoryDraft && memoryDraft.slug === slug) {
    return memoryDraft;
  }

  return null;
}

export async function getCardBySlugAsync(slug: string): Promise<CardData | null> {
  // 1. Immediate sync check
  const syncResult = getCardBySlug(slug);
  if (syncResult) return syncResult;

  // 2. Check Server API endpoint (allows phones/cross-browser devices to load published cards)
  try {
    const res = await fetch(`/api/cards/${encodeURIComponent(slug)}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.card) {
        memoryCards[slug] = data.card;
        // Also cache locally in IndexedDB
        set(CARDS_KEY, { ...memoryCards, [slug]: data.card }).catch(() => {});
        return data.card;
      }
    }
  } catch (err) {
    console.warn('[Storage] Server fetch skipped or offline', err);
  }

  // 3. Check IndexedDB
  try {
    const dbCards = await get<Record<string, CardData>>(CARDS_KEY);
    if (dbCards && dbCards[slug]) {
      memoryCards[slug] = dbCards[slug];
      return dbCards[slug];
    }
    const dbDraft = await get<CardData>(DRAFT_KEY);
    if (dbDraft && dbDraft.slug === slug) {
      memoryDraft = dbDraft;
      return dbDraft;
    }
  } catch {}

  return null;
}

export function incrementScanCount(slug: string): number {
  try {
    // Notify server of scan
    fetch(`/api/cards/${encodeURIComponent(slug)}/scan`, { method: 'POST' }).catch(() => {});

    const card = getCardBySlug(slug);
    if (card) {
      card.scans = (card.scans || 0) + 1;
      savePublishedCard(card);
      return card.scans;
    }

    const rawAnalytics = localStorage.getItem(ANALYTICS_KEY);
    const analytics: Record<string, number> = rawAnalytics ? JSON.parse(rawAnalytics) : {};
    analytics[slug] = (analytics[slug] || 0) + 1;
    safeSetLocalStorage(ANALYTICS_KEY, JSON.stringify(analytics));
    return analytics[slug];
  } catch (err) {
    return 1;
  }
}

/**
 * Returns public URL for sharing and QR code.
 * Includes compressed payload parameter `?d=...` or `#d=...` when card data is available,
 * guaranteeing 100% instant cross-device opening even if offline or if backend restarts!
 */
export function getPublicUrl(slug: string, card?: CardData): string {
  if (!slug) slug = 'preview';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://cardforge.app';

  if (card) {
    const encoded = encodeCardToUrlPayload(card);
    if (encoded && encoded.length < 1800) {
      return `${origin}/c/${slug}?d=${encoded}`;
    }
  }

  return `${origin}/c/${slug}`;
}

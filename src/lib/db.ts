import { collection, query, where, getDocs, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { getUidBySlugFromLocal, getLocalUserCard, loadLocalDraftCard, saveLocalUserCard } from './cards';
import { decodeCardFromUrlPayload } from './urlPayload';
import type { CardData } from '../types';

export async function getCardBySlug(slug: string): Promise<CardData | null> {
  if (!slug) return null;
  const cleanSlug = slug.trim().toLowerCase();

  // 1. Check URL encoded payload parameter (?d= or #d=) first - provides 100% offline & static-host compatibility (Netlify, Vercel, GitHub Pages)
  let urlCard: CardData | null = null;
  if (typeof window !== 'undefined') {
    const searchParams = new URLSearchParams(window.location.search);
    let dParam = searchParams.get('d');

    // Also check hash for d parameter (e.g. #/c/slug?d=... or #d=...)
    if (!dParam && window.location.hash) {
      try {
        const hashStr = window.location.hash.replace(/^#/, '');
        const hashQuery = hashStr.includes('?') ? hashStr.split('?')[1] : hashStr;
        const hashParams = new URLSearchParams(hashQuery);
        dParam = hashParams.get('d');
      } catch {}
    }

    if (dParam) {
      const decoded = decodeCardFromUrlPayload(dParam);
      if (decoded) {
        decoded.slug = decoded.slug || cleanSlug;
        if (!decoded.photo || decoded.photo.includes('images.unsplash.com')) {
          decoded.photo = '';
        }
        urlCard = decoded;
      }
    }
  }

  // 2. Fetch canonical card from backend server (if full-stack server running)
  if (cleanSlug !== 'preview') {
    try {
      const res = await fetch(`/api/cards/${encodeURIComponent(cleanSlug)}`);
      if (res.ok) {
        const json = await res.json();
        if (json?.card) {
          return json.card;
        }
      }
    } catch (err) {
      // Server not running or static host (Netlify)
    }
  }

  // 3. Query Firestore if configured
  if (isFirebaseConfigured && db && cleanSlug !== 'preview') {
    try {
      const cardsCol = collection(db, 'cards');
      const q = query(cardsCol, where('slug', '==', cleanSlug));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        const firstDoc = querySnap.docs[0];
        return { ...(firstDoc.data() as CardData), slug: cleanSlug };
      }
    } catch (err) {
      console.warn('[Firestore] Error fetching card by slug:', err);
    }
  }

  // 4. Return URL payload card if decoded (essential for Netlify & static hosts)
  if (urlCard) {
    const localUid = getUidBySlugFromLocal(cleanSlug);
    const localCard = localUid && localUid !== 'draft' ? getLocalUserCard(localUid) : null;
    const draft = loadLocalDraftCard();
    if (!urlCard.photo) {
      if (localCard?.photo && !localCard.photo.includes('images.unsplash.com')) {
        urlCard.photo = localCard.photo;
      } else if (draft?.photo && !draft.photo.includes('images.unsplash.com') && (draft.slug === cleanSlug || !draft.slug || cleanSlug === 'preview')) {
        urlCard.photo = draft.photo;
      }
    }
    return urlCard;
  }

  // 5. Check local storage / slug mapping
  const localUid = getUidBySlugFromLocal(cleanSlug);
  if (localUid) {
    if (localUid === 'draft') {
      return loadLocalDraftCard();
    }
    const localCard = getLocalUserCard(localUid);
    if (localCard) return localCard;
  }

  // 6. Check draft card
  const draft = loadLocalDraftCard();
  if (draft && draft.slug && draft.slug.toLowerCase() === cleanSlug) {
    return draft;
  }

  // 7. If slug is 'preview', return local draft
  if (cleanSlug === 'preview' && draft) {
    return draft;
  }

  return null;
}

export async function fetchCardViewCount(slug: string, uid?: string): Promise<number> {
  if (!slug) return 0;
  const cleanSlug = slug.trim().toLowerCase();

  // 1. Check Firestore if configured
  if (isFirebaseConfigured && db) {
    try {
      if (uid) {
        const cardRef = doc(db, 'cards', uid);
        const snap = await getDoc(cardRef);
        if (snap.exists()) {
          const data = snap.data() as CardData;
          if (typeof data.scans === 'number') {
            return data.scans;
          }
        }
      }
      const cardsCol = collection(db, 'cards');
      const q = query(cardsCol, where('slug', '==', cleanSlug));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        const data = querySnap.docs[0].data() as CardData;
        if (typeof data.scans === 'number') {
          return data.scans;
        }
      }
    } catch (err) {
      console.warn('[Firestore] Error fetching card view count:', err);
    }
  }

  // 2. Check Express server API
  try {
    const res = await fetch(`/api/cards/${encodeURIComponent(cleanSlug)}`);
    if (res.ok) {
      const json = await res.json();
      if (typeof json?.card?.scans === 'number') {
        return json.card.scans;
      }
    }
  } catch {}

  // 3. Check LocalStorage fallback
  const localUid = uid || getUidBySlugFromLocal(cleanSlug);
  if (localUid) {
    const local = getLocalUserCard(localUid);
    if (local && typeof local.scans === 'number') {
      return local.scans;
    }
  }

  try {
    const rawAnalytics = localStorage.getItem('cardforge_analytics');
    if (rawAnalytics) {
      const analytics = JSON.parse(rawAnalytics);
      if (typeof analytics[cleanSlug] === 'number') {
        return analytics[cleanSlug];
      }
    }
  } catch {}

  return 0;
}

export async function incrementCardScans(slug: string, uid?: string): Promise<number> {
  if (!slug) return 1;
  const cleanSlug = slug.trim().toLowerCase();

  // 1. If Firebase is active and we have UID
  if (isFirebaseConfigured && db && uid) {
    try {
      const cardRef = doc(db, 'cards', uid);
      await updateDoc(cardRef, { scans: increment(1) });
    } catch {}
  } else if (isFirebaseConfigured && db) {
    // Look up doc by slug and increment
    try {
      const cardsCol = collection(db, 'cards');
      const q = query(cardsCol, where('slug', '==', cleanSlug));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        const targetDoc = querySnap.docs[0];
        await updateDoc(targetDoc.ref, { scans: increment(1) });
      }
    } catch {}
  }

  // 2. Local storage increment
  const localUid = uid || getUidBySlugFromLocal(cleanSlug);
  if (localUid) {
    const local = getLocalUserCard(localUid);
    if (local) {
      local.scans = (local.scans || 0) + 1;
      saveLocalUserCard(localUid, local);
      return local.scans;
    }
  }

  // 3. Notify local Express server API
  try {
    fetch(`/api/cards/${encodeURIComponent(cleanSlug)}/scan`, { method: 'POST' }).catch(() => {});
  } catch {}

  return 1;
}


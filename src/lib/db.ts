import { collection, query, where, getDocs, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { getUidBySlugFromLocal, getLocalUserCard, loadLocalDraftCard, saveLocalUserCard } from './cards';
import { decodeCardFromUrlPayload } from './urlPayload';
import type { CardData } from '../types';

export async function getCardBySlug(slug: string): Promise<CardData | null> {
  if (!slug) return null;
  const cleanSlug = slug.trim().toLowerCase();

  // 1. URL encoded parameter fallback (?d= / #d=)
  if (typeof window !== 'undefined') {
    const searchParams = new URLSearchParams(window.location.search);
    const dParam = searchParams.get('d');
    if (dParam) {
      const decoded = decodeCardFromUrlPayload(dParam);
      if (decoded && (decoded.slug.toLowerCase() === cleanSlug || !decoded.slug)) {
        decoded.slug = cleanSlug;
        return decoded;
      }
    }
  }

  // 2. Query Firestore if configured
  if (isFirebaseConfigured && db) {
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

  // 3. Check local storage / slug mapping
  const localUid = getUidBySlugFromLocal(cleanSlug);
  if (localUid) {
    const localCard = getLocalUserCard(localUid);
    if (localCard) return localCard;
  }

  // 4. Check draft card
  const draft = loadLocalDraftCard();
  if (draft.slug.toLowerCase() === cleanSlug) {
    return draft;
  }

  // 5. Query local backend Express server
  try {
    const res = await fetch(`/api/cards/${encodeURIComponent(cleanSlug)}`);
    if (res.ok) {
      const json = await res.json();
      if (json?.card) {
        return json.card;
      }
    }
  } catch {}

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


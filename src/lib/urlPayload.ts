import LZString from 'lz-string';
import type { CardData, SocialProfile } from '../types';

/**
 * Encodes a card object into a compact, URL-safe string using LZString.
 * Uses ultra-short keys to ensure QR codes are fast, crisp, and 100% reliable to scan.
 */
export function encodeCardToUrlPayload(card: CardData): string {
  try {
    const socials = (card.socials || [])
      .filter((s) => s.value && s.value.trim().length > 0)
      .map((s) => ({
        p: s.platform,
        v: s.value.trim(),
        o: s.onCard ? 1 : 0,
      }));

    // Only include photo if it is a remote URL to prevent bloating QR payload
    const isRemotePhoto = card.photo && !card.photo.startsWith('data:') && card.photo.length < 300;

    const minimal: Record<string, any> = {
      s: card.slug || '',
      n: card.fullName || '',
      t: card.title || '',
      c: card.company || '',
      p: card.phone || '',
      e: card.email || '',
      w: card.website || '',
      th: card.theme || '#101c5e',
      ...(isRemotePhoto ? { ph: card.photo } : {}),
      ...(socials.length > 0 ? { soc: socials } : {}),
    };

    const json = JSON.stringify(minimal);
    return LZString.compressToEncodedURIComponent(json);
  } catch (err) {
    console.error('Failed to encode card payload', err);
    return '';
  }
}

/**
 * Decodes a compressed URL-safe string back into a CardData object.
 * Supports both ultra-compact keys and legacy verbose keys.
 */
export function decodeCardFromUrlPayload(encoded: string): CardData | null {
  try {
    if (!encoded) return null;

    let cleanEncoded = encoded.trim();
    // In case the parameter was doubly encoded by some browser or scanner
    if (cleanEncoded.includes('%')) {
      try {
        cleanEncoded = decodeURIComponent(cleanEncoded);
      } catch {}
    }

    let json = LZString.decompressFromEncodedURIComponent(cleanEncoded);
    if (!json) {
      // Fallback: try decompressing directly if not URI-encoded
      json = LZString.decompress(cleanEncoded);
    }
    if (!json) return null;

    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object') return null;

    // 1. Check ultra-compact representation
    if ('n' in parsed || 's' in parsed || 'soc' in parsed || 'p' in parsed || 'e' in parsed || 't' in parsed) {
      const socials: SocialProfile[] = Array.isArray(parsed.soc)
        ? parsed.soc.map((s: any) => ({
            platform: s.p || s.platform || 'website',
            value: s.v || s.value || '',
            onCard: s.o !== undefined ? Boolean(s.o) : (s.onCard ?? true),
          }))
        : [];

      return {
        slug: parsed.s || '',
        fullName: parsed.n || '',
        title: parsed.t || '',
        company: parsed.c || '',
        phone: parsed.p || '',
        email: parsed.e || '',
        website: parsed.w || '',
        photo: parsed.ph || '',
        theme: parsed.th || '#101c5e',
        layout: 'vertical',
        socials: socials.length > 0 ? socials : undefined,
        scans: 0,
        createdAt: new Date().toISOString(),
      };
    }

    // 2. Legacy verbose representation
    if (parsed.fullName || parsed.slug || parsed.email || parsed.phone || parsed.title) {
      return {
        slug: parsed.slug || '',
        fullName: parsed.fullName || '',
        title: parsed.title || '',
        company: parsed.company || '',
        phone: parsed.phone || '',
        email: parsed.email || '',
        website: parsed.website || '',
        photo: parsed.photo || '',
        theme: parsed.theme || '#101c5e',
        layout: 'vertical',
        socials: Array.isArray(parsed.socials) ? parsed.socials : undefined,
        scans: parsed.scans || 0,
        createdAt: parsed.createdAt || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error('Failed to decode card payload', err);
  }
  return null;
}


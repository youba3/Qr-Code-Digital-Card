import LZString from 'lz-string';
import type { CardData, SocialProfile } from '../types';

/**
 * Encodes a card object into a compact, URL-safe string using LZString.
 * Uses ultra-short keys to ensure QR codes are fast, crisp, and 100% reliable to scan.
 */
export function encodeCardToUrlPayload(card: CardData): string {
  try {
    const rawSocials = card.socials || [];
    const socials: { p: string; v: string; o: number }[] = [];
    const seenPlatforms = new Set<string>();

    // Add direct contact items first if present
    if (card.phone && card.phone.trim()) {
      const existing = rawSocials.find((s) => s.platform === 'phone');
      socials.push({ p: 'phone', v: card.phone.trim(), o: existing ? (existing.onCard ? 1 : 0) : 1 });
      seenPlatforms.add('phone');
    }
    if (card.email && card.email.trim()) {
      const existing = rawSocials.find((s) => s.platform === 'email');
      socials.push({ p: 'email', v: card.email.trim(), o: existing ? (existing.onCard ? 1 : 0) : 1 });
      seenPlatforms.add('email');
    }
    if (card.website && card.website.trim()) {
      const existing = rawSocials.find((s) => s.platform === 'website');
      socials.push({ p: 'website', v: card.website.trim(), o: existing ? (existing.onCard ? 1 : 0) : 1 });
      seenPlatforms.add('website');
    }

    // Add other social platforms
    rawSocials.forEach((s) => {
      if (s.value && s.value.trim() && !seenPlatforms.has(s.platform)) {
        socials.push({
          p: s.platform,
          v: s.value.trim(),
          o: s.onCard ? 1 : 0,
        });
        seenPlatforms.add(s.platform);
      }
    });

    // Embed photo in URL payload (remote URL, micro-thumbnail, or short data URL)
    let photoToEmbed = '';
    if (card.photoThumb && card.photoThumb.length < 1400) {
      photoToEmbed = card.photoThumb;
    } else if (
      card.photo &&
      card.photo.trim().length > 0 &&
      !card.photo.startsWith('data:') &&
      (card.photo.startsWith('http') || card.photo.startsWith('/') || card.photo.length < 300)
    ) {
      photoToEmbed = card.photo;
    } else if (card.photo && card.photo.length < 1200) {
      photoToEmbed = card.photo;
    }

    const minimal: Record<string, any> = {
      s: card.slug || '',
      n: card.fullName || '',
      t: card.title || '',
      c: card.company || '',
      p: card.phone || '',
      e: card.email || '',
      w: card.website || '',
      th: card.theme || '#101c5e',
      ...(photoToEmbed ? { ph: photoToEmbed } : {}),
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
    if (cleanEncoded.includes('%')) {
      try {
        cleanEncoded = decodeURIComponent(cleanEncoded);
      } catch {}
    }

    let json = LZString.decompressFromEncodedURIComponent(cleanEncoded);
    if (!json && cleanEncoded.includes(' ')) {
      json = LZString.decompressFromEncodedURIComponent(cleanEncoded.replace(/ /g, '+'));
    }
    if (!json) {
      json = LZString.decompress(cleanEncoded);
    }
    if (!json && cleanEncoded.includes(' ')) {
      json = LZString.decompress(cleanEncoded.replace(/ /g, '+'));
    }
    if (!json) return null;

    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object') return null;

    // 1. Check ultra-compact representation
    if (
      'n' in parsed ||
      's' in parsed ||
      'soc' in parsed ||
      'p' in parsed ||
      'e' in parsed ||
      't' in parsed ||
      'c' in parsed
    ) {
      const rawSoc: any[] = Array.isArray(parsed.soc) ? parsed.soc : [];
      const socials: SocialProfile[] = rawSoc.map((s: any) => ({
        platform: s.p || s.platform || 'website',
        value: s.v || s.value || '',
        onCard: s.o !== undefined ? Boolean(s.o) : (s.onCard ?? true),
      }));

      const phone = parsed.p || '';
      const email = parsed.e || '';
      const website = parsed.w || '';

      // Ensure phone, email, website are also represented in socials if not present
      if (phone && !socials.some((s) => s.platform === 'phone')) {
        socials.unshift({ platform: 'phone', value: phone, onCard: true });
      }
      if (email && !socials.some((s) => s.platform === 'email')) {
        const idx = socials.some((s) => s.platform === 'phone') ? 1 : 0;
        socials.splice(idx, 0, { platform: 'email', value: email, onCard: true });
      }
      if (website && !socials.some((s) => s.platform === 'website')) {
        socials.push({ platform: 'website', value: website, onCard: true });
      }

      return {
        slug: parsed.s || '',
        fullName: parsed.n || '',
        title: parsed.t || '',
        company: parsed.c || '',
        phone,
        email,
        website,
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

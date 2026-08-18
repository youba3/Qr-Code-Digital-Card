import LZString from 'lz-string';
import type { CardData } from '../types';

/**
 * Encodes a card object into a compact, URL-safe base64 string using LZString.
 */
export function encodeCardToUrlPayload(card: CardData): string {
  try {
    // Keep payload clean
    const minimal: Partial<CardData> = {
      slug: card.slug,
      fullName: card.fullName,
      title: card.title,
      company: card.company,
      phone: card.phone,
      email: card.email,
      website: card.website,
      photo: card.photo,
      theme: card.theme,
      socials: card.socials,
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
 */
export function decodeCardFromUrlPayload(encoded: string): CardData | null {
  try {
    if (!encoded) return null;
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === 'object' && (parsed.fullName || parsed.slug)) {
      return parsed as CardData;
    }
  } catch (err) {
    console.error('Failed to decode card payload', err);
  }
  return null;
}

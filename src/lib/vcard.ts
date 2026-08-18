import type { CardData } from '../types';
import { getPlatformDef } from './platforms';

export function generateVCardString(card: CardData): string {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];

  if (card.fullName?.trim()) {
    lines.push(`FN:${card.fullName.trim()}`);
    // Splitting for N (LastName;FirstName;;;)
    const parts = card.fullName.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    lines.push(`N:${lastName};${firstName};;;`);
  }

  if (card.company?.trim()) {
    lines.push(`ORG:${card.company.trim()}`);
  }

  if (card.title?.trim()) {
    lines.push(`TITLE:${card.title.trim()}`);
  }

  const phoneVal = card.phone?.trim() || card.socials?.find((s) => s.platform === 'phone')?.value?.trim();
  if (phoneVal) {
    lines.push(`TEL;TYPE=CELL:${phoneVal}`);
  }

  const emailVal = card.email?.trim() || card.socials?.find((s) => s.platform === 'email')?.value?.trim();
  if (emailVal) {
    lines.push(`EMAIL;TYPE=INTERNET,WORK:${emailVal}`);
  }

  const siteVal = card.website?.trim() || card.socials?.find((s) => s.platform === 'website')?.value?.trim();
  if (siteVal) {
    let site = siteVal;
    if (!site.startsWith('http://') && !site.startsWith('https://')) {
      site = `https://${site}`;
    }
    lines.push(`URL:${site}`);
  }

  // Social profiles (excluding phone/email/website which are handled above)
  if (card.socials && card.socials.length > 0) {
    card.socials.forEach((item) => {
      if (['phone', 'email', 'website'].includes(item.platform)) return;
      if (!item.value?.trim()) return;
      const def = getPlatformDef(item.platform);
      if (!def) return;
      const url = def.buildUrl(item.value.trim());
      if (url) {
        lines.push(`X-SOCIALPROFILE;TYPE=${item.platform.toUpperCase()}:${url}`);
      }
    });
  }

  // Optional: Embed photo if present as JPEG / PNG base64
  if (card.photo && card.photo.startsWith('data:image/')) {
    const match = card.photo.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
    if (match) {
      const type = match[1].toUpperCase() === 'PNG' ? 'PNG' : 'JPEG';
      const base64Data = match[2];
      lines.push(`PHOTO;ENCODING=b;TYPE=${type}:${base64Data}`);
    }
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export function downloadVCard(card: CardData): void {
  const vcf = generateVCardString(card);
  const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filename = `${(card.fullName || 'contact').toLowerCase().replace(/\s+/g, '_')}.vcf`;
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

import React from 'react';
import {
  SiX,
  SiInstagram,
  SiFacebook,
  SiYoutube,
  SiTiktok,
  SiGithub,
  SiWhatsapp,
  SiTelegram,
  SiSnapchat,
  SiPinterest,
  SiReddit,
  SiThreads,
  SiBluesky,
  SiMastodon,
  SiMedium,
  SiSubstack,
  SiDribbble,
  SiBehance,
  SiTwitch,
  SiSpotify,
  SiSoundcloud,
  SiDiscord,
  SiFigma,
  SiNotion,
  SiStrava,
  SiPatreon,
  SiKofi,
  SiBuymeacoffee,
  SiVimeo,
  SiTumblr,
  SiQuora,
  SiStackoverflow,
  SiDevdotto,
  SiHashnode,
  SiProducthunt,
  SiLinktree,
} from 'react-icons/si';
import { FaLinkedin, FaSlack } from 'react-icons/fa6';
import { Globe, Phone, Mail, Link as LinkIcon, Compass } from 'lucide-react';
import type { PlatformDef } from '../types';

export const PLATFORMS: PlatformDef[] = [
  // 1. Direct Contact
  {
    id: 'phone',
    label: 'Phone',
    icon: Phone,
    brandColor: '#059669',
    placeholder: '+1 (555) 234-5678',
    category: 'direct',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('tel:')) return val;
      const clean = val.replace(/[^\d+]/g, '');
      return `tel:${clean}`;
    },
  },
  {
    id: 'email',
    label: 'Email',
    icon: Mail,
    brandColor: '#2563EB',
    placeholder: 'your.name@company.com',
    category: 'direct',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('mailto:')) return val;
      return `mailto:${val.trim()}`;
    },
  },
  {
    id: 'website',
    label: 'Website',
    icon: Globe,
    brandColor: '#4f46e5',
    placeholder: 'yourwebsite.com',
    category: 'direct',
    buildUrl: (val: string) => {
      if (!val) return '';
      const clean = val.trim();
      if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
      return `https://${clean}`;
    },
  },

  // 2. Primary Professional & Social
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: FaLinkedin,
    brandColor: '#0A66C2',
    placeholder: 'username or in/profile',
    category: 'social',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      const clean = val.replace(/^in\//, '').replace(/^@+/, '').trim();
      return `https://linkedin.com/in/${clean}`;
    },
  },
  {
    id: 'twitter',
    label: 'X (Twitter)',
    icon: SiX,
    brandColor: '#000000',
    placeholder: '@handle or username',
    category: 'social',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      const clean = val.replace(/^@+/, '').trim();
      return `https://x.com/${clean}`;
    },
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: SiInstagram,
    brandColor: '#E4405F',
    placeholder: '@handle or username',
    category: 'social',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      const clean = val.replace(/^@+/, '').trim();
      return `https://instagram.com/${clean}`;
    },
  },
  {
    id: 'github',
    label: 'GitHub',
    icon: SiGithub,
    brandColor: '#181717',
    placeholder: 'username',
    category: 'dev',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      const clean = val.replace(/^@+/, '').trim();
      return `https://github.com/${clean}`;
    },
  },
  {
    id: 'youtube',
    label: 'YouTube',
    icon: SiYoutube,
    brandColor: '#FF0000',
    placeholder: '@channel or link',
    category: 'social',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      const clean = val.replace(/^@+/, '').trim();
      return `https://youtube.com/@${clean}`;
    },
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: SiTiktok,
    brandColor: '#000000',
    placeholder: '@username',
    category: 'social',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      const clean = val.replace(/^@+/, '').trim();
      return `https://tiktok.com/@${clean}`;
    },
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: SiWhatsapp,
    brandColor: '#25D366',
    placeholder: 'Phone with country code (e.g. +14155552671)',
    category: 'direct',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      const digits = val.replace(/\D/g, '');
      return `https://wa.me/${digits}`;
    },
  },
  {
    id: 'telegram',
    label: 'Telegram',
    icon: SiTelegram,
    brandColor: '#229ED9',
    placeholder: 'username or t.me/channel',
    category: 'direct',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      const clean = val.replace(/^@+/, '').replace(/^t\.me\//, '').trim();
      return `https://t.me/${clean}`;
    },
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: SiFacebook,
    brandColor: '#1877F2',
    placeholder: 'username or profile URL',
    category: 'social',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      const clean = val.replace(/^@+/, '').trim();
      return `https://facebook.com/${clean}`;
    },
  },
  {
    id: 'threads',
    label: 'Threads',
    icon: SiThreads,
    brandColor: '#000000',
    placeholder: '@username',
    category: 'social',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      const clean = val.replace(/^@+/, '').trim();
      return `https://threads.net/@${clean}`;
    },
  },
  {
    id: 'bluesky',
    label: 'Bluesky',
    icon: SiBluesky,
    brandColor: '#0285FF',
    placeholder: 'handle.bsky.social',
    category: 'social',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      const clean = val.replace(/^@+/, '').trim();
      return `https://bsky.app/profile/${clean}`;
    },
  },
  {
    id: 'mastodon',
    label: 'Mastodon',
    icon: SiMastodon,
    brandColor: '#6364FF',
    placeholder: '@user@instance.social or link',
    category: 'social',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://mastodon.social/@${val.replace(/^@+/, '')}`;
    },
  },
  {
    id: 'discord',
    label: 'Discord',
    icon: SiDiscord,
    brandColor: '#5865F2',
    placeholder: 'Server invite code or tag',
    category: 'direct',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      if (val.startsWith('discord.gg/')) return `https://${val}`;
      return `https://discord.gg/${val.trim()}`;
    },
  },
  {
    id: 'slack',
    label: 'Slack',
    icon: FaSlack,
    brandColor: '#4A154B',
    placeholder: 'workspace.slack.com or invite URL',
    category: 'direct',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://${val.trim()}`;
    },
  },

  // 3. Creative & Portfolio
  {
    id: 'dribbble',
    label: 'Dribbble',
    icon: SiDribbble,
    brandColor: '#EA4C89',
    placeholder: 'username',
    category: 'creative',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://dribbble.com/${val.replace(/^@+/, '').trim()}`;
    },
  },
  {
    id: 'behance',
    label: 'Behance',
    icon: SiBehance,
    brandColor: '#1769FF',
    placeholder: 'username',
    category: 'creative',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://behance.net/${val.replace(/^@+/, '').trim()}`;
    },
  },
  {
    id: 'figma',
    label: 'Figma',
    icon: SiFigma,
    brandColor: '#F24E1E',
    placeholder: '@handle or community profile',
    category: 'creative',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://figma.com/@${val.replace(/^@+/, '').trim()}`;
    },
  },
  {
    id: 'notion',
    label: 'Notion',
    icon: SiNotion,
    brandColor: '#000000',
    placeholder: 'Public notion site or page link',
    category: 'creative',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://${val.trim()}`;
    },
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    icon: SiPinterest,
    brandColor: '#BD081C',
    placeholder: 'username',
    category: 'creative',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://pinterest.com/${val.replace(/^@+/, '').trim()}`;
    },
  },
  {
    id: 'vimeo',
    label: 'Vimeo',
    icon: SiVimeo,
    brandColor: '#1AB7EA',
    placeholder: 'username or channel',
    category: 'creative',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://vimeo.com/${val.replace(/^@+/, '').trim()}`;
    },
  },

  // 4. Music & Audio & Streaming
  {
    id: 'spotify',
    label: 'Spotify',
    icon: SiSpotify,
    brandColor: '#1DB954',
    placeholder: 'Artist ID or profile URL',
    category: 'creative',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://open.spotify.com/artist/${val.trim()}`;
    },
  },
  {
    id: 'soundcloud',
    label: 'SoundCloud',
    icon: SiSoundcloud,
    brandColor: '#FF3300',
    placeholder: 'username',
    category: 'creative',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://soundcloud.com/${val.replace(/^@+/, '').trim()}`;
    },
  },
  {
    id: 'twitch',
    label: 'Twitch',
    icon: SiTwitch,
    brandColor: '#9146FF',
    placeholder: 'channel name',
    category: 'creative',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://twitch.tv/${val.replace(/^@+/, '').trim()}`;
    },
  },

  // 5. Publishing & Writing
  {
    id: 'medium',
    label: 'Medium',
    icon: SiMedium,
    brandColor: '#000000',
    placeholder: '@username',
    category: 'creative',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://medium.com/@${val.replace(/^@+/, '').trim()}`;
    },
  },
  {
    id: 'substack',
    label: 'Substack',
    icon: SiSubstack,
    brandColor: '#FF6719',
    placeholder: 'publication.substack.com',
    category: 'creative',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      if (val.includes('.substack.com')) return `https://${val.trim()}`;
      return `https://${val.trim()}.substack.com`;
    },
  },
  {
    id: 'reddit',
    label: 'Reddit',
    icon: SiReddit,
    brandColor: '#FF4500',
    placeholder: 'u/username',
    category: 'social',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      const clean = val.replace(/^u\//, '').replace(/^@+/, '').trim();
      return `https://reddit.com/user/${clean}`;
    },
  },
  {
    id: 'tumblr',
    label: 'Tumblr',
    icon: SiTumblr,
    brandColor: '#36465D',
    placeholder: 'username.tumblr.com',
    category: 'social',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      if (val.includes('.tumblr.com')) return `https://${val.trim()}`;
      return `https://${val.trim()}.tumblr.com`;
    },
  },
  {
    id: 'quora',
    label: 'Quora',
    icon: SiQuora,
    brandColor: '#B92B27',
    placeholder: 'profile name or link',
    category: 'social',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://quora.com/profile/${val.trim()}`;
    },
  },

  // 6. Developer & Tech
  {
    id: 'stackoverflow',
    label: 'Stack Overflow',
    icon: SiStackoverflow,
    brandColor: '#F58025',
    placeholder: 'user ID or profile link',
    category: 'dev',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://stackoverflow.com/users/${val.trim()}`;
    },
  },
  {
    id: 'devto',
    label: 'DEV Community',
    icon: SiDevdotto,
    brandColor: '#0A0A0A',
    placeholder: 'username',
    category: 'dev',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://dev.to/${val.replace(/^@+/, '').trim()}`;
    },
  },
  {
    id: 'hashnode',
    label: 'Hashnode',
    icon: SiHashnode,
    brandColor: '#2962FF',
    placeholder: '@username or blog domain',
    category: 'dev',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://hashnode.com/@${val.replace(/^@+/, '').trim()}`;
    },
  },
  {
    id: 'producthunt',
    label: 'Product Hunt',
    icon: SiProducthunt,
    brandColor: '#DA552F',
    placeholder: '@username',
    category: 'dev',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://producthunt.com/@${val.replace(/^@+/, '').trim()}`;
    },
  },

  // 7. Creator Support & Monetization
  {
    id: 'patreon',
    label: 'Patreon',
    icon: SiPatreon,
    brandColor: '#FF424D',
    placeholder: 'page name',
    category: 'creative',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://patreon.com/${val.replace(/^@+/, '').trim()}`;
    },
  },
  {
    id: 'kofi',
    label: 'Ko-fi',
    icon: SiKofi,
    brandColor: '#13C3FF',
    placeholder: 'username',
    category: 'creative',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://ko-fi.com/${val.replace(/^@+/, '').trim()}`;
    },
  },
  {
    id: 'buymeacoffee',
    label: 'Buy Me a Coffee',
    icon: SiBuymeacoffee,
    brandColor: '#FFDD00',
    placeholder: 'username',
    category: 'creative',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://buymeacoffee.com/${val.replace(/^@+/, '').trim()}`;
    },
  },

  // 8. Miscellaneous & Social
  {
    id: 'snapchat',
    label: 'Snapchat',
    icon: SiSnapchat,
    brandColor: '#FFFC00',
    placeholder: 'username',
    category: 'social',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://snapchat.com/add/${val.replace(/^@+/, '').trim()}`;
    },
  },
  {
    id: 'strava',
    label: 'Strava',
    icon: SiStrava,
    brandColor: '#FC4C02',
    placeholder: 'athlete ID or profile URL',
    category: 'social',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://strava.com/athletes/${val.trim()}`;
    },
  },
  {
    id: 'linktree',
    label: 'Linktree',
    icon: SiLinktree,
    brandColor: '#43E660',
    placeholder: 'username or link',
    category: 'direct',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://linktr.ee/${val.replace(/^@+/, '').trim()}`;
    },
  },
];

export const TOP_QUICK_PLATFORMS = [
  'phone',
  'email',
  'website',
  'linkedin',
  'twitter',
  'instagram',
  'github',
  'whatsapp',
  'youtube',
  'tiktok',
  'telegram',
  'discord',
];

export function getPlatformDef(id: string): PlatformDef | undefined {
  const match = PLATFORMS.find((p) => p.id.toLowerCase() === id.toLowerCase());
  if (match) return match;
  return dynamicPlatform(id);
}

/**
 * Fallback dynamic platform generator for any custom brand name or unrecognized service
 */
export function dynamicPlatform(name: string): PlatformDef {
  const cleanId = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanLabel = name.charAt(0).toUpperCase() + name.slice(1);

  // Generate deterministic branded color based on string hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  const brandColor = `hsl(${hue}, 65%, 45%)`;

  return {
    id: cleanId || 'custom',
    label: cleanLabel || 'Custom Link',
    icon: Compass,
    brandColor,
    placeholder: 'Profile handle or URL',
    category: 'social',
    buildUrl: (val: string) => {
      if (!val) return '';
      if (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('mailto:') || val.startsWith('tel:')) {
        return val;
      }
      return `https://${val.trim()}`;
    },
  };
}

/**
 * Auto-detects platform when a URL or handle is pasted
 */
export function detectPlatformFromUrl(input: string): string | null {
  if (!input) return null;
  const str = input.toLowerCase().trim();

  if (str.startsWith('tel:') || /^\+?[\d\s\-()]{7,20}$/.test(str)) return 'phone';
  if (str.startsWith('mailto:') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) return 'email';

  const domainMappings: Array<{ platform: string; matchers: string[] }> = [
    { platform: 'linkedin', matchers: ['linkedin.com'] },
    { platform: 'twitter', matchers: ['twitter.com', 'x.com'] },
    { platform: 'instagram', matchers: ['instagram.com', 'instagr.am'] },
    { platform: 'github', matchers: ['github.com'] },
    { platform: 'youtube', matchers: ['youtube.com', 'youtu.be'] },
    { platform: 'tiktok', matchers: ['tiktok.com'] },
    { platform: 'whatsapp', matchers: ['wa.me', 'whatsapp.com'] },
    { platform: 'telegram', matchers: ['t.me', 'telegram.me'] },
    { platform: 'facebook', matchers: ['facebook.com', 'fb.com', 'fb.me'] },
    { platform: 'threads', matchers: ['threads.net'] },
    { platform: 'bluesky', matchers: ['bsky.app', 'bsky.social'] },
    { platform: 'mastodon', matchers: ['mastodon.social', 'mstdn.social'] },
    { platform: 'discord', matchers: ['discord.gg', 'discord.com'] },
    { platform: 'slack', matchers: ['slack.com'] },
    { platform: 'dribbble', matchers: ['dribbble.com'] },
    { platform: 'behance', matchers: ['behance.net'] },
    { platform: 'figma', matchers: ['figma.com'] },
    { platform: 'notion', matchers: ['notion.so', 'notion.site'] },
    { platform: 'pinterest', matchers: ['pinterest.com'] },
    { platform: 'vimeo', matchers: ['vimeo.com'] },
    { platform: 'spotify', matchers: ['spotify.com', 'open.spotify.com'] },
    { platform: 'soundcloud', matchers: ['soundcloud.com'] },
    { platform: 'twitch', matchers: ['twitch.tv'] },
    { platform: 'medium', matchers: ['medium.com'] },
    { platform: 'substack', matchers: ['substack.com'] },
    { platform: 'reddit', matchers: ['reddit.com'] },
    { platform: 'tumblr', matchers: ['tumblr.com'] },
    { platform: 'quora', matchers: ['quora.com'] },
    { platform: 'stackoverflow', matchers: ['stackoverflow.com'] },
    { platform: 'devto', matchers: ['dev.to'] },
    { platform: 'hashnode', matchers: ['hashnode.com', 'hashnode.dev'] },
    { platform: 'producthunt', matchers: ['producthunt.com'] },
    { platform: 'patreon', matchers: ['patreon.com'] },
    { platform: 'kofi', matchers: ['ko-fi.com'] },
    { platform: 'buymeacoffee', matchers: ['buymeacoffee.com'] },
    { platform: 'snapchat', matchers: ['snapchat.com'] },
    { platform: 'strava', matchers: ['strava.com'] },
    { platform: 'linktree', matchers: ['linktr.ee'] },
  ];

  for (const { platform, matchers } of domainMappings) {
    if (matchers.some((m) => str.includes(m))) {
      return platform;
    }
  }

  return null;
}

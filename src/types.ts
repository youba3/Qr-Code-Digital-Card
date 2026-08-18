import React from 'react';

export interface SocialProfile {
  platform: string;
  value: string;
  onCard: boolean;
}

export interface CardData {
  slug: string;
  fullName: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  photo: string;
  theme: string;
  layout: 'vertical';
  language?: string;
  socials: SocialProfile[];
  scans?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlatformDef {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number | string; style?: React.CSSProperties }>;
  brandColor: string;
  placeholder: string;
  prefix?: string;
  category?: 'direct' | 'social' | 'creative' | 'dev';
  buildUrl: (handleOrUrl: string) => string;
}

export interface AuthUser {
  uid: string;
  id?: string;
  email: string | null;
  displayName: string | null;
  name?: string;
  photoURL: string | null;
  avatar?: string;
  isAnonymous?: boolean;
}

export const THEME_PALETTE = [
  { id: 'navy', color: '#101c5e', name: 'Deep Navy' },
  { id: 'indigo', color: '#2c2a72', name: 'Royal Indigo' },
  { id: 'plum', color: '#3d2f86', name: 'Velvet Plum' },
  { id: 'violet', color: '#4d3699', name: 'Regal Violet' },
  { id: 'purple', color: '#5f3fac', name: 'Electric Purple' },
  { id: 'amethyst', color: '#7a4fc0', name: 'Bright Amethyst' },
  { id: 'emerald', color: '#059669', name: 'Emerald Green' },
  { id: 'rose', color: '#e11d48', name: 'Rose Sunset' },
  { id: 'slate', color: '#334155', name: 'Carbon Slate' },
  { id: 'amber', color: '#d97706', name: 'Amber Gold' },
];

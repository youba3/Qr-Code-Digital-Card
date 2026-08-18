import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import {
  UserPlus,
  Share2,
  Check,
  ExternalLink,
  QrCode,
  Eye,
  User,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  Sparkles,
  ArrowRight,
  Download,
  CreditCard,
} from 'lucide-react';
import { getPlatformDef, dynamicPlatform } from '../lib/platforms';
import { downloadVCard } from '../lib/vcard';
import { getCardBySlug, incrementCardScans } from '../lib/db';
import { getPublicUrl } from '../lib/storage';
import { decodeCardFromUrlPayload } from '../lib/urlPayload';
import { loadLocalDraftCard, getUidBySlugFromLocal, getLocalUserCard } from '../lib/cards';
import type { CardData, SocialProfile } from '../types';

interface PublicCardProps {
  slug: string;
  fallbackCard?: CardData;
  onNavigateToEditor: () => void;
  onNavigateToHome?: () => void;
}

export const PublicCard: React.FC<PublicCardProps> = ({
  slug,
  fallbackCard,
  onNavigateToEditor,
  onNavigateToHome,
}) => {
  const { t } = useTranslation();
  const [photoError, setPhotoError] = useState(false);

  // 1. Immediately resolve initial card data synchronously so user info appears instantly
  const initialCard = useMemo(() => {
    const cleanSlug = (slug || 'preview').trim().toLowerCase();
    const draft = loadLocalDraftCard();
    const localUid = typeof window !== 'undefined' ? getUidBySlugFromLocal(cleanSlug) : null;
    const localCard = localUid && localUid !== 'draft' ? getLocalUserCard(localUid) : null;
    const candidatePhoto =
      fallbackCard?.photo ||
      localCard?.photo ||
      (draft?.photo && (draft.slug === cleanSlug || !draft.slug || cleanSlug === 'preview') ? draft.photo : '');
    const existingPhoto = candidatePhoto && !candidatePhoto.includes('images.unsplash.com') ? candidatePhoto : '';

    // Check URL payload (?d= or #d=)
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      let dParam = searchParams.get('d');
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
          if (!decoded.photo && existingPhoto) {
            decoded.photo = existingPhoto;
          }
          return decoded;
        }
      }
    }

    // Check if fallbackCard from editor matches
    if (fallbackCard && (fallbackCard.slug === cleanSlug || !cleanSlug || cleanSlug === 'preview')) {
      return fallbackCard;
    }

    if (localCard) {
      return localCard;
    }

    // Check local draft card
    if (draft && (draft.slug === cleanSlug || cleanSlug === 'preview' || !draft.slug)) {
      return draft;
    }

    return null;
  }, [slug, fallbackCard]);

  const [card, setCard] = useState<CardData | null>(initialCard);
  const [loading, setLoading] = useState<boolean>(!initialCard);
  const [scans, setScans] = useState<number>(initialCard?.scans || 0);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [savedContact, setSavedContact] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;
    if (!initialCard) {
      setLoading(true);
    }

    getCardBySlug(slug).then((loaded) => {
      if (!isMounted) return;
      if (loaded) {
        if (!loaded.photo && initialCard?.photo) {
          loaded.photo = initialCard.photo;
        }
        setCard(loaded);
        setPhotoError(false);
        setScans(loaded.scans || 0);
        incrementCardScans(loaded.slug || slug, (loaded as any).uid).then((count) => {
          if (isMounted && count) setScans(count);
        });
      } else if (initialCard) {
        setCard(initialCard);
        setPhotoError(false);
        setScans(initialCard.scans || 0);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [slug, initialCard]);

  useEffect(() => {
    setPhotoError(false);
  }, [card?.photo]);

  const handleSaveContact = () => {
    if (!card) return;
    downloadVCard(card);
    setSavedContact(true);
    setTimeout(() => setSavedContact(false), 3000);
  };

  const handleCopyLink = async () => {
    try {
      const url = getPublicUrl(slug || card?.slug || '', card || undefined);
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleShare = async () => {
    if (!card) return;
    const url = getPublicUrl(slug || card.slug, card);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${card.fullName || 'Contact'} - ${t('common.brand')}`,
          text: `Contact card for ${card.fullName || 'User'}`,
          url: url,
        });
      } catch (err) {
        console.error('Share cancelled', err);
      }
    } else {
      handleCopyLink();
    }
  };

  // Compile all unified contact & social items
  const allChannels = useMemo(() => {
    if (!card) return [];

    const list: SocialProfile[] = [];
    const seen = new Set<string>();

    // Add items from card.socials
    (card.socials || []).forEach((s) => {
      if (s.value && s.value.trim().length > 0) {
        list.push(s);
        seen.add(s.platform.toLowerCase());
      }
    });

    // If card.phone/email/website exist and weren't in socials array, append them
    if (card.phone && card.phone.trim() && !seen.has('phone')) {
      list.unshift({ platform: 'phone', value: card.phone.trim(), onCard: true });
      seen.add('phone');
    }
    if (card.email && card.email.trim() && !seen.has('email')) {
      const insertIdx = seen.has('phone') ? 1 : 0;
      list.splice(insertIdx, 0, { platform: 'email', value: card.email.trim(), onCard: true });
      seen.add('email');
    }
    if (card.website && card.website.trim() && !seen.has('website')) {
      list.push({ platform: 'website', value: card.website.trim(), onCard: true });
      seen.add('website');
    }

    return list;
  }, [card]);

  // Categories available among current items
  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add('all');
    allChannels.forEach((item) => {
      const def = getPlatformDef(item.platform);
      if (def?.category) {
        cats.add(def.category);
      }
    });
    return Array.from(cats);
  }, [allChannels]);

  const filteredChannels = useMemo(() => {
    if (activeCategory === 'all') return allChannels;
    return allChannels.filter((item) => {
      const def = getPlatformDef(item.platform);
      return def?.category === activeCategory;
    });
  }, [allChannels, activeCategory]);

  if (loading && !card) {
    return (
      <div className="min-h-screen bg-[#eef0f7] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-lg border border-slate-200 flex flex-col items-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 animate-pulse"
            style={{
              background: 'linear-gradient(135deg, #101c5e 0%, #3d2f86 50%, #7a4fc0 100%)',
            }}
          >
            <CreditCard className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-base font-bold text-slate-800 font-display mb-1">
            {t('publicCard.loadingTitle')}
          </h2>
          <p className="text-xs text-slate-400">
            Retrieving vertical business card details
          </p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-[#eef0f7] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-lg border border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 text-2xl">
            <Eye className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display mb-2">
            Card Not Found
          </h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            The business card for &ldquo;{slug}&rdquo; hasn't been published yet or the link is incorrect.
          </p>
          <button
            type="button"
            onClick={onNavigateToEditor}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #101c5e 0%, #3d2f86 50%, #7a4fc0 100%)',
            }}
          >
            Create Your Own Digital Card
          </button>
        </div>
      </div>
    );
  }

  const accentColor = card.theme || '#101c5e';
  const publicUrl = getPublicUrl(card.slug || slug, card);
  const safeQrValue = publicUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/c/${(card.slug || slug || 'preview').toLowerCase()}`;

  // Direct quick actions
  const phoneItem = allChannels.find((s) => s.platform.toLowerCase() === 'phone');
  const emailItem = allChannels.find((s) => s.platform.toLowerCase() === 'email');
  const whatsappItem = allChannels.find((s) => s.platform.toLowerCase() === 'whatsapp');
  const websiteItem = allChannels.find((s) => s.platform.toLowerCase() === 'website');

  return (
    <div className="min-h-screen bg-[#eef0f7] flex flex-col items-center justify-start p-3 sm:p-6 md:p-8 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation Bar */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <button
          type="button"
          id="public-create-card-btn"
          onClick={onNavigateToHome || onNavigateToEditor}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs transition-all active:scale-95 cursor-pointer"
          title={t('common.brand')}
        >
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px]"
            style={{
              background: 'linear-gradient(135deg, #101c5e 0%, #7a4fc0 100%)',
            }}
          >
            <CreditCard className="w-2.5 h-2.5" />
          </div>
          <span>{t('common.brand')}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            title="Show QR Code"
            className="p-2 rounded-full bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleShare}
            title="Share Link"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE-FIRST CENTERED PUBLIC CARD */}
      <div
        id="public-contact-card"
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden text-slate-800 transition-all"
        style={{
          boxShadow:
            '0 25px 50px -12px rgba(16, 28, 94, 0.15), 0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        {/* Accent Banner with subtle gradient */}
        <div
          className="h-32 sm:h-36 w-full relative transition-colors duration-300"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, #7a4fc0 100%)`,
          }}
        >
          <div className="absolute inset-0 bg-white/5 backdrop-blur-2xs" />
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        </div>

        {/* Card Body */}
        <div className="px-6 pb-8 pt-0 relative">
          {/* Overlapping Circular Photo */}
          <div className="-mt-16 sm:-mt-18 mb-4 flex justify-between items-end">
            <div
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-white shadow-lg overflow-hidden border-2"
              style={{ borderColor: accentColor }}
            >
              {card.photo && !photoError ? (
                <img
                  src={card.photo}
                  alt={card.fullName || 'Contact'}
                  className="w-full h-full object-cover rounded-full"
                  onError={() => setPhotoError(true)}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="w-full h-full rounded-full flex items-center justify-center font-display font-bold text-2xl text-white shadow-inner"
                  style={{ backgroundColor: accentColor }}
                >
                  {card.fullName?.trim() ? (
                    card.fullName
                      .trim()
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  ) : (
                    <User className="w-8 h-8" />
                  )}
                </div>
              )}
            </div>

            {/* Scan Counter Badge */}
            {scans > 0 && (
              <div className="mb-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>
                  {scans} {scans === 1 ? 'view' : 'views'}
                </span>
              </div>
            )}
          </div>

          {/* Name and Title · Company */}
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              {card.fullName || 'Contact Name'}
            </h1>
            <p className="text-sm font-medium text-slate-600 mt-1 flex items-center flex-wrap gap-1.5">
              {card.title && <span>{card.title}</span>}
              {card.title && card.company && <span className="text-slate-300">·</span>}
              {card.company && (
                <span className="font-semibold" style={{ color: accentColor }}>
                  {card.company}
                </span>
              )}
            </p>
          </div>

          {/* Primary "Save Contact" Button */}
          <button
            type="button"
            id="save-contact-public-btn"
            onClick={handleSaveContact}
            className="w-full py-3.5 px-6 rounded-2xl text-sm font-bold text-white shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 transition-all hover:brightness-110 active:scale-98 mb-5 cursor-pointer"
            style={{ backgroundColor: accentColor }}
          >
            <UserPlus className="w-4.5 h-4.5" />
            <span>{savedContact ? 'Contact Saved (.vcf)!' : 'Save to Contacts'}</span>
          </button>

          {/* QUICK DIRECT REACH ACTIONS ROW */}
          {(phoneItem || emailItem || whatsappItem || websiteItem) && (
            <div className="grid grid-cols-4 gap-2 mb-6">
              {phoneItem && (
                <a
                  href={`tel:${phoneItem.value.replace(/[^\d+]/g, '')}`}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 transition-colors shadow-2xs group"
                  title="Call Phone"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1 shadow-2xs group-hover:scale-105 transition-transform">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold">Call</span>
                </a>
              )}

              {emailItem && (
                <a
                  href={`mailto:${emailItem.value.trim()}`}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 transition-colors shadow-2xs group"
                  title="Send Email"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mb-1 shadow-2xs group-hover:scale-105 transition-transform">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold">Email</span>
                </a>
              )}

              {whatsappItem && (
                <a
                  href={`https://wa.me/${whatsappItem.value.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-green-50 text-green-700 hover:bg-green-100 border border-green-100 transition-colors shadow-2xs group"
                  title="Message on WhatsApp"
                >
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center mb-1 shadow-2xs group-hover:scale-105 transition-transform">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold">WhatsApp</span>
                </a>
              )}

              {websiteItem && (
                <a
                  href={
                    websiteItem.value.startsWith('http://') || websiteItem.value.startsWith('https://')
                      ? websiteItem.value
                      : `https://${websiteItem.value}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 transition-colors shadow-2xs group"
                  title="Visit Website"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mb-1 shadow-2xs group-hover:scale-105 transition-transform">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold">Website</span>
                </a>
              )}
            </div>
          )}

          {/* ALL CONTACT & SOCIAL MEDIA HUB */}
          <div className="mt-2 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <span>Contact & Social Channels</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">
                  {allChannels.length}
                </span>
              </h3>

              {categories.length > 2 && (
                <div className="flex items-center gap-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize transition-colors cursor-pointer ${
                        activeCategory === cat
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'all' ? 'All' : cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {allChannels.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">
                No contact or social platforms listed.
              </p>
            ) : (
              <div className="space-y-2">
                {filteredChannels.map((item) => {
                  const def = getPlatformDef(item.platform) || dynamicPlatform(item.platform);
                  const Icon = def.icon;
                  const targetUrl = def.buildUrl(item.value);

                  return (
                    <a
                      key={item.platform}
                      href={targetUrl}
                      target={item.platform === 'phone' || item.platform === 'email' ? undefined : '_blank'}
                      rel="noopener noreferrer"
                      id={`public-channel-${item.platform}`}
                      className="flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50/80 hover:border-slate-300 shadow-2xs transition-all hover:scale-[1.01] active:scale-98 group"
                    >
                      {/* Brand Icon */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs transition-transform group-hover:scale-105"
                        style={{ backgroundColor: def.brandColor || '#334155' }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {def.label}
                          </p>
                          {def.category && (
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold hidden sm:inline">
                              • {def.category}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono truncate">
                          {item.value.replace(/^@/, '')}
                        </p>
                      </div>

                      {/* Action Icon */}
                      <div className="text-slate-300 group-hover:text-slate-600 transition-colors shrink-0 pr-1">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Promotional Banner at Bottom */}
          <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-indigo-100/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-start">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-slate-800">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t('publicCard.promoTitle')}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {t('publicCard.promoDesc')}
              </p>
            </div>

            <button
              type="button"
              onClick={onNavigateToEditor}
              className="py-2 px-3.5 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #101c5e 0%, #3d2f86 50%, #7a4fc0 100%)',
              }}
            >
              <span>Create Free Card</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Modal for desktop users */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xs w-full p-6 text-center shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold font-display text-slate-800 mb-1">
              Scan Card
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Scan with your smartphone camera to save contact
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mb-4 shadow-inner">
              <QRCodeSVG
                value={safeQrValue}
                size={180}
                level="M"
                fgColor={accentColor}
                bgColor="#ffffff"
                includeMargin={true}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

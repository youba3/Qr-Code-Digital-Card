import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { Phone, Mail, Globe, User } from 'lucide-react';
import { getPlatformDef } from '../lib/platforms';
import { getPublicUrl } from '../lib/storage';
import type { CardData } from '../types';

interface CardPreviewProps {
  card: CardData;
  scale?: number;
}

export const CardPreview = forwardRef<HTMLDivElement, CardPreviewProps>(
  ({ card }, ref) => {
    const { t } = useTranslation();

    // Resolve primary direct contacts
    const phoneSocial = (card.socials || []).find((s) => s.platform === 'phone');
    const emailSocial = (card.socials || []).find((s) => s.platform === 'email');
    const websiteSocial = (card.socials || []).find((s) => s.platform === 'website');

    const phoneVal = phoneSocial ? phoneSocial.value : card.phone;
    const isPhoneOnCard = phoneSocial ? phoneSocial.onCard : Boolean(phoneVal);

    const emailVal = emailSocial ? emailSocial.value : card.email;
    const isEmailOnCard = emailSocial ? emailSocial.onCard : Boolean(emailVal);

    const websiteVal = websiteSocial ? websiteSocial.value : card.website;
    const isWebsiteOnCard = websiteSocial ? websiteSocial.onCard : Boolean(websiteVal);

    // Filter brand socials for bottom-right icon strip (excluding phone, email, website)
    const cardSocials = (card.socials || []).filter(
      (s) =>
        !['phone', 'email', 'website'].includes(s.platform) &&
        s.onCard &&
        s.value &&
        s.value.trim().length > 0
    );

    const maxIcons = 6;
    const visibleSocials = cardSocials.slice(0, maxIcons);
    const extraCount = cardSocials.length - maxIcons;

    const publicUrl = getPublicUrl(card.slug || 'preview', card);
    const accentColor = card.theme || '#101c5e';

    return (
      <div
        ref={ref}
        id="business-card-printable-node"
        className="w-full max-w-[320px] sm:max-w-[340px] aspect-[1/1.65] bg-white rounded-3xl shadow-xl border border-slate-100/90 relative overflow-hidden flex flex-col justify-between select-none text-slate-800 transition-all"
        style={{
          boxShadow:
            '0 20px 40px -12px rgba(16, 28, 94, 0.15), 0 2px 6px rgba(0,0,0,0.04)',
        }}
      >
        {/* Top Decorative Banner */}
        <div
          className="absolute top-0 inset-x-0 h-24 transition-colors duration-300 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}e6 65%, #7a4fc0 100%)`,
          }}
        >
          {/* Subtle decorative geometric overlay */}
          <div className="absolute -end-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-xs" />
          <div className="absolute -start-4 top-8 w-16 h-16 rounded-full bg-white/10 blur-xs" />
        </div>

        {/* Header & Identity Section (Avatar overlapping banner) */}
        <div className="relative pt-10 px-5 flex flex-col items-center text-center">
          {/* Avatar / Photo */}
          <div className="relative z-10">
            <div
              className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-100 flex items-center justify-center transition-colors"
              style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}
            >
              {card.photo ? (
                <img
                  src={card.photo}
                  alt={card.fullName || 'Card Photo'}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center font-display font-bold text-xl"
                  style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
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
          </div>

          {/* Name & Role */}
          <div className="mt-2.5 w-full min-w-0">
            <h2
              className={`text-lg sm:text-xl font-bold tracking-tight font-display truncate ${
                card.fullName ? 'text-slate-900' : 'text-slate-400 italic'
              }`}
            >
              {card.fullName || t('editor.fullNamePlaceholder', { defaultValue: 'Your Name' })}
            </h2>
            <p
              className={`text-xs font-medium truncate mt-0.5 ${
                card.title ? 'text-slate-600' : 'text-slate-400 italic'
              }`}
            >
              {card.title || t('editor.jobTitlePlaceholder', { defaultValue: 'Job Title' })}
            </p>
            {card.company && (
              <div className="mt-1 flex justify-center">
                <span
                  className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: `${accentColor}12`, color: accentColor }}
                >
                  {card.company}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Center: QR Code with Framing */}
        <div className="px-5 py-2 flex flex-col items-center justify-center">
          <div
            className="p-2 bg-white rounded-2xl shadow-xs border border-slate-100 flex items-center justify-center transition-all hover:scale-102"
            style={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
            }}
          >
            <QRCodeSVG
              value={publicUrl}
              size={92}
              level="M"
              includeMargin={false}
              fgColor={accentColor}
              bgColor="#ffffff"
            />
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 text-center">
            {t('editor.scanToSave')}
          </span>
        </div>

        {/* Bottom: Contact Details & Social Platforms */}
        <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex flex-col gap-2.5">
          {/* Direct Contact Items */}
          <div className="space-y-1.5 text-xs text-slate-600 w-full">
            {phoneVal && isPhoneOnCard ? (
              <div className="flex items-center gap-2 truncate justify-center sm:justify-start">
                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <Phone className="w-3 h-3 text-slate-500" />
                </div>
                <span className="truncate font-medium text-[11px] sm:text-xs">{phoneVal}</span>
              </div>
            ) : null}

            {emailVal && isEmailOnCard ? (
              <div className="flex items-center gap-2 truncate justify-center sm:justify-start">
                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <Mail className="w-3 h-3 text-slate-500" />
                </div>
                <span className="truncate font-medium text-[11px] sm:text-xs">{emailVal}</span>
              </div>
            ) : null}

            {websiteVal && isWebsiteOnCard ? (
              <div className="flex items-center gap-2 truncate justify-center sm:justify-start">
                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <Globe className="w-3 h-3 text-slate-500" />
                </div>
                <span className="truncate font-medium text-[11px] sm:text-xs">
                  {websiteVal.replace(/^https?:\/\//, '')}
                </span>
              </div>
            ) : null}

            {!phoneVal && !emailVal && !websiteVal && visibleSocials.length === 0 && (
              <p className="text-[11px] text-slate-400 italic text-center">
                {t('editor.addContactDetails')}
              </p>
            )}
          </div>

          {/* Social Platform Icons Row */}
          {visibleSocials.length > 0 && (
            <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1 border-t border-slate-50">
              {visibleSocials.map((item) => {
                const def = getPlatformDef(item.platform);
                if (!def) return null;
                const Icon = def.icon;
                return (
                  <div
                    key={item.platform}
                    title={`${def.label}: ${item.value}`}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-white shadow-2xs transition-transform hover:scale-110"
                    style={{ backgroundColor: def.brandColor || '#334155' }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                );
              })}

              {extraCount > 0 && (
                <div
                  className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shadow-2xs"
                  title={`${extraCount} ${t('common.more', { defaultValue: 'more' })}`}
                >
                  +{extraCount}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

CardPreview.displayName = 'CardPreview';

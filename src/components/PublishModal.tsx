import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ExternalLink, X, Share2 } from 'lucide-react';
import { getPublicUrl } from '../lib/storage';
import type { CardData } from '../types';

interface PublishModalProps {
  card: CardData;
  isOpen: boolean;
  onClose: () => void;
  onViewPublic: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  card,
  isOpen,
  onClose,
  onViewPublic,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const publicUrl = getPublicUrl(card.slug, card);
  const safeQrValue = publicUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/c/${(card.slug || 'preview').toLowerCase()}`;
  const accentColor = card.theme || '#101c5e';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${card.fullName || 'Contact Card'} - QR Code Digital Card`,
          text: `Check out ${card.fullName || 'my'}'s digital business card`,
          url: publicUrl,
        });
      } catch (err) {
        console.error('Share cancelled or failed', err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div
      id="publish-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="publish-modal-content"
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient banner */}
        <div
          className="p-6 text-white text-center relative"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, #7a4fc0 100%)`,
          }}
        >
          <button
            type="button"
            id="close-publish-modal-btn"
            onClick={onClose}
            className="absolute top-4 end-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Check className="w-6 h-6 text-white stroke-[3]" />
          </div>

          <h3 className="text-xl font-bold font-display tracking-tight">
            {t('editor.publishModal.title')}
          </h3>
          <p className="text-xs text-white/85 mt-1 max-w-xs mx-auto">
            {t('editor.publishModal.subtitle')}
          </p>
        </div>

        {/* Body with QR and link */}
        <div className="p-6 space-y-5">
          {/* QR Code container */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col items-center justify-center shadow-inner">
            <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-100">
              <QRCodeSVG
                value={safeQrValue}
                size={160}
                level="M"
                includeMargin={true}
                fgColor={accentColor}
                bgColor="#ffffff"
              />
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-3">
              {t('editor.publishModal.scanTest')}
            </p>
          </div>

          {/* Shareable Link Input with Copy Button */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              {t('editor.publishModal.shareableUrl')}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-mono truncate select-all">
                {publicUrl}
              </div>
              <button
                type="button"
                id="copy-public-link-btn"
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shrink-0 shadow-xs transition-all hover:brightness-110 active:scale-95 cursor-pointer"
                style={{ backgroundColor: accentColor }}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('editor.publishModal.copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t('editor.publishModal.copy')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              id="view-public-page-btn"
              onClick={() => {
                onClose();
                onViewPublic();
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{t('editor.publishModal.viewPublic')}</span>
            </button>

            <button
              type="button"
              id="share-native-btn"
              onClick={handleShare}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-xs transition-all hover:brightness-110 active:scale-95 cursor-pointer"
              style={{ backgroundColor: accentColor }}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t('editor.publishModal.shareCard')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

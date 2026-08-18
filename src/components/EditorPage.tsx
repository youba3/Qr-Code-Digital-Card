import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import {
  Download,
  FileText,
  Share2,
  UploadCloud,
  Trash2,
  CreditCard,
  Check,
  ExternalLink,
  LogOut,
  ChevronDown,
  Copy,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { SocialsManager } from './SocialsManager';
import { CardPreview } from './CardPreview';
import { PublishModal } from './PublishModal';
import { SaveStatus, type SaveState } from './SaveStatus';
import { LanguageSelector } from './LanguageSelector';
import { downloadVCard } from '../lib/vcard';
import { THEME_PALETTE } from '../types';
import type { CardData, SocialProfile } from '../types';
import { saveCard } from '../lib/cards';
import { compressImage } from '../lib/imageCompressor';
import { useAuth } from './AuthProvider';
import { getPublicUrl } from '../lib/storage';
import { fetchCardViewCount } from '../lib/db';

interface EditorPageProps {
  card: CardData;
  onUpdateCard: (updated: CardData) => void;
  onNavigateToPublic: (slug: string, cardData?: CardData) => void;
  onNavigateToHome?: () => void;
}

export const EditorPage: React.FC<EditorPageProps> = ({
  card,
  onUpdateCard,
  onNavigateToPublic,
  onNavigateToHome,
}) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(card.updatedAt || null);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [customColor, setCustomColor] = useState(card.theme || '#101c5e');
  const [viewCount, setViewCount] = useState<number>(card.scans ?? 0);
  const [isFetchingViews, setIsFetchingViews] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch the number of times the user's published business card has been visited
  const loadViewCount = useCallback(async () => {
    if (!card.slug) return;
    setIsFetchingViews(true);
    try {
      const count = await fetchCardViewCount(card.slug, user?.uid);
      setViewCount(count);
    } catch (err) {
      console.warn('Error fetching view count:', err);
    } finally {
      setIsFetchingViews(false);
    }
  }, [card.slug, user?.uid]);

  useEffect(() => {
    loadViewCount();
  }, [loadViewCount]);

  // Re-fetch view count when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      loadViewCount();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadViewCount]);

  // Debounced auto-save function
  const triggerAutoSave = useCallback(
    (newCard: CardData) => {
      setSaveState('saving');
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        try {
          await saveCard(newCard, user?.uid);
          setSaveState('saved');
          const now = new Date().toISOString();
          setLastSavedAt(now);
        } catch (err) {
          console.warn('Auto-save notice:', err);
          setSaveState('error');
        }
      }, 1000);
    },
    [user?.uid]
  );

  // Flush save on unmount or tab blur
  useEffect(() => {
    const handleBlur = () => {
      if (saveState === 'saving') {
        saveCard(card, user?.uid).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', handleBlur);
    return () => {
      window.removeEventListener('beforeunload', handleBlur);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [card, user?.uid, saveState]);

  const handleChange = <K extends keyof CardData>(field: K, value: CardData[K]) => {
    const updated = { ...card, [field]: value };
    onUpdateCard(updated);
    triggerAutoSave(updated);
  };

  const handleSocialsChange = (socials: SocialProfile[]) => {
    const phoneItem = socials.find((s) => s.platform === 'phone');
    const emailItem = socials.find((s) => s.platform === 'email');
    const websiteItem = socials.find((s) => s.platform === 'website');

    const updated: CardData = {
      ...card,
      socials,
      phone: phoneItem ? phoneItem.value : card.phone,
      email: emailItem ? emailItem.value : card.email,
      website: websiteItem ? websiteItem.value : card.website,
    };
    onUpdateCard(updated);
    triggerAutoSave(updated);
  };

  // Photo upload with compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast(t('editor.photoErrorSize'));
      return;
    }

    try {
      showToast(t('editor.photoOptimizing'));
      const compressed = await compressImage(file, 400, 400, 0.85);
      const thumb = await compressImage(file, 64, 64, 0.4);
      const updated: CardData = {
        ...card,
        photo: compressed,
        photoThumb: thumb,
      };
      onUpdateCard(updated);
      triggerAutoSave(updated);
      showToast(t('editor.photoSuccess'));
    } catch (err) {
      console.error('Failed to compress image', err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const updated: CardData = {
            ...card,
            photo: reader.result,
          };
          onUpdateCard(updated);
          triggerAutoSave(updated);
          showToast(t('editor.photoSuccess'));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    const updated: CardData = {
      ...card,
      photo: '',
      photoThumb: '',
    };
    onUpdateCard(updated);
    triggerAutoSave(updated);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download PNG with html-to-image pixelRatio 3
  const handleDownloadPng = async () => {
    if (!previewRef.current) return;
    setIsExportingPng(true);

    try {
      const dataUrl = await toPng(previewRef.current, {
        pixelRatio: 3,
        cacheBust: true,
        skipFonts: true,
      });

      const link = document.createElement('a');
      const filename = `${(card.fullName || 'business_card').toLowerCase().replace(/\s+/g, '_')}_card.png`;
      link.download = filename;
      link.href = dataUrl;
      link.click();
      showToast(t('editor.toastPngDownloaded'));
    } catch (err) {
      console.error('Failed to export PNG', err);
      showToast(t('editor.toastPngError'));
    } finally {
      setIsExportingPng(false);
    }
  };

  // Save .vcf
  const handleSaveVcf = () => {
    downloadVCard(card);
    showToast(t('editor.toastVcfDownloaded'));
  };

  // Publish & Share
  const handlePublish = async () => {
    setSaveState('saving');
    try {
      const published = await saveCard(card, user?.uid);
      onUpdateCard(published);
      setSaveState('saved');
      setLastSavedAt(new Date().toISOString());

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#101c5e', '#7a4fc0', '#4d3699', '#5f3fac', '#22c55e'],
        });
      } catch {}

      setIsPublishModalOpen(true);
    } catch {
      setSaveState('error');
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = getPublicUrl(card.slug || 'my-card', card);
      await navigator.clipboard.writeText(url);
      showToast(t('editor.toastLinkCopied'));
    } catch {
      showToast(t('editor.toastCopyError'));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    handleChange('slug', clean);
  };

  const accentColor = card.theme || '#101c5e';

  return (
    <div className="min-h-screen flex flex-col bg-[#eef0f7] font-sans selection:bg-indigo-600 selection:text-white">
      {/* HEADER: Gradient bar #101c5e -> #7a4fc0 */}
      <header
        id="cardforge-header"
        className="sticky top-0 z-40 text-white shadow-md transition-all"
        style={{
          background: 'linear-gradient(90deg, #101c5e 0%, #3d2f86 50%, #7a4fc0 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Name / Home Navigation */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onNavigateToHome}
              className="flex items-center gap-3 group text-white cursor-pointer select-none text-start"
              id="header-brand-home-link"
              title={t('common.brand')}
            >
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner group-hover:bg-white/25 transition-all">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-1.5">
                  {t('common.brand')}
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest text-indigo-200/80 px-1.5 py-0.5 rounded-full bg-white/10">
                  {t('common.cardStudio')}
                </span>
              </div>
            </button>

            {/* Auto-save status badge & View Count */}
            <div className="hidden md:flex items-center gap-2.5">
              <SaveStatus status={saveState} lastSavedAt={lastSavedAt} />
              <button
                type="button"
                id="header-view-count-btn"
                onClick={loadViewCount}
                disabled={isFetchingViews}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-medium backdrop-blur-md transition-all active:scale-95 cursor-pointer select-none"
                title={t('editor.refreshViewCount')}
              >
                <Eye className="w-3.5 h-3.5 text-indigo-200" />
                <span className="font-bold">{viewCount.toLocaleString()}</span>
                <span className="text-[11px] text-indigo-200/90">{t('editor.views')}</span>
                <RefreshCw className={`w-2.5 h-2.5 ms-0.5 text-indigo-300 ${isFetchingViews ? 'animate-spin' : 'opacity-70 hover:opacity-100'}`} />
              </button>
            </div>
          </div>

          {/* Header Action Buttons & User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <LanguageSelector />

            {/* View Public Button */}
            {card.slug && (
              <button
                type="button"
                onClick={() => onNavigateToPublic(card.slug, card)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/15 hover:bg-white/25 border border-white/20 text-white shadow-2xs backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                title={t('common.viewCard')}
              >
                <span>{t('common.viewCard')}</span>
                <ExternalLink className="w-3 h-3 text-indigo-200" />
              </button>
            )}

            {/* Download PNG */}
            <button
              type="button"
              id="download-png-btn"
              onClick={handleDownloadPng}
              disabled={isExportingPng}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/15 hover:bg-white/25 border border-white/20 text-white shadow-2xs backdrop-blur-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title={t('common.downloadPng')}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isExportingPng ? t('common.exporting') : t('common.downloadPng')}</span>
              <span className="sm:hidden">PNG</span>
            </button>

            {/* Save .vcf */}
            <button
              type="button"
              id="save-vcf-btn"
              onClick={handleSaveVcf}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/15 hover:bg-white/25 border border-white/20 text-white shadow-2xs backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              title={t('common.downloadVcf')}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>.vcf</span>
            </button>

            {/* Publish Button */}
            <button
              type="button"
              id="publish-card-btn"
              onClick={handlePublish}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl text-xs font-bold bg-white text-[#101c5e] shadow-md hover:bg-indigo-50 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              title={t('common.publishLive')}
            >
              <Share2 className="w-3.5 h-3.5 text-[#7a4fc0]" />
              <span>{t('common.publish')}</span>
            </button>

            {/* User Account Menu */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 ps-2 pe-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-medium backdrop-blur-md transition-all cursor-pointer"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User avatar" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center font-bold text-[10px]">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="hidden md:inline max-w-[100px] truncate">{user.displayName || user.email?.split('@')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-indigo-200" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute end-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 text-slate-800 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.displayName || 'User'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        if (onNavigateToHome) onNavigateToHome();
                      }}
                      className="w-full mt-1 flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('common.signOut')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 end-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MAIN CONTENT: Two columns on desktop */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: FORM */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xs border border-slate-200/80">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h1 className="text-xl font-bold font-display text-slate-800">
                    {t('editor.headerTitle')}
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('editor.headerSubtitle')}
                  </p>
                </div>
                <div className="md:hidden flex items-center gap-2">
                  <SaveStatus status={saveState} lastSavedAt={lastSavedAt} />
                  <button
                    type="button"
                    onClick={loadViewCount}
                    disabled={isFetchingViews}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200/80 text-[11px] font-semibold text-slate-700"
                    title={t('editor.refreshViewCount')}
                  >
                    <Eye className="w-3 h-3 text-indigo-600" />
                    <span>{viewCount.toLocaleString()}</span>
                  </button>
                </div>
              </div>

              {/* 1. PHOTO UPLOAD */}
              <div className="mb-7">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                  {t('editor.photoSection')}
                </label>
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Circle preview */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 overflow-hidden flex items-center justify-center cursor-pointer group shrink-0 transition-all shadow-inner"
                    style={{ borderColor: card.photo ? accentColor : undefined }}
                  >
                    {card.photo ? (
                      <img
                        src={card.photo}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center group-hover:text-slate-600">
                        <UploadCloud className="w-6 h-6 mb-0.5" />
                        <span className="text-[9px] font-semibold">{t('common.upload')}</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] font-medium">
                      {t('common.change')}
                    </div>
                  </div>

                  {/* Upload Actions */}
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="photo-file-picker"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        id="choose-photo-btn"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-full text-xs font-semibold text-white shadow-2xs transition-all hover:brightness-110 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        style={{ backgroundColor: accentColor }}
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{t('common.choosePhoto')}</span>
                      </button>

                      {card.photo && (
                        <button
                          type="button"
                          id="remove-photo-btn"
                          onClick={removePhoto}
                          className="px-3 py-2 rounded-full text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{t('common.remove')}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {t('editor.photoUploadHint')}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. ROUNDED PROFILE INPUTS */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      {t('editor.fullName')}
                    </label>
                    <input
                      type="text"
                      id="input-fullname"
                      value={card.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder={t('editor.fullNamePlaceholder')}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-full px-4 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-colors shadow-2xs"
                    />
                  </div>

                  {/* Job Title */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      {t('editor.jobTitle')}
                    </label>
                    <input
                      type="text"
                      id="input-title"
                      value={card.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder={t('editor.jobTitlePlaceholder')}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-full px-4 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-colors shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  {/* Company */}
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    {t('editor.company')}
                  </label>
                  <input
                    type="text"
                    id="input-company"
                    value={card.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    placeholder={t('editor.companyPlaceholder')}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-full px-4 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-colors shadow-2xs"
                  />
                </div>
              </div>

              {/* 3. CARD SLUG & STABLE URL */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    {t('editor.slugSection')}
                  </label>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {t('editor.permanentUrl')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1.5 focus-within:bg-white focus-within:border-indigo-500 transition-colors shadow-2xs">
                    <span className="text-xs font-mono text-slate-400 select-none shrink-0 pe-1">
                      {typeof window !== 'undefined' ? window.location.host : 'cardforge.app'}/c/
                    </span>
                    <input
                      type="text"
                      id="input-slug"
                      value={card.slug}
                      onChange={handleSlugChange}
                      placeholder={t('editor.slugPlaceholder')}
                      className="w-full bg-transparent border-0 text-slate-800 text-xs font-mono focus:outline-hidden p-0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0 cursor-pointer"
                    title={t('common.copy')}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  {t('editor.slugNotice')}
                </p>
              </div>

              {/* 4. THEME PICKER */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {t('editor.themeSection')}
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  {t('editor.themeSubtitle')}
                </p>

                <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                  {THEME_PALETTE.map((swatch) => {
                    const isSelected = card.theme === swatch.color;
                    return (
                      <button
                        key={swatch.id}
                        type="button"
                        id={`theme-swatch-${swatch.id}`}
                        onClick={() => {
                          handleChange('theme', swatch.color);
                          setCustomColor(swatch.color);
                        }}
                        className={`group relative w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-transform hover:scale-110 flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'ring-3 ring-offset-2 ring-indigo-500 scale-105 shadow-md'
                            : 'shadow-2xs opacity-90 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: swatch.color }}
                        title={`${swatch.name} (${swatch.color})`}
                      >
                        {isSelected && (
                          <Check className="w-4 h-4 text-white stroke-[3]" />
                        )}
                      </button>
                    );
                  })}

                  {/* Custom Color Input */}
                  <label
                    className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-300 flex items-center justify-center cursor-pointer shadow-2xs overflow-hidden hover:scale-110 transition-transform"
                    title={t('editor.customHex')}
                  >
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        handleChange('theme', e.target.value);
                      }}
                      className="absolute -inset-2 opacity-0 cursor-pointer w-14 h-14"
                    />
                    <div
                      className="w-full h-full rounded-full"
                      style={{ backgroundColor: customColor }}
                    />
                  </label>
                </div>
              </div>

              {/* 5. 40+ PLATFORMS SOCIAL MANAGER */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <SocialsManager
                  socials={card.socials || []}
                  onChange={handleSocialsChange}
                  accentColor={accentColor}
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: LIVE PREVIEW (Sticky on desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xs border border-slate-200/80">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 font-display">
                    {t('editor.livePreview')}
                  </h2>
                </div>
                {card.slug && (
                  <button
                    type="button"
                    onClick={() => onNavigateToPublic(card.slug, card)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{t('editor.openPublic')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* View Count Display Card */}
              <div
                id="editor-view-count-card"
                className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/50 border border-indigo-100/80 shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xs shrink-0"
                    style={{ background: 'linear-gradient(135deg, #101c5e 0%, #3d2f86 100%)' }}
                  >
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                        {t('editor.totalViews')}
                      </span>
                      {isFetchingViews && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                      )}
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold font-display text-slate-900 leading-none">
                        {viewCount.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {t('editor.views')}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  id="refresh-view-count-btn"
                  onClick={loadViewCount}
                  disabled={isFetchingViews}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs transition-all active:scale-95 disabled:opacity-60 cursor-pointer shrink-0"
                  title={t('editor.refreshViewCount')}
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isFetchingViews ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{t('editor.refreshViewCount')}</span>
                </button>
              </div>

              {/* The Actual Rendered Card with ref for high-res export */}
              <div className="flex justify-center p-2 bg-slate-100/70 rounded-2xl border border-slate-200/60 shadow-inner">
                <CardPreview ref={previewRef} card={card} />
              </div>

              <p className="text-[11px] text-center text-slate-400 mt-3">
                {t('editor.previewCaption')}
              </p>

              {/* Quick Action buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={isExportingPng}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingPng ? t('common.exporting') : t('common.exportPng')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveVcf}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t('common.downloadVcf')}</span>
                </button>
              </div>

              {/* Publish CTA */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handlePublish}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #101c5e 0%, #3d2f86 50%, #7a4fc0 100%)',
                  }}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{t('common.publishLive')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* PUBLISH MODAL */}
      <PublishModal
        card={card}
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onViewPublic={() => onNavigateToPublic(card.slug, card)}
      />
    </div>
  );
};

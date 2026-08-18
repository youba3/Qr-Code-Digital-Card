import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  X,
  Search,
  Check,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  PLATFORMS,
  TOP_QUICK_PLATFORMS,
  getPlatformDef,
  detectPlatformFromUrl,
  dynamicPlatform,
} from '../lib/platforms';
import type { SocialProfile } from '../types';

interface SocialsManagerProps {
  socials: SocialProfile[];
  onChange: (socials: SocialProfile[]) => void;
  accentColor: string;
}

export const SocialsManager: React.FC<SocialsManagerProps> = ({
  socials,
  onChange,
  accentColor,
}) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'direct' | 'social' | 'creative' | 'dev'>('all');

  const selectedPlatformIds = useMemo(
    () => new Set(socials.map((s) => s.platform.toLowerCase())),
    [socials]
  );

  const filteredPlatforms = useMemo(() => {
    let list = PLATFORMS;
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;

    const matched = list.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.placeholder.toLowerCase().includes(q)
    );

    // If query didn't match directly, provide a dynamic platform creator
    if (matched.length === 0 && q.length > 1) {
      return [dynamicPlatform(q)];
    }

    return matched;
  }, [searchQuery, selectedCategory]);

  const addPlatform = (platformId: string) => {
    const cleanId = platformId.toLowerCase();
    if (selectedPlatformIds.has(cleanId)) {
      const inputEl = document.getElementById(`input-social-${cleanId}`);
      if (inputEl) {
        inputEl.focus();
      }
      return;
    }

    const currentOnCardCount = socials.filter((s) => s.onCard).length;
    onChange([
      ...socials,
      {
        platform: cleanId,
        value: '',
        onCard: currentOnCardCount < 6,
      },
    ]);
  };

  const togglePlatformSelection = (platformId: string) => {
    const cleanId = platformId.toLowerCase();
    if (selectedPlatformIds.has(cleanId)) {
      onChange(socials.filter((s) => s.platform.toLowerCase() !== cleanId));
    } else {
      addPlatform(cleanId);
    }
  };

  const updateSocialValue = (index: number, value: string) => {
    const next = [...socials];
    const current = next[index];

    // Check if user pasted a URL that belongs to a different platform
    const detected = detectPlatformFromUrl(value);
    if (detected && detected !== current.platform.toLowerCase() && !selectedPlatformIds.has(detected)) {
      // Auto-switch platform to detected one
      next[index] = {
        ...current,
        platform: detected,
        value,
      };
    } else {
      next[index] = { ...current, value };
    }

    onChange(next);
  };

  const toggleOnCard = (index: number) => {
    const next = [...socials];
    next[index] = { ...next[index], onCard: !next[index].onCard };
    onChange(next);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...socials];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    onChange(next);
  };

  const moveDown = (index: number) => {
    if (index === socials.length - 1) return;
    const next = [...socials];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    onChange(next);
  };

  const removeSocial = (index: number) => {
    const next = socials.filter((_, i) => i !== index);
    onChange(next);
  };

  const onCardCount = socials.filter((s) => s.onCard && s.value.trim().length > 0).length;

  return (
    <div id="socials-manager-section" className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 font-display">
              {t('socials.title')} ({socials.length})
            </h2>
            {onCardCount > 0 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {onCardCount} {t('socials.onCardBadge')}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('socials.subtitle')}
          </p>
        </div>

        <button
          type="button"
          id="open-platforms-modal-btn"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all hover:brightness-110 active:scale-95 shrink-0 cursor-pointer"
          style={{ backgroundColor: accentColor }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('socials.browseButton')}</span>
        </button>
      </div>

      {/* QUICK ADD PILLS BAR */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            {t('socials.quickAdd')}
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
          {TOP_QUICK_PLATFORMS.map((platformId) => {
            const def = getPlatformDef(platformId);
            if (!def) return null;
            const isAdded = selectedPlatformIds.has(platformId.toLowerCase());
            const Icon = def.icon;

            return (
              <button
                key={platformId}
                type="button"
                id={`quick-add-${platformId}`}
                onClick={() => (isAdded ? togglePlatformSelection(platformId) : addPlatform(platformId))}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                  isAdded
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                }`}
                title={isAdded ? `${t('common.remove')} ${def.label}` : `${t('common.add', { defaultValue: 'Add' })} ${def.label}`}
              >
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px]"
                  style={{ backgroundColor: def.brandColor || '#475569' }}
                >
                  <Icon className="w-2.5 h-2.5" />
                </div>
                <span>{def.label}</span>
                {isAdded ? (
                  <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                ) : (
                  <Plus className="w-3 h-3 text-slate-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected channels list */}
      {socials.length === 0 ? (
        <div
          id="no-socials-placeholder"
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl p-6 text-center transition-colors bg-white/50"
        >
          <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
            <Plus className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-slate-700">{t('socials.emptyTitle')}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('socials.emptyDesc')}
          </p>
        </div>
      ) : (
        <div id="socials-items-list" className="space-y-2.5">
          {socials.map((item, index) => {
            const def = getPlatformDef(item.platform) || dynamicPlatform(item.platform);
            const Icon = def.icon;
            const previewUrl = def.buildUrl(item.value);

            return (
              <div
                key={`${item.platform}-${index}`}
                id={`social-row-${item.platform}`}
                className={`group flex items-center gap-2.5 p-3 rounded-2xl border transition-all ${
                  item.value.trim()
                    ? 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                    : 'bg-amber-50/40 border-amber-200/80'
                }`}
              >
                {/* Platform Icon Badge */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                  style={{ backgroundColor: def.brandColor || '#334155' }}
                  title={def.label}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Input & Label Area */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                      <span>{def.label}</span>
                      {item.platform === 'phone' && (
                        <span className="text-[10px] text-slate-400 font-normal">({t('socials.directCall')})</span>
                      )}
                      {item.platform === 'email' && (
                        <span className="text-[10px] text-slate-400 font-normal">({t('socials.directMail')})</span>
                      )}
                    </span>

                    {previewUrl && item.value.trim() && (
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 transition-colors"
                        title={`${t('common.test')}: ${previewUrl}`}
                      >
                        <span>{t('common.test')}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>

                  <input
                    type="text"
                    id={`input-social-${item.platform}`}
                    value={item.value}
                    onChange={(e) => updateSocialValue(index, e.target.value)}
                    placeholder={def.placeholder}
                    className="w-full text-xs text-slate-800 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-colors font-mono"
                  />
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-1 shrink-0 pt-3 sm:pt-0">
                  {/* Eye toggle on printed card */}
                  <button
                    type="button"
                    onClick={() => toggleOnCard(index)}
                    title={
                      item.onCard
                        ? `${t('common.onCard')}`
                        : `${t('common.offCard')}`
                    }
                    className={`p-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                      item.onCard
                        ? 'bg-slate-100 text-slate-800 hover:bg-slate-200 font-semibold'
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                    }`}
                  >
                    {item.onCard ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-slate-700" />
                        <span className="hidden sm:inline text-[10px]">{t('common.onCard')}</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                        <span className="hidden sm:inline text-[10px]">{t('common.offCard')}</span>
                      </>
                    )}
                  </button>

                  {/* Reorder Buttons */}
                  <div className="flex flex-col">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveUp(index)}
                      title="Move up"
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:hover:text-slate-400 transition-colors cursor-pointer"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === socials.length - 1}
                      onClick={() => moveDown(index)}
                      title="Move down"
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:hover:text-slate-400 transition-colors cursor-pointer"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeSocial(index)}
                    title={`${t('common.remove')} ${def.label}`}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors ms-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PLATFORMS CATALOG MODAL */}
      {isModalOpen && (
        <div
          id="platforms-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            id="platforms-modal-content"
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  {t('socials.modalTitle')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('socials.modalSubtitle')}
                </p>
              </div>
              <button
                type="button"
                id="close-platforms-modal-btn"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Bar & Category Filter */}
            <div className="px-5 pt-3 pb-2 space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('socials.searchPlaceholder')}
                  className="w-full bg-slate-50 ps-9 pe-14 py-2 rounded-xl text-xs text-slate-800 border border-slate-200 focus:bg-white focus:border-indigo-400 focus:outline-hidden transition-all"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  >
                    {t('common.clear')}
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'all', label: t('socials.catAll') },
                  { id: 'direct', label: t('socials.catDirect') },
                  { id: 'social', label: t('socials.catSocial') },
                  { id: 'creative', label: t('socials.catCreative') },
                  { id: 'dev', label: t('socials.catDev') },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Platforms Grid */}
            <div className="p-5 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {filteredPlatforms.map((platform) => {
                const isSelected = selectedPlatformIds.has(platform.id.toLowerCase());
                const Icon = platform.icon;

                return (
                  <button
                    key={platform.id}
                    type="button"
                    id={`platform-select-btn-${platform.id}`}
                    onClick={() => togglePlatformSelection(platform.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-start transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: platform.brandColor || '#475569' }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {platform.label}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {isSelected ? t('socials.added') : t('socials.tapToAdd')}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 bg-white text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {selectedPlatformIds.size} {t('socials.activeChannels')}
              </span>
              <button
                type="button"
                id="done-platforms-modal-btn"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all hover:brightness-110 active:scale-95 cursor-pointer"
                style={{ backgroundColor: accentColor }}
              >
                {t('common.done')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

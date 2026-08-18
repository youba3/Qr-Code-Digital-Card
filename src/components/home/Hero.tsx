import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles, CheckCircle2, ChevronDown } from 'lucide-react';
import { CardPreview } from '../CardPreview';
import type { CardData } from '../../types';
import { DEFAULT_CARD } from '../../lib/storage';

interface HeroProps {
  onNavigateToEditor: () => void;
  onScrollToHowItWorks: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onNavigateToEditor,
  onScrollToHowItWorks,
}) => {
  const { t } = useTranslation();
  const sampleHeroCard: CardData = {
    ...DEFAULT_CARD,
    fullName: 'Sarah Jenkins',
    title: 'Lead Product Designer',
    company: 'Aura Studio',
    phone: '+1 (555) 234-5678',
    email: 'sarah@aurastudio.design',
    website: 'aurastudio.design',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    theme: '#101c5e',
    slug: 'sarah-jenkins',
  };

  return (
    <section className="relative pt-28 sm:pt-36 pb-16 lg:pb-24 overflow-hidden" id="hero">
      {/* Subtle ambient gradient mesh background */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-indigo-200/40 via-purple-200/30 to-blue-100/40 blur-3xl -z-10 pointer-events-none rounded-full" />
      <div className="absolute top-1/3 -right-32 w-80 h-80 bg-indigo-300/20 blur-2xl -z-10 pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Typography & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-start">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-indigo-100/80 shadow-2xs text-slate-800 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span className="font-display tracking-tight text-indigo-950 font-bold">
                {t('hero.eyebrow')}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            </div>

            {/* H1 Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-slate-900 leading-[1.12]">
              {t('hero.h1Prefix')}{' '}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #101c5e 0%, #3d2f86 45%, #7a4fc0 100%)',
                }}
              >
                {t('hero.h1Highlight')}
              </span>
            </h1>

            {/* Subhead */}
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              {t('hero.subhead')}
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
              <button
                type="button"
                id="hero-create-btn"
                onClick={onNavigateToEditor}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full text-sm font-bold text-white shadow-xl shadow-indigo-950/15 hover:shadow-indigo-950/25 hover:scale-102 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #101c5e 0%, #3d2f86 50%, #7a4fc0 100%)',
                }}
              >
                <span>{t('hero.ctaPrimary')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>

              <button
                type="button"
                id="hero-how-it-works-btn"
                onClick={onScrollToHowItWorks}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{t('hero.ctaSecondary')}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Trust Points */}
            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-5 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('hero.trust1')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('hero.trust2')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('hero.trust3')}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Vertical Card Mock with Chips */}
          <div className="lg:col-span-5 flex justify-center relative">
            {/* Background decorative glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-purple-500/10 blur-2xl rounded-3xl -z-10" />

            <div className="relative group perspective-1000">
              {/* Floating accent chip 1: LinkedIn */}
              <div className="absolute -top-4 -start-6 sm:-start-10 z-20 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200/70 flex items-center gap-2 animate-bounce duration-1000">
                <div className="w-5 h-5 rounded-md bg-[#0A66C2] flex items-center justify-center text-white font-bold text-[10px]">
                  in
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">{t('hero.chipVerified')}</span>
                  <span className="text-[9px] text-slate-400">{t('hero.chipVerifiedSub')}</span>
                </div>
              </div>

              {/* Floating accent chip 2: Instant vCard */}
              <div className="absolute top-1/2 -end-6 sm:-end-10 z-20 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200/70 flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center text-white font-bold text-[10px]">
                  ✓
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">{t('hero.chipVcard')}</span>
                  <span className="text-[9px] text-slate-400">{t('hero.chipVcardSub')}</span>
                </div>
              </div>

              {/* Floating accent chip 3: 40+ Platforms */}
              <div className="absolute -bottom-5 -start-4 sm:-start-8 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-indigo-100 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-[10px]">
                  40+
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">{t('hero.chipSocials')}</span>
                  <span className="text-[9px] text-indigo-600 font-semibold">{t('hero.chipSocialsSub')}</span>
                </div>
              </div>

              {/* Vertical Card Preview Component */}
              <div className="transform transition-transform duration-500 hover:rotate-0 rotate-1 hover:scale-102">
                <CardPreview card={sampleHeroCard} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

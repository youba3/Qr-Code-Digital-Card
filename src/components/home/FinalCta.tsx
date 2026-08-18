import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface FinalCtaProps {
  onNavigateToEditor: () => void;
}

export const FinalCta: React.FC<FinalCtaProps> = ({ onNavigateToEditor }) => {
  const { t } = useTranslation();

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-3xl sm:rounded-[36px] p-10 sm:p-16 text-center text-white relative overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #101c5e 0%, #3d2f86 45%, #7a4fc0 100%)',
          }}
        >
          {/* Subtle geometric circles in background */}
          <div className="absolute -top-24 -end-24 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -start-24 w-80 h-80 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-indigo-100 text-xs font-bold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span>{t('cta.eyebrow')}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
              {t('cta.title')}
            </h2>

            <p className="mt-4 text-sm sm:text-base text-indigo-100/90 leading-relaxed max-w-lg">
              {t('cta.subtitle')}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5">
              <button
                type="button"
                id="final-cta-create-btn"
                onClick={onNavigateToEditor}
                className="px-8 py-4 rounded-full text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-xl hover:shadow-2xl hover:scale-102 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>{t('hero.ctaPrimary')}</span>
                <ArrowRight className="w-4 h-4 text-indigo-900 rtl:rotate-180" />
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-indigo-200/80">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>{t('cta.freeForever')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>{t('cta.noCreditCard')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>{t('cta.instantSetup')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

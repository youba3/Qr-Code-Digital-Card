import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

interface PricingProps {
  onNavigateToEditor: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onNavigateToEditor }) => {
  const { t } = useTranslation();
  const [annual, setAnnual] = useState(true);

  return (
    <section className="py-20 sm:py-28 bg-white border-y border-slate-200/70" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            {t('pricing.eyebrow')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-slate-900 mt-3">
            {t('pricing.title')}
          </h2>
          <p className="mt-4 text-base text-slate-600">
            {t('pricing.subtitle')}
          </p>

          {/* Billing Switch */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-full bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                !annual ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t('pricing.monthly')}
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                annual ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{t('pricing.yearly')}</span>
              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                {t('pricing.save25')}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-[#f8f9fd] rounded-3xl p-8 sm:p-10 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold font-display text-slate-900">
                  {t('pricing.starterTitle')}
                </span>
                <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                  Individual
                </span>
              </div>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl sm:text-5xl font-extrabold font-display text-slate-900">
                  $0
                </span>
                <span className="text-xs text-slate-500 font-semibold">/ {t('pricing.starterPeriod')}</span>
              </div>

              <p className="text-xs text-slate-600 mb-8 leading-relaxed">
                {t('pricing.starterDesc')}
              </p>

              <div className="space-y-3 pt-6 border-t border-slate-200/80 mb-8 text-xs text-slate-700 font-medium">
                {[
                  '1 Active Vertical Digital Business Card',
                  'Dynamic QR code (always updatable)',
                  '40+ Social & Contact platform icons',
                  'Instant 1-tap .vcf Save to Contacts',
                  'High-res PNG card image export',
                  'Unlimited scans & page views',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={onNavigateToEditor}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-900 hover:text-white border border-slate-300 shadow-2xs transition-all active:scale-98 cursor-pointer text-center"
            >
              {t('pricing.starterCta')}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-indigo-600 shadow-xl flex flex-col justify-between relative overflow-hidden">
            {/* Ribbon Badge */}
            <div className="absolute top-5 end-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{t('pricing.proBadge')}</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold font-display text-slate-900">
                  {t('pricing.proTitle')}
                </span>
              </div>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl sm:text-5xl font-extrabold font-display text-slate-900">
                  {annual ? '$6' : '$8'}
                </span>
                <span className="text-xs text-slate-500 font-semibold">/ {t('pricing.proPeriod')}</span>
              </div>

              <p className="text-xs text-slate-600 mb-8 leading-relaxed">
                {t('pricing.proDesc')}
              </p>

              <div className="space-y-3 pt-6 border-t border-slate-100 mb-8 text-xs text-slate-700 font-medium">
                {[
                  'Everything in Free, plus:',
                  'Custom personal slug (e.g. your-name)',
                  'Real-time Scan Analytics & Location metrics',
                  'Manage up to 5 distinct cards (work, side project, personal)',
                  'Remove branding watermark',
                  'Priority phone & email customer support',
                ].map((f, i) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className={i === 0 ? 'font-bold text-slate-900' : ''}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={onNavigateToEditor}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #101c5e 0%, #3d2f86 50%, #7a4fc0 100%)',
              }}
            >
              <span>{t('pricing.proCta')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

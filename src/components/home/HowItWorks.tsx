import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Palette, QrCode, ArrowRight, Check } from 'lucide-react';

interface HowItWorksProps {
  onNavigateToEditor: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onNavigateToEditor }) => {
  const { t } = useTranslation();

  const steps = [
    {
      number: t('howItWorks.step1Num'),
      icon: User,
      title: t('howItWorks.step1Title'),
      description: t('howItWorks.step1Desc'),
      preview: (
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
              SJ
            </div>
            <div className="space-y-1">
              <div className="h-3 w-28 bg-slate-300 rounded-sm" />
              <div className="h-2 w-20 bg-slate-200 rounded-sm" />
            </div>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-sm" />
        </div>
      ),
    },
    {
      number: t('howItWorks.step2Num'),
      icon: Palette,
      title: t('howItWorks.step2Title'),
      description: t('howItWorks.step2Desc'),
      preview: (
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
          <div className="flex items-center gap-1.5 justify-center">
            {['#101c5e', '#3d2f86', '#5f3fac', '#7a4fc0'].map((c) => (
              <div
                key={c}
                className="w-6 h-6 rounded-full border-2 border-white shadow-xs"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <div className="w-6 h-6 rounded-md bg-[#0A66C2] flex items-center justify-center text-white text-[9px] font-bold">
              in
            </div>
            <div className="w-6 h-6 rounded-md bg-[#E4405F] flex items-center justify-center text-white text-[9px] font-bold">
              ig
            </div>
            <div className="w-6 h-6 rounded-md bg-[#25D366] flex items-center justify-center text-white text-[9px] font-bold">
              wa
            </div>
            <div className="w-6 h-6 rounded-md bg-slate-700 flex items-center justify-center text-white text-[9px] font-bold">
              +40
            </div>
          </div>
        </div>
      ),
    },
    {
      number: t('howItWorks.step3Num'),
      icon: QrCode,
      title: t('howItWorks.step3Title'),
      description: t('howItWorks.step3Desc'),
      preview: (
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-center justify-center flex-col gap-1.5">
          <div className="w-14 h-14 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center">
            <QrCode className="w-11 h-11 text-indigo-950" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
            <Check className="w-2.5 h-2.5" /> Instant Scan Ready
          </span>
        </div>
      ),
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white border-y border-slate-200/70" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            {t('howItWorks.eyebrow')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-slate-900 mt-3">
            {t('howItWorks.title')}
          </h2>
          <p className="mt-4 text-base text-slate-600">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        {/* Steps Grid with Connectors */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/3 start-1/6 end-1/6 h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-200 -z-0" />

          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.number}
                className="relative bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between z-10"
              >
                <div>
                  {/* Step badge & icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-900 font-bold">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black font-display text-slate-200">
                      {s.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-display text-slate-900 mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                    {s.description}
                  </p>
                </div>

                <div>
                  {s.preview}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Call to action */}
        <div className="mt-14 text-center">
          <button
            type="button"
            onClick={onNavigateToEditor}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #101c5e 0%, #3d2f86 50%, #7a4fc0 100%)',
            }}
          >
            <span>{t('hero.ctaPrimary')}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </section>
  );
};

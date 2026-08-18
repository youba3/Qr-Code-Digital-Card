import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  QrCode,
  Share2,
  UserCheck,
  Smartphone,
  Download,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const Features: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: QrCode,
      title: t('features.item1Title'),
      description: t('features.item1Desc'),
      accent: 'from-indigo-600 to-indigo-800',
      badge: 'QR Code',
    },
    {
      icon: UserCheck,
      title: t('features.item2Title'),
      description: t('features.item2Desc'),
      accent: 'from-violet-600 to-purple-800',
      badge: 'vCard 3.0',
    },
    {
      icon: Share2,
      title: t('features.item3Title'),
      description: t('features.item3Desc'),
      accent: 'from-purple-600 to-indigo-700',
      badge: '40+ Channels',
    },
    {
      icon: Download,
      title: t('features.item4Title'),
      description: t('features.item4Desc'),
      accent: 'from-indigo-700 to-purple-900',
      badge: 'PNG (3x)',
    },
    {
      icon: ShieldCheck,
      title: t('features.item5Title'),
      description: t('features.item5Desc'),
      accent: 'from-purple-700 to-indigo-900',
      badge: 'Sync',
    },
    {
      icon: Smartphone,
      title: t('features.item6Title'),
      description: t('features.item6Desc'),
      accent: 'from-blue-600 to-indigo-800',
      badge: 'Mobile First',
    },
  ];

  return (
    <section className="py-20 sm:py-28" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t('features.eyebrow')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-slate-900">
            {t('features.title')}
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            {t('features.subtitle')}
          </p>
        </div>

        {/* 3-Column Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.accent} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-display tracking-tight text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

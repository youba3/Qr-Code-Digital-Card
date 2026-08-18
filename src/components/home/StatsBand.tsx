import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Globe2, Zap, ShieldCheck } from 'lucide-react';

export const StatsBand: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    {
      icon: Users,
      value: '12,000+',
      label: t('stats.cardsCreated'),
      description: t('stats.cardsCreatedSub'),
    },
    {
      icon: Globe2,
      value: '40+',
      label: t('stats.platforms'),
      description: t('stats.platformsSub'),
    },
    {
      icon: Zap,
      value: '< 1s',
      label: t('stats.saveSpeed'),
      description: t('stats.saveSpeedSub'),
    },
    {
      icon: ShieldCheck,
      value: '99.9%',
      label: t('stats.scanReliability'),
      description: t('stats.scanReliabilitySub'),
    },
  ];

  return (
    <section
      className="py-16 sm:py-20 text-white relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #101c5e 0%, #3d2f86 50%, #7a4fc0 100%)',
      }}
    >
      {/* Decorative ambient elements */}
      <div className="absolute top-0 end-1/4 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 start-1/4 w-80 h-80 bg-black/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center mb-3 shadow-inner">
                  <Icon className="w-5 h-5 text-indigo-200" />
                </div>
                <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-white mb-1">
                  {item.value}
                </span>
                <span className="text-sm font-bold text-indigo-100">
                  {item.label}
                </span>
                <span className="text-xs text-indigo-200/70 mt-1 max-w-[180px]">
                  {item.description}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

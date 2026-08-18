import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles } from 'lucide-react';

interface TemplatesGalleryProps {
  onSelectTemplate: (themeColor: string, templateName: string) => void;
}

export const TemplatesGallery: React.FC<TemplatesGalleryProps> = ({ onSelectTemplate }) => {
  const { t } = useTranslation();

  const templates = [
    {
      id: 'navy-classic',
      name: 'Executive Navy',
      category: 'Corporate & Finance',
      theme: '#101c5e',
      description: 'Sophisticated deep navy with high contrast typography and clean hierarchy.',
      previewName: 'Marcus Vance',
      previewRole: 'Managing Partner',
      previewCompany: 'Vance Capital',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'indigo-studio',
      name: 'Royal Indigo',
      category: 'Design & Architecture',
      theme: '#2c2a72',
      description: 'Modern deep indigo with balanced accents for creative studios and founders.',
      previewName: 'Elena Rostova',
      previewRole: 'Design Director',
      previewCompany: 'Forma Studio',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'plum-creative',
      name: 'Velvet Plum',
      category: 'Media & Marketing',
      theme: '#3d2f86',
      description: 'Rich velvet tones designed for brand consultants, marketers, and content leaders.',
      previewName: 'Julian Thorne',
      previewRole: 'Brand Strategist',
      previewCompany: 'Omni Media',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'amethyst-tech',
      name: 'Bright Amethyst',
      category: 'Tech & Startups',
      theme: '#7a4fc0',
      description: 'Vibrant tech-forward purple gradient designed for AI engineers and developers.',
      previewName: 'Chloe Zhang',
      previewRole: 'Principal AI Engineer',
      previewCompany: 'Nexus Labs',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white border-y border-slate-200/70" id="templates">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t('templates.eyebrow')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-slate-900">
            {t('templates.title')}
          </h2>
          <p className="mt-4 text-base text-slate-600">
            {t('templates.subtitle')}
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-[#f8f9fd] rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5"
            >
              {/* Mini Visual Preview Card */}
              <div className="w-full aspect-[1/1.45] bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden relative flex flex-col justify-between p-4 mb-4">
                {/* Top Banner */}
                <div
                  className="absolute top-0 start-0 end-0 h-14"
                  style={{
                    background: `linear-gradient(135deg, ${tpl.theme} 0%, ${tpl.theme}cc 100%)`,
                  }}
                />

                {/* Avatar & Info */}
                <div className="relative z-10 pt-5 flex flex-col items-center text-center">
                  <img
                    src={tpl.avatar}
                    alt={tpl.previewName}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-xs object-cover"
                  />
                  <span className="text-xs font-bold font-display text-slate-900 mt-2">
                    {tpl.previewName}
                  </span>
                  <span className="text-[10px] text-slate-500">{tpl.previewRole}</span>
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1"
                    style={{ backgroundColor: `${tpl.theme}15`, color: tpl.theme }}
                  >
                    {tpl.previewCompany}
                  </span>
                </div>

                {/* Mini QR Simulation */}
                <div className="flex flex-col items-center justify-center my-auto">
                  <div
                    className="w-12 h-12 rounded-lg border flex items-center justify-center p-1 bg-white shadow-2xs"
                    style={{ borderColor: `${tpl.theme}40` }}
                  >
                    <div
                      className="w-full h-full rounded-sm opacity-80"
                      style={{
                        background: `radial-gradient(circle, ${tpl.theme} 30%, transparent 31%), radial-gradient(circle, ${tpl.theme} 30%, transparent 31%)`,
                        backgroundSize: '4px 4px',
                      }}
                    />
                  </div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                    Scan Contact
                  </span>
                </div>

                {/* Mini Platform Dots */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#0A66C2] flex items-center justify-center text-white text-[7px]">
                    in
                  </div>
                  <div className="w-4 h-4 rounded-full bg-[#E4405F] flex items-center justify-center text-white text-[7px]">
                    ig
                  </div>
                  <div className="w-4 h-4 rounded-full bg-[#25D366] flex items-center justify-center text-white text-[7px]">
                    wa
                  </div>
                </div>
              </div>

              {/* Card Meta & Use CTA */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold font-display text-slate-900">
                    {tpl.name}
                  </h3>
                  <span
                    className="w-3 h-3 rounded-full shadow-2xs"
                    style={{ backgroundColor: tpl.theme }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mb-4 leading-relaxed line-clamp-2">
                  {tpl.description}
                </p>

                <button
                  type="button"
                  onClick={() => onSelectTemplate(tpl.theme, tpl.name)}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-900 hover:text-white border border-slate-200 group-hover:border-slate-900 shadow-2xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{t('templates.useTemplate')}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

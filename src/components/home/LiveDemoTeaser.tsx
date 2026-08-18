import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowRight, UserCheck, Briefcase, Palette } from 'lucide-react';
import { CardPreview } from '../CardPreview';
import type { CardData } from '../../types';

interface LiveDemoTeaserProps {
  onSelectPersona: (card: CardData) => void;
}

export const LiveDemoTeaser: React.FC<LiveDemoTeaserProps> = ({ onSelectPersona }) => {
  const { t } = useTranslation();

  const personas: Array<{
    id: string;
    roleLabel: string;
    icon: any;
    card: CardData;
    tagline: string;
  }> = [
    {
      id: 'designer',
      roleLabel: 'Product Designer',
      icon: Palette,
      tagline: 'Clean aesthetics, Figma & Dribbble links, portfolio showcase.',
      card: {
        slug: 'sarah-jenkins',
        fullName: 'Sarah Jenkins',
        title: 'Lead Product Designer',
        company: 'Aura Studio',
        phone: '+1 (555) 234-5678',
        email: 'sarah@aurastudio.design',
        website: 'aurastudio.design',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        theme: '#101c5e',
        layout: 'vertical',
        socials: [
          { platform: 'phone', value: '+1 (555) 234-5678', onCard: true },
          { platform: 'email', value: 'sarah@aurastudio.design', onCard: true },
          { platform: 'website', value: 'aurastudio.design', onCard: true },
          { platform: 'instagram', value: 'sarah.j.creative', onCard: true },
          { platform: 'linkedin', value: 'sarahjenkins', onCard: true },
        ],
      },
    },
    {
      id: 'founder',
      roleLabel: 'Tech Founder',
      icon: Briefcase,
      tagline: 'Direct scheduling via Calendly, investor deck link, WhatsApp & X.',
      card: {
        slug: 'alex-rivera',
        fullName: 'Alex Rivera',
        title: 'Co-Founder & CEO',
        company: 'Pulse AI',
        phone: '+1 (415) 890-1234',
        email: 'alex@pulse.ai',
        website: 'pulse.ai',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        theme: '#3d2f86',
        layout: 'vertical',
        socials: [
          { platform: 'phone', value: '+1 (415) 890-1234', onCard: true },
          { platform: 'email', value: 'alex@pulse.ai', onCard: true },
          { platform: 'website', value: 'pulse.ai', onCard: true },
          { platform: 'twitter', value: 'alexrivera_ai', onCard: true },
          { platform: 'linkedin', value: 'alexrivera', onCard: true },
          { platform: 'whatsapp', value: '+14158901234', onCard: true },
        ],
      },
    },
    {
      id: 'creator',
      roleLabel: 'Creative / Artist',
      icon: UserCheck,
      tagline: 'YouTube, TikTok, Substack newsletter, Instagram & Spotify links.',
      card: {
        slug: 'maya-lin',
        fullName: 'Maya Lin',
        title: 'Visual Artist & Creator',
        company: 'Studio Lin',
        phone: '+1 (310) 745-9821',
        email: 'hello@mayalin.art',
        website: 'mayalin.art',
        photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
        theme: '#5f3fac',
        layout: 'vertical',
        socials: [
          { platform: 'phone', value: '+1 (310) 745-9821', onCard: true },
          { platform: 'email', value: 'hello@mayalin.art', onCard: true },
          { platform: 'website', value: 'mayalin.art', onCard: true },
          { platform: 'instagram', value: 'mayalin.art', onCard: true },
          { platform: 'tiktok', value: 'mayalin_creates', onCard: true },
          { platform: 'youtube', value: 'MayaLinStudio', onCard: true },
        ],
      },
    },
  ];

  const [activeTab, setActiveTab] = useState('designer');
  const currentPersona = personas.find((p) => p.id === activeTab) || personas[0];

  return (
    <section className="py-20 sm:py-28" id="interactive-demo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl sm:rounded-[36px] p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl">
          {/* Ambient gradient glow in dark box */}
          <div className="absolute top-0 end-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 start-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
            {/* Left Controls & Info */}
            <div className="lg:col-span-6 flex flex-col">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-bold mb-4 w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('templates.eyebrow')}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
                {t('templates.title')}
              </h2>
              <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
                {t('templates.subtitle')}
              </p>

              {/* Persona Tab Switcher */}
              <div className="mt-8 flex flex-col sm:flex-row gap-2.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80">
                {personas.map((persona) => {
                  const Icon = persona.icon;
                  const isActive = activeTab === persona.id;
                  return (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => setActiveTab(persona.id)}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{persona.roleLabel}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Persona Tagline */}
              <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: currentPersona.card.theme }}
                />
                <p>{currentPersona.tagline}</p>
              </div>

              {/* Action Button */}
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => onSelectPersona(currentPersona.card)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #101c5e 0%, #3d2f86 50%, #7a4fc0 100%)',
                  }}
                >
                  <span>{t('templates.useTemplate')}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </div>
            </div>

            {/* Right: Live Vertical Card Demonstration */}
            <div className="lg:col-span-6 flex justify-center items-center">
              <div className="relative transform hover:scale-102 transition-transform duration-300">
                <CardPreview card={currentPersona.card} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { Navbar } from './home/Navbar';
import { Hero } from './home/Hero';
import { TrustStrip } from './home/TrustStrip';
import { Features } from './home/Features';
import { HowItWorks } from './home/HowItWorks';
import { LiveDemoTeaser } from './home/LiveDemoTeaser';
import { TemplatesGallery } from './home/TemplatesGallery';
import { StatsBand } from './home/StatsBand';
import { Testimonials } from './home/Testimonials';
import { Pricing } from './home/Pricing';
import { Faq } from './home/Faq';
import { FinalCta } from './home/FinalCta';
import { Footer } from './home/Footer';
import { AuthModal } from './AuthModal';
import { useAuth } from './AuthProvider';
import type { CardData } from '../types';
import type { AuthUser } from '../lib/auth';

interface HomePageProps {
  onNavigateToEditor: () => void;
  onApplyTemplateAndEdit: (themeColor: string, templateName?: string) => void;
  onApplyPersonaAndEdit: (card: CardData) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToEditor,
  onApplyTemplateAndEdit,
  onApplyPersonaAndEdit,
}) => {
  const { user, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await logout();
  };

  const handleAuthSuccess = (_newUser: AuthUser) => {
    onNavigateToEditor();
  };

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const topOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#eef0f7] text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* 1) STICKY NAVBAR */}
      <Navbar
        user={user}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
        onNavigateToEditor={onNavigateToEditor}
      />

      <main className="flex-1">
        {/* 2) HERO */}
        <Hero
          onNavigateToEditor={onNavigateToEditor}
          onScrollToHowItWorks={() => handleScrollToSection('how-it-works')}
        />

        {/* 3) TRUST / LOGO STRIP */}
        <TrustStrip />

        {/* 4) FEATURES */}
        <Features />

        {/* 5) HOW IT WORKS */}
        <HowItWorks onNavigateToEditor={onNavigateToEditor} />

        {/* 6) LIVE DEMO / INTERACTIVE PERSONA TEASER */}
        <LiveDemoTeaser onSelectPersona={onApplyPersonaAndEdit} />

        {/* 7) TEMPLATES GALLERY */}
        <TemplatesGallery
          onSelectTemplate={(theme, name) => onApplyTemplateAndEdit(theme, name)}
        />

        {/* 8) STATS BAND */}
        <StatsBand />

        {/* 9) TESTIMONIALS */}
        <Testimonials />

        {/* 10) PRICING */}
        <Pricing onNavigateToEditor={onNavigateToEditor} />

        {/* 11) FAQ */}
        <Faq />

        {/* 12) FINAL CTA */}
        <FinalCta onNavigateToEditor={onNavigateToEditor} />
      </main>

      {/* 13) FOOTER */}
      <Footer onNavigateToEditor={onNavigateToEditor} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

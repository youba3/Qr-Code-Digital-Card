import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Menu, X, ArrowRight, LogOut, Plus } from 'lucide-react';
import { LanguageSelector } from '../LanguageSelector';
import type { AuthUser } from '../../types';

interface NavbarProps {
  user: AuthUser | null;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onSignOut: () => void;
  onNavigateToEditor: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onSignOut,
  onNavigateToEditor,
}) => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Check active section
      const sections = ['features', 'how-it-works', 'templates', 'pricing', 'faq'];
      const scrollPos = window.scrollY + 120;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const topOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const userName = user?.displayName || user?.name || user?.email?.split('@')[0] || 'User';
  const userAvatar = user?.photoURL || user?.avatar;

  const navLinks = [
    { id: 'features', label: t('nav.features') },
    { id: 'how-it-works', label: t('nav.howItWorks') },
    { id: 'templates', label: t('nav.templates') },
    { id: 'pricing', label: t('nav.pricing') },
    { id: 'faq', label: t('nav.faq') },
  ];

  return (
    <header
      id="landing-navbar"
      className={`fixed top-0 start-0 end-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 group cursor-pointer select-none"
          id="landing-logo-brand"
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #101c5e 0%, #3d2f86 50%, #7a4fc0 100%)',
            }}
          >
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold font-display tracking-tight text-slate-900 leading-none">
              {t('common.brand')}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
              {t('common.digitalCards')}
            </span>
          </div>
        </a>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-2xs">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => handleScrollTo(link.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'text-indigo-900 bg-indigo-50 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions / Language / Auth Button */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Language Selector */}
          <LanguageSelector variant="navbar" />

          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/70">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[9px] flex items-center justify-center">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-bold text-slate-700 max-w-[110px] truncate">
                  {userName}
                </span>
                <button
                  type="button"
                  onClick={onSignOut}
                  title={t('common.signOut')}
                  className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                id="nav-user-editor-btn"
                onClick={onNavigateToEditor}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #101c5e 0%, #3d2f86 50%, #7a4fc0 100%)',
                }}
              >
                <span>{t('nav.openCardEditor')}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                id="nav-signin-btn"
                onClick={() => onOpenAuth('signin')}
                className="px-3.5 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-all cursor-pointer"
              >
                {t('common.signIn')}
              </button>

              <button
                type="button"
                id="nav-create-card-btn"
                onClick={onNavigateToEditor}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #101c5e 0%, #3d2f86 50%, #7a4fc0 100%)',
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('common.createMyCard')}</span>
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <LanguageSelector variant="compact" />
          <button
            type="button"
            onClick={onNavigateToEditor}
            className="px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-xs cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #101c5e 0%, #7a4fc0 100%)',
            }}
          >
            {t('common.createCard')}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 bg-white/80 border border-slate-200 shadow-2xs cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white/98 backdrop-blur-xl border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => handleScrollTo(link.id)}
                className="text-start px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2">
                    {userAvatar ? (
                      <img src={userAvatar} alt={userName} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-bold text-slate-800">{userName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="text-xs text-rose-600 font-semibold cursor-pointer"
                  >
                    {t('common.signOut')}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateToEditor();
                  }}
                  className="w-full py-2.5 rounded-full text-xs font-bold text-white text-center shadow-md cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #101c5e 0%, #7a4fc0 100%)',
                  }}
                >
                  {t('nav.openCardEditor')}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signin');
                  }}
                  className="w-full py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 text-center cursor-pointer"
                >
                  {t('common.signIn')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateToEditor();
                  }}
                  className="w-full py-2.5 rounded-full text-xs font-bold text-white text-center shadow-md cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #101c5e 0%, #7a4fc0 100%)',
                  }}
                >
                  {t('nav.createFree')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

import React from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Github, Twitter, Linkedin, Instagram } from 'lucide-react';
import { LanguageSelector } from '../LanguageSelector';

interface FooterProps {
  onNavigateToEditor: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToEditor }) => {
  const { t } = useTranslation();

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Col 1: Brand Info */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
                style={{
                  background: 'linear-gradient(135deg, #101c5e 0%, #3d2f86 50%, #7a4fc0 100%)',
                }}
              >
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-display tracking-tight text-white">
                {t('common.brand')}
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {t('footer.description')}
            </p>

            {/* Language Switcher in Footer */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                {t('common.language')}
              </span>
              <LanguageSelector variant="footer" />
            </div>

            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-colors"
                title="Twitter / X"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#0A66C2] hover:text-white flex items-center justify-center transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#E4405F] hover:text-white flex items-center justify-center transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-colors"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {t('footer.product')}
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => handleScrollTo('features')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('nav.features')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleScrollTo('templates')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('nav.templates')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleScrollTo('pricing')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('nav.pricing')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onNavigateToEditor}
                  className="hover:text-white transition-colors cursor-pointer text-indigo-400 font-semibold"
                >
                  {t('common.cardStudio')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {t('footer.resources')}
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => handleScrollTo('faq')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('nav.faq')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleScrollTo('how-it-works')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('nav.howItWorks')}
                </button>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Systems Operational</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {t('footer.legal')}
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">{t('footer.privacy')}</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">{t('footer.terms')}</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">{t('footer.cookies')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} {t('common.brand')}. {t('footer.rights')}</p>

          <div className="flex items-center gap-1.5">
            <span>Crafted with precision for modern professionals</span>
            <span className="text-slate-400 font-semibold">· {t('common.brand')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

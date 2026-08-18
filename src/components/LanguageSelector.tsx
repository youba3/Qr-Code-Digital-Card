import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type SupportedLanguageCode } from '../lib/i18n';

interface LanguageSelectorProps {
  variant?: 'navbar' | 'footer' | 'editor' | 'compact';
  className?: string;
  onChangeCardLanguage?: (lang: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'navbar',
  className = '',
  onChangeCardLanguage,
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangCode = (i18n.resolvedLanguage || i18n.language || 'fr').slice(0, 2) as SupportedLanguageCode;
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === currentLangCode) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: SupportedLanguageCode) => {
    i18n.changeLanguage(code);
    if (onChangeCardLanguage) {
      onChangeCardLanguage(code);
    }
    setIsOpen(false);
  };

  if (variant === 'footer') {
    return (
      <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = lang.code === currentLangCode;
          return (
            <button
              key={lang.code}
              type="button"
              id={`lang-btn-footer-${lang.code}`}
              onClick={() => handleSelectLanguage(lang.code)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-2xs font-bold'
                  : 'bg-white/80 text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200/80'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`} id="language-selector-root">
      <button
        type="button"
        id="language-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none ${
          variant === 'editor'
            ? 'bg-white/15 hover:bg-white/25 border border-white/20 text-white shadow-2xs backdrop-blur-md'
            : variant === 'compact'
            ? 'p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700'
            : 'bg-white/80 hover:bg-white border border-slate-200/80 text-slate-700 shadow-2xs'
        }`}
        title="Change Language / Changer de langue"
      >
        <Globe className={`w-3.5 h-3.5 ${variant === 'editor' ? 'text-indigo-200' : 'text-slate-500'}`} />
        <span className="hidden sm:inline">{currentLang.flag}</span>
        <span className="font-bold">{currentLang.name}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute end-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 text-slate-800 z-50 animate-in fade-in zoom-in-95 duration-150"
          id="language-dropdown-menu"
        >
          <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Select Language
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLangCode;
            return (
              <button
                key={lang.code}
                type="button"
                id={`select-lang-${lang.code}`}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

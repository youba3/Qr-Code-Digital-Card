import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Loader2, AlertCircle, Cloud } from 'lucide-react';

export type SaveState = 'saved' | 'saving' | 'unsaved' | 'error';

interface SaveStatusProps {
  status: SaveState;
  lastSavedAt?: string | null;
}

export const SaveStatus: React.FC<SaveStatusProps> = ({ status, lastSavedAt }) => {
  const { t } = useTranslation();

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white/10 backdrop-blur-md border border-white/15 text-white/90 shadow-2xs select-none transition-all"
      title={
        status === 'saving'
          ? t('editor.saveStatus.saving')
          : status === 'saved'
          ? `${t('editor.saveStatus.saved')}${lastSavedAt ? ` (${new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''}`
          : status === 'unsaved'
          ? t('editor.saveStatus.unsaved')
          : t('editor.saveStatus.error')
      }
    >
      {status === 'saving' && (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-300" />
          <span className="text-white/90 font-medium">{t('editor.saveStatus.saving')}</span>
        </>
      )}

      {status === 'saved' && (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-300 stroke-[2.5]" />
          <span className="text-white font-medium">{t('editor.saveStatus.saved')} ✓</span>
        </>
      )}

      {status === 'unsaved' && (
        <>
          <Cloud className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-amber-200 font-medium">{t('editor.saveStatus.unsaved')}</span>
        </>
      )}

      {status === 'error' && (
        <>
          <AlertCircle className="w-3.5 h-3.5 text-rose-300" />
          <span className="text-rose-200 font-medium">{t('editor.saveStatus.error')}</span>
        </>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthProvider';
import { AuthModal } from './AuthModal';
import { CreditCard, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onNavigateToHome?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, onNavigateToHome }) => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef0f7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white animate-pulse"
            style={{
              background: 'linear-gradient(135deg, #101c5e 0%, #3d2f86 50%, #7a4fc0 100%)',
            }}
          >
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <p className="text-xs text-slate-500 font-medium">Checking account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#eef0f7] flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
        {/* Navigation Bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onNavigateToHome}
            className="flex items-center gap-2.5 cursor-pointer text-slate-900"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{
                background: 'linear-gradient(135deg, #101c5e 0%, #3d2f86 50%, #7a4fc0 100%)',
              }}
            >
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold font-display tracking-tight">{t('common.brand')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setAuthModalOpen(true);
            }}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {t('common.signIn')}
          </button>
        </header>

        {/* Auth Gate Content */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 text-center relative overflow-hidden">
            <div
              className="absolute top-0 left-0 right-0 h-2"
              style={{
                background: 'linear-gradient(90deg, #101c5e 0%, #3d2f86 50%, #7a4fc0 100%)',
              }}
            />

            <div
              className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #101c5e 0%, #3d2f86 50%, #7a4fc0 100%)',
              }}
            >
              <CreditCard className="w-7 h-7 text-white" />
            </div>

            <h2 className="text-xl font-bold font-display text-slate-900 mb-2">
              {t('auth.createAccount')}
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
              {t('auth.signUpSubtitle')}
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthModalOpen(true);
                }}
                className="w-full py-3 px-4 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #101c5e 0%, #3d2f86 50%, #7a4fc0 100%)',
                }}
              >
                <span>{t('auth.signUpSubmit')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setAuthModalOpen(true);
                }}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                {t('auth.switchToSignIn')}
              </button>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-3 text-start">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-[11px] text-slate-600 leading-tight">Permanent static QR link</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-[11px] text-slate-600 leading-tight">Instant vCard & PNG exports</span>
              </div>
            </div>
          </div>
        </main>

        <AuthModal
          isOpen={authModalOpen}
          initialMode={authMode}
          onClose={() => setAuthModalOpen(false)}
        />
      </div>
    );
  }

  return <>{children}</>;
};

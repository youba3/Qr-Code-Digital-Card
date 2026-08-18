import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Mail, Lock, Sparkles, ArrowRight, Eye, EyeOff, ShieldCheck, UserPlus, LogIn, KeyRound, Check } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { formatAuthError } from '../lib/auth';
import type { AuthUser } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  onSuccess?: (user: AuthUser) => void;
  title?: string;
  subtitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signup',
  onClose,
  onSuccess,
  title,
  subtitle,
}) => {
  const { t } = useTranslation();
  const { signUp, login, loginGoogle, loginDemo, resetPassword } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync mode if initialMode changes
  React.useEffect(() => {
    setMode(initialMode);
    setError(null);
    setSuccessMessage(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'forgot') {
        await resetPassword(email);
        setSuccessMessage(t('auth.resetSuccess'));
        setIsSubmitting(false);
        return;
      }

      let user: AuthUser;
      if (mode === 'signup') {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        user = await signUp(email, password);
      } else {
        user = await login(email, password);
      }

      onClose();
      if (onSuccess) {
        onSuccess(user);
      }
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleClick = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      const user = await loginGoogle();
      onClose();
      if (onSuccess) {
        onSuccess(user);
      }
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoClick = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      const user = await loginDemo();
      onClose();
      if (onSuccess) {
        onSuccess(user);
      }
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchToSignUp = () => {
    setMode('signup');
    setError(null);
    setSuccessMessage(null);
  };

  const handleSwitchToSignIn = () => {
    setMode('signin');
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div
          className="h-2 w-full"
          style={{
            background: 'linear-gradient(90deg, #101c5e 0%, #3d2f86 50%, #7a4fc0 100%)',
          }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header text */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold font-display text-slate-900">
              {mode === 'forgot'
                ? t('auth.resetPasswordTitle')
                : title || (mode === 'signup' ? t('auth.createAccount') : t('auth.welcomeBack'))}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'forgot'
                ? t('auth.resetPasswordSubtitle')
                : subtitle ||
                  (mode === 'signup'
                    ? t('auth.signUpSubtitle')
                    : t('auth.signInSubtitle'))}
            </p>
          </div>

          {mode !== 'forgot' && (
            <>
              {/* Google Auth Button */}
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{t('auth.continueWithGoogle')}</span>
              </button>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                  <span className="bg-white px-3 text-slate-400 font-medium">{t('auth.orWithEmail')}</span>
                </div>
              </div>

              {/* Tab Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
                <button
                  type="button"
                  onClick={handleSwitchToSignUp}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t('auth.signUpTab')}
                </button>
                <button
                  type="button"
                  onClick={handleSwitchToSignIn}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t('auth.signInTab')}
                </button>
              </div>
            </>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner with helpful actions */}
          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-2 animate-shake">
              <div className="flex items-start gap-2">
                <span className="font-bold text-red-600 shrink-0">!</span>
                <span className="leading-relaxed">{error}</span>
              </div>

              {/* Contextual recovery action */}
              {mode === 'signin' && (
                <div className="pt-1.5 border-t border-red-200/60 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSwitchToSignUp}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-2xs transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3 h-3 text-indigo-600" />
                    <span>{t('auth.createAccountWithEmail')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDemoClick}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Demo Mode</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  className="w-full ps-10 pe-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">{t('auth.password')}</label>
                  {mode === 'signup' ? (
                    <span className="text-[11px] text-slate-400">{t('auth.minChars')}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                    >
                      {t('auth.forgotPassword')}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full ps-10 pe-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #101c5e 0%, #3d2f86 50%, #7a4fc0 100%)',
              }}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'forgot' ? (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{t('auth.sendResetLink')}</span>
                    </>
                  ) : mode === 'signup' ? (
                    <>
                      <span>{t('auth.signUpSubmit')}</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </>
                  ) : (
                    <>
                      <span>{t('auth.signInSubmit')}</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          {/* Mode Switcher footer / Quick Demo Login Option */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center gap-2.5">
            {mode === 'forgot' ? (
              <button
                type="button"
                onClick={handleSwitchToSignIn}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('auth.backToSignIn')}</span>
              </button>
            ) : (
              <div className="w-full flex items-center justify-between text-xs text-slate-500">
                {mode === 'signin' ? (
                  <button
                    type="button"
                    onClick={handleSwitchToSignUp}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                  >
                    {t('auth.switchToSignUp')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSwitchToSignIn}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                  >
                    {t('auth.switchToSignIn')}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDemoClick}
                  disabled={isSubmitting}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Demo</span>
                </button>
              </div>
            )}

            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>{t('auth.securityNotice')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


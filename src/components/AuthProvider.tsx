import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthUser } from '../types';
import {
  subscribeToAuth,
  signUpWithEmail,
  loginWithEmail,
  loginWithGoogle,
  loginAsDemoUser,
  sendPasswordReset,
  logoutUser,
  getStoredUser,
} from '../lib/auth';
import { isFirebaseConfigured } from '../lib/firebase';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isConfigured: boolean;
  signUp: (email: string, pass: string) => Promise<AuthUser>;
  login: (email: string, pass: string) => Promise<AuthUser>;
  loginGoogle: () => Promise<AuthUser>;
  loginDemo: () => Promise<AuthUser>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSignUp = async (email: string, pass: string): Promise<AuthUser> => {
    const newUser = await signUpWithEmail(email, pass);
    setUser(newUser);
    return newUser;
  };

  const handleLogin = async (email: string, pass: string): Promise<AuthUser> => {
    const loggedUser = await loginWithEmail(email, pass);
    setUser(loggedUser);
    return loggedUser;
  };

  const handleGoogle = async (): Promise<AuthUser> => {
    const googleUser = await loginWithGoogle();
    setUser(googleUser);
    return googleUser;
  };

  const handleDemo = async (): Promise<AuthUser> => {
    const demoUser = await loginAsDemoUser();
    setUser(demoUser);
    return demoUser;
  };

  const handleResetPassword = async (email: string): Promise<void> => {
    await sendPasswordReset(email);
  };

  const handleLogout = async (): Promise<void> => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isFirebaseConfigured,
        signUp: handleSignUp,
        login: handleLogin,
        loginGoogle: handleGoogle,
        loginDemo: handleDemo,
        resetPassword: handleResetPassword,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useUser(): AuthUser | null {
  const { user } = useAuth();
  return user;
}

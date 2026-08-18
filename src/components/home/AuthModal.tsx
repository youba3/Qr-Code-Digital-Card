import React from 'react';
import { AuthModal as UnifiedAuthModal } from '../AuthModal';
import type { AuthUser } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  initialMode?: 'signin' | 'signup';
  title?: string;
  subtitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = (props) => {
  return <UnifiedAuthModal {...props} />;
};


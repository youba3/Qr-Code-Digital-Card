import React, { useEffect, useState } from 'react';
import { HomePage } from './components/HomePage';
import { EditorPage } from './components/EditorPage';
import { PublicCard } from './components/PublicCard';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { loadDraftCard, saveDraftCard } from './lib/storage';
import { loadCard } from './lib/cards';
import type { CardData } from './types';

function AppContent() {
  const { user } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<{
    page: 'home' | 'editor' | 'public';
    slug?: string;
  }>(() => parseLocation());

  const [card, setCard] = useState<CardData>(() => loadDraftCard());

  function parseLocation(): { page: 'home' | 'editor' | 'public'; slug?: string } {
    const pathname = window.location.pathname;
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);

    // 1. Check query param: ?c=slug or ?card=slug
    const querySlug = searchParams.get('c') || searchParams.get('card');
    if (querySlug) {
      return { page: 'public', slug: querySlug };
    }

    // 2. Check hash: #/c/slug or #c=slug
    if (hash.startsWith('#/c/')) {
      const hashSlug = hash.replace('#/c/', '').split('?')[0];
      if (hashSlug) return { page: 'public', slug: hashSlug };
    }

    // 3. Check path: /c/slug
    if (pathname.startsWith('/c/')) {
      const pathSlug = pathname.replace('/c/', '').split('/')[0];
      if (pathSlug) return { page: 'public', slug: pathSlug };
    }

    // 4. Check if explicitly in editor mode: ?view=editor or #/editor or /editor
    if (
      searchParams.get('view') === 'editor' ||
      searchParams.get('tab') === 'editor' ||
      hash === '#/editor' ||
      hash === '#editor' ||
      pathname === '/editor'
    ) {
      return { page: 'editor' };
    }

    // Default route is Home / Landing Page
    return { page: 'home' };
  }

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(parseLocation());
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // When user logs in, load their user-specific card
  useEffect(() => {
    if (user?.uid) {
      loadCard(user.uid, user.email, user.displayName).then((userCard) => {
        if (userCard) {
          setCard(userCard);
        }
      });
    }
  }, [user?.uid, user?.email, user?.displayName]);

  const navigateToPublic = (slug: string) => {
    try {
      window.history.pushState({}, '', `/c/${slug}`);
    } catch {
      window.location.hash = `/c/${slug}`;
    }
    setCurrentRoute({ page: 'public', slug });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToEditor = () => {
    try {
      window.history.pushState({}, '', '/?view=editor');
    } catch {
      window.location.hash = '/editor';
    }
    setCurrentRoute({ page: 'editor' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    try {
      window.history.pushState({}, '', '/');
    } catch {
      window.location.hash = '';
    }
    setCurrentRoute({ page: 'home' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyTemplateAndEdit = (themeColor: string) => {
    const updated = { ...card, theme: themeColor };
    setCard(updated);
    saveDraftCard(updated);
    navigateToEditor();
  };

  const handleApplyPersonaAndEdit = (personaCard: CardData) => {
    setCard(personaCard);
    saveDraftCard(personaCard);
    navigateToEditor();
  };

  if (currentRoute.page === 'public' && currentRoute.slug) {
    return (
      <PublicCard
        slug={currentRoute.slug}
        fallbackCard={card}
        onNavigateToEditor={navigateToEditor}
        onNavigateToHome={navigateToHome}
      />
    );
  }

  if (currentRoute.page === 'editor') {
    return (
      <ProtectedRoute onNavigateToHome={navigateToHome}>
        <EditorPage
          card={card}
          onUpdateCard={setCard}
          onNavigateToPublic={navigateToPublic}
          onNavigateToHome={navigateToHome}
        />
      </ProtectedRoute>
    );
  }

  return (
    <HomePage
      onNavigateToEditor={navigateToEditor}
      onApplyTemplateAndEdit={handleApplyTemplateAndEdit}
      onApplyPersonaAndEdit={handleApplyPersonaAndEdit}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

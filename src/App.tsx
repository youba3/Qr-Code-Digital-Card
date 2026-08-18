import React, { useEffect, useState } from 'react';
import { HomePage } from './components/HomePage';
import { EditorPage } from './components/EditorPage';
import { PublicCard } from './components/PublicCard';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { loadDraftCard, saveDraftCard, getPublicUrl } from './lib/storage';
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

    // 0. GitHub Pages / static host 404.html redirect format: /?/c/slug or /?/editor
    if (window.location.search.startsWith('?/')) {
      const rawRedirect = window.location.search.slice(2).split('&')[0].replace(/~and~/g, '&');
      if (rawRedirect.startsWith('c/')) {
        const slug = rawRedirect.replace(/^c\//, '').split('/')[0];
        if (slug) return { page: 'public', slug };
      }
      if (rawRedirect === 'editor') {
        return { page: 'editor' };
      }
    }

    // 1. Check query param: ?c=slug or ?card=slug
    const querySlug = searchParams.get('c') || searchParams.get('card');
    if (querySlug) {
      return { page: 'public', slug: querySlug };
    }

    // 1b. Check if ?d= (encoded card) exists on root URL
    if (searchParams.get('d')) {
      return { page: 'public', slug: 'preview' };
    }

    // 2. Check hash: #/c/slug or #c=slug or #/c/slug?d=...
    if (hash.startsWith('#/c/')) {
      const cleanHash = hash.replace('#/c/', '').split('?')[0].split('#')[0];
      if (cleanHash) return { page: 'public', slug: cleanHash };
      return { page: 'public', slug: 'preview' };
    }
    if (hash.startsWith('#c=')) {
      const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
      const hashSlug = hashParams.get('c');
      if (hashSlug) return { page: 'public', slug: hashSlug };
    }
    if (hash.includes('d=')) {
      return { page: 'public', slug: 'preview' };
    }

    // 3. Check path: /c/slug or /c
    if (pathname.startsWith('/c/')) {
      const pathSlug = pathname.replace('/c/', '').split('/')[0];
      if (pathSlug) return { page: 'public', slug: pathSlug };
      return { page: 'public', slug: 'preview' };
    }
    if (pathname === '/c' || pathname === '/c/') {
      return { page: 'public', slug: 'preview' };
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

  const navigateToPublic = (slug: string, cardData?: CardData) => {
    const targetCard = cardData || card;
    const targetSlug = (slug || targetCard?.slug || 'preview').trim().toLowerCase();
    const publicUrl = getPublicUrl(targetSlug, targetCard);
    try {
      window.history.pushState({}, '', publicUrl);
    } catch {
      window.location.hash = `/c/${targetSlug}`;
    }
    if (targetCard) {
      setCard(targetCard);
    }
    setCurrentRoute({ page: 'public', slug: targetSlug });
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
    const updated = {
      ...personaCard,
      photo: card.photo || '',
    };
    setCard(updated);
    saveDraftCard(updated);
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

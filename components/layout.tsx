import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ToastContainer } from 'react-toastify';
import { NavBar } from './ui/NavBar';
import { ThemeSwitcher } from './ThemeSwitcher';
import { KofiButton } from './KofiButton';
import { BottomNav } from './ui/BottomNav';
import AccountMenu from './AccountMenu';
import { useUserSignIn } from '../hooks/use-user-sign-in.hook';
import { isPublicPath } from '../lib/routes';
import { useClickOutside } from '../hooks/useClickOutside';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const [isLoading, currentUser] = useUserSignIn();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isHomePage = router.pathname === '/';
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    const onRouteChange = () => setHasNavigated(true);
    router.events.on('routeChangeComplete', onRouteChange);

    return () => router.events.off('routeChangeComplete', onRouteChange);
  }, [router.events]);

  const toggleAccountMenu = () => {
    setIsAccountMenuOpen(!isAccountMenuOpen);
  };

  const closeAccountMenu = useCallback(() => setIsAccountMenuOpen(false), []);
  useClickOutside(accountMenuRef, closeAccountMenu, {
    enabled: isAccountMenuOpen,
  });

  const { user } = useUser();
  const isSigningIn =
    Boolean(user) && isLoading && !isPublicPath(router.pathname);

  useEffect(() => {
    if (!showLegalModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowLegalModal(false);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showLegalModal]);

  return (
    <div className="min-h-screen flex flex-col w-full">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 btn btn-sm btn-neutral"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 bg-primary text-primary-content p-2 shadow-lg">
        <div className="container mx-auto flex flex-wrap items-center justify-between">
          <Link
            href="/"
            className="flex items-center group"
            aria-label="DM Essentials home"
          >
            <span className="ml-2 text-xl md:text-2xl font-bold transition-transform duration-200 group-hover:scale-105">
              DM Essentials
            </span>
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <NavBar router={router} />

            <KofiButton
              buttonClassName="btn btn-ghost btn-sm hidden md:flex hover:scale-105 transition-transform"
              text="Support"
            />
            <AccountMenu
              currentUser={currentUser}
              accountMenuRef={accountMenuRef}
              isAccountMenuOpen={isAccountMenuOpen}
              toggleAccountMenu={toggleAccountMenu}
              setIsAccountMenuOpen={setIsAccountMenuOpen}
            />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-grow flex flex-col">
        {isSigningIn ? (
          <div
            className="flex-grow flex items-center justify-center min-h-[60vh]"
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-col items-center gap-4 fade-in">
              <span className="loading loading-spinner loading-lg text-primary" />
              <p className="text-base-content/60">Loading your table...</p>
            </div>
          </div>
        ) : (
          <div
            key={router.pathname}
            className={`${hasNavigated ? 'page-enter ' : ''}container mx-auto px-4 flex-grow ${
              isHomePage
                ? 'py-8'
                : `py-6 md:py-8 min-h-[80vh] ${
                    router.pathname === '/encounters/[id]'
                      ? 'max-w-7xl'
                      : 'max-w-4xl'
                  }`
            }`}
          >
            {children}
          </div>
        )}
      </main>

      <BottomNav />

      <footer className="p-4 pb-6 md:pb-4 bg-neutral text-neutral-content mb-16 md:mb-0">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex flex-col items-center mb-4 md:mb-0 text-xs">
            &copy; {new Date().getFullYear()} Dungeon Master Essentials.
            <div>
              All rights reserved.
              <button
                className="ml-2 underline hover:text-primary transition-colors text-xs"
                onClick={() => setShowLegalModal(true)}
                aria-label="View Legal Notice"
                type="button"
              >
                Legal Notice
              </button>
            </div>
          </div>
          <nav
            aria-label="Footer"
            className="flex flex-wrap justify-center gap-x-4 gap-y-2"
          >
            <Link href="/npc-generator" className="link link-hover">
              NPC Generator
            </Link>
            <Link href="/loot-generator" className="link link-hover">
              Loot Generator
            </Link>
            <Link href="/feedback" className="link link-hover">
              Have Feedback?
            </Link>
            <Link href="/support" className="link link-hover">
              Support Project
            </Link>
            <Link href="/privacy" className="link link-hover">
              Privacy Policy
            </Link>
            <Link href="/terms" className="link link-hover">
              Terms of Service
            </Link>
          </nav>
        </div>
        {showLegalModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-fade"
            onClick={() => setShowLegalModal(false)}
          >
            <div
              className="bg-base-100 rounded-lg shadow-2xl max-w-md w-full mx-2 p-6 relative pop-in"
              role="dialog"
              aria-modal="true"
              aria-label="Legal Notice"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 btn btn-xs btn-circle btn-ghost hover:rotate-90 transition-transform duration-200"
                onClick={() => setShowLegalModal(false)}
                aria-label="Close Legal Notice"
                type="button"
              >
                ✕
              </button>
              <h2 className="text-lg font-bold mb-2">Legal Notice</h2>
              <div className="text-xs max-h-64 overflow-y-auto text-base-content text-left whitespace-pre-line">
                Portions of the materials used are Open Game Content from the
                System Reference Document 5.1 (SRD 5.1) by Wizards of the Coast,
                LLC, used under the Open Game License v1.0a. Dungeons & Dragons
                and D&D are trademarks of Wizards of the Coast, LLC.{'\n\n'}Full
                license text is available in the repository OGL.txt file.
              </div>
            </div>
          </div>
        )}
      </footer>

      <ToastContainer />
    </div>
  );
}

export { Layout };

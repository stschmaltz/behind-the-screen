import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ToastContainer } from 'react-toastify';
import Head from 'next/head';
import { NavBar } from './ui/NavBar';
import { ThemeSwitcher } from './ThemeSwitcher';
import { KofiButton } from './KofiButton';
import { BottomNav } from './ui/BottomNav';
import AccountMenu from './AccountMenu';
import { useUserSignIn } from '../hooks/use-user-sign-in.hook';

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

  const toggleAccountMenu = () => {
    setIsAccountMenuOpen(!isAccountMenuOpen);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Head>
        <title>DM Essentials</title>
        <meta
          name="description"
          content="Essential tools for Dungeon Masters."
          key="desc"
        />
        {/* Favicon Links */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icons/favicon-32x32.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" key="ogtype" />
        <meta property="og:title" content="DM Essentials" key="ogtitle" />
        <meta
          property="og:description"
          content="Essential tools for Dungeon Masters."
          key="ogdesc"
        />
        <meta property="og:image" content="/og-image.png" key="ogimage" />
        <meta
          property="og:site_name"
          content="DM Essentials"
          key="ogsitename"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" key="twcard" />
        <meta name="twitter:title" content="DM Essentials" key="twtitle" />
        <meta
          name="twitter:description"
          content="Essential tools for Dungeon Masters."
          key="twdesc"
        />
        <meta name="twitter:image" content="/twitter-image.png" key="twimage" />
      </Head>
      <header className="sticky top-0 z-30 bg-primary text-white p-2">
        <div className="container mx-auto flex flex-wrap items-center justify-between">
          <Link href="/" className="flex items-center">
            <h1 className="ml-2 text-xl md:text-2xl font-bold">
              DM Essentials
            </h1>
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <NavBar router={router} />

            <KofiButton
              buttonClassName="btn btn-ghost btn-sm hidden md:flex"
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

      <main className="flex-grow flex flex-col">
        {isHomePage ? (
          <div className="container mx-auto px-4 py-8 ">{children}</div>
        ) : (
          <div className="container mx-auto px-4 py-6 md:py-8 flex-grow max-w-screen-md max-w-[1000px] min-h-[80vh]">
            {children}
          </div>
        )}
      </main>

      <BottomNav />

      <footer className="p-4 pb-10 md:pb-4 bg-neutral text-neutral-content mb-16 md:mb-0">
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
          <div className="flex gap-4">
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
          </div>
        </div>
        {showLegalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-base-100 rounded-lg shadow-lg max-w-md w-full mx-2 p-6 relative">
              <button
                className="absolute top-2 right-2 btn btn-xs btn-circle btn-ghost"
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
                and D&D are trademarks of Wizards of the Coast, LLC.\n\nFull
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

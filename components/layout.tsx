import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ToastContainer } from 'react-toastify';
import Head from 'next/head';
import Image from 'next/image';
import { NavBar } from './NavBar';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useUserSignIn } from '../hooks/use-user-sign-in.hook';
import { useUserPreferences } from '../hooks/user-preferences/use-user-preferences';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const [isLoading, currentUser] = useUserSignIn();
  const router = useRouter();
  const isHomePage = router.pathname === '/';

  // Load user preferences but don't directly apply theme
  useUserPreferences();

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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
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
            <h1 className="text-xl md:text-2xl font-bold">DM Essentials</h1>
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <NavBar router={router} />

            {currentUser ? (
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle avatar"
                >
                  <div className="w-10 rounded-full relative">
                    <Image
                      alt={currentUser.name || 'User avatar'}
                      src={currentUser.picture || '/default-avatar.svg'}
                      fill
                      sizes="40px"
                      style={{ objectFit: 'cover' }}
                      priority
                    />
                  </div>
                </div>
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 text-base-content"
                >
                  {currentUser.name && (
                    <li className="menu-title">
                      <span>Signed in as {currentUser.name}</span>
                    </li>
                  )}
                  <li>
                    <Link href="/api/auth/logout?returnTo=http%3A%2F%2Flocalhost%3A3000">
                      Logout
                    </Link>
                  </li>
                </ul>
              </div>
            ) : (
              <Link href="/api/auth/login" className="btn btn-ghost">
                Login / Sign Up
              </Link>
            )}

            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <ToastContainer />

      <div className="container mx-auto px-4 py-2 flex justify-between items-center min-h-[40px]">
        {currentUser && !isHomePage ? (
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-sm flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back
          </button>
        ) : (
          <div />
        )}
      </div>

      <main className="container mx-auto p-4 flex-grow flex flex-col">
        {currentUser || isHomePage ? (
          children
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-semibold mb-4">Please Login</h2>
            <p className="mb-6">You need to be logged in to view this page.</p>
            <Link href="/api/auth/login">
              <button className="btn btn-primary">Login</button>
            </Link>
          </div>
        )}
      </main>

      <footer className="bg-base-300 p-4 text-center text-sm">
        <div className="container mx-auto">
          <p>
            Copyright Shane Schmaltz 2025.{' '}
            <Link href="/feedback" className="text-primary hover:underline">
              Have feedback or need support?
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

export { Layout };

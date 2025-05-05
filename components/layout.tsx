import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ToastContainer } from 'react-toastify';
import Head from 'next/head';
import Image from 'next/image';
import { NavBar } from './NavBar';
import { ThemeSwitcher } from './ThemeSwitcher';
import { KofiButton } from './KofiButton';
import { useUserSignIn } from '../hooks/use-user-sign-in.hook';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const [isLoading, currentUser] = useUserSignIn();
  const router = useRouter();
  const isHomePage = router.pathname === '/';

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
                    <Link href="/account-settings">Account Settings</Link>
                  </li>
                  <li>
                    <Link href="/api/auth/logout?returnTo=http%3A%2F%2Flocalhost%3A3000">
                      Logout
                    </Link>
                  </li>
                </ul>
              </div>
            ) : (
              <Link href="/api/auth/login" className="btn btn-ghost">
                Log In / Sign Up
              </Link>
            )}

            <KofiButton
              buttonClassName="btn btn-ghost btn-sm hidden md:flex"
              text="Support"
            />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col">
        {isHomePage ? (
          <div className="container mx-auto px-4 py-8">{children}</div>
        ) : (
          <div className="container mx-auto px-4 py-8 flex-grow">
            {children}
          </div>
        )}
      </main>

      <footer className="p-4 pb-10 md:pb-4 bg-neutral text-neutral-content">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex flex-col items-center mb-4 md:mb-0 text-xs">
            &copy; {new Date().getFullYear()} Dungeon Master Essentials.
            <div>All rights reserved.</div>
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
      </footer>

      <ToastContainer />
    </div>
  );
}

export { Layout };

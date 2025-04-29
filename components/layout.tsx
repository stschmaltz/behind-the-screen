import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ToastContainer } from 'react-toastify';
import { NavBar } from './NavBar';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useUserSignIn } from '../hooks/use-user-sign-in.hook';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const [isLoading, currentUser] = useUserSignIn();
  const router = useRouter();

  if (isLoading && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      <header className="sticky top-0 z-50 bg-primary text-white p-2">
        <div className="container mx-auto flex flex-wrap items-center justify-between">
          <Link href="/" className="flex items-center">
            <h1 className="text-xl md:text-2xl font-bold">DM Essentials</h1>
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <NavBar router={router} />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <ToastContainer />

      {currentUser ? (
        <div className="flex-1 flex flex-col bg-content-100">
          <div className="container mx-auto px-4 py-2 flex justify-between items-center">
            {router.pathname !== '/' ? (
              <button
                onClick={() => router.back()}
                className="text-sm text-base-content/70 hover:text-base-content hover:underline flex items-center gap-1 transition-colors"
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
                Return
              </button>
            ) : (
              <div />
            )}

            <Link
              href="/api/auth/logout?returnTo=http%3A%2F%2Flocalhost%3A3000"
              className="text-sm text-blue-600 hover:underline"
            >
              Logout
            </Link>
          </div>

          <main className="container mx-auto p-4 flex-grow">{children}</main>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center w-full">
          <Link href="/api/auth/login">
            <button className="btn btn-primary">Login</button>
          </Link>
        </div>
      )}

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

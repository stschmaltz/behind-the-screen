import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ToastContainer } from 'react-toastify';
import { NavBar } from './NavBar';
import { Button } from './Button';
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
      <header className="navbar bg-primary text-white p-4">
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

      {currentUser?.email !== 'stschmaltz@gmail.com' && (
        <div className="bg-red-500 text-white text-center p-2 text-sm">
          This app is under development and not ready for use yet
        </div>
      )}

      {currentUser ? (
        <div className="flex-1 flex flex-col bg-content-100">
          <div className="container mx-auto px-4 py-2 flex justify-end">
            <Link
              href="/api/auth/logout?returnTo=http%3A%2F%2Flocalhost%3A3000"
              className="text-sm text-blue-600 hover:underline"
            >
              Logout
            </Link>
          </div>

          <main className="container mx-auto p-4 flex-grow">{children}</main>

          {router.pathname !== '/' && (
            <div className="container mx-auto px-4 pb-4">
              <Button
                variant="secondary"
                label="Back"
                className="w-full"
                onClick={() => router.back()}
              />
            </div>
          )}
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
            Copyright Shane Schmaltz 2025. For feedback, please email{' '}
            <a
              href="mailto:stschmaltz@gmail.com"
              className="text-primary hover:underline"
            >
              stschmaltz at gmail.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export { Layout };

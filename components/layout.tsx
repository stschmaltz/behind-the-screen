import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import NavBar from './NavBar';
import Button from './Button';
import ThemeSwitcher from './ThemeSwitcher';
import { useUserSignIn } from '../hooks/use-user-sign-in.hook';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isLoading, currentUser] = useUserSignIn();
  const router = useRouter();

  if (isLoading && !currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white flex items-center justify-between p-4">
        <Link href="/">
          <h1 className="text-2xl">DM Companion</h1>
        </Link>
        <NavBar router={router} />
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
        </div>
      </header>

      {currentUser ? (
        <div className="p-4 min-h-[85vh] overflow-auto flex flex-col">
          <Link
            href="/api/auth/logout?returnTo=http%3A%2F%2Flocalhost%3A3000"
            className="text-blue-600 hover:underline"
          >
            Logout
          </Link>
          <main className="p-4 overflow-auto flex-grow">{children}</main>

          {router.pathname !== '/' && (
            <Link href="/" className=" w-full p-4">
              <Button
                variant="secondary"
                label="Back to Home"
                className="w-full"
              />
            </Link>
          )}
        </div>
      ) : (
        <div className="flex h-full items-center justify-center w-full min-h-[80vh]">
          <Link href="/api/auth/login">
            <button className="btn btn-primary">Login</button>
          </Link>
        </div>
      )}

      <footer className="bg-gray-200 p-4 text-center">
        <p>Copyright Shane Schmaltz 2025.</p>
      </footer>
    </div>
  );
}

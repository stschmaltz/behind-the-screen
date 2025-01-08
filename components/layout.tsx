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
    <div className="min-h-screen flex flex-col w-full ">
      <header className="navbar bg-primary text-white flex items-center justify-between p-4">
        <Link href="/">
          <h1 className="text-2xl">DM Essentials</h1>
        </Link>
        <NavBar router={router} />
        <ThemeSwitcher />
      </header>

      {currentUser ? (
        <div className="p-4 min-h-[85vh] overflow-auto flex flex-col bg-content-100">
          <div className="flex justify-between items-center">
            <Link
              href="/api/auth/logout?returnTo=http%3A%2F%2Flocalhost%3A3000"
              className="text-blue-600 hover:underline"
            >
              Logout
            </Link>
          </div>

          <main className="p-4 overflow-y-auto flex-grow">{children}</main>

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

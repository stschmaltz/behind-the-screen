import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useUserSignIn } from '../hooks/use-user-sign-in.hook';
import NavBar from './NavBar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isLoading, currentUser] = useUserSignIn();
  const router = useRouter();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  // You can check the current route to highlight the active tab

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header or top nav */}
      <header className="bg-gray-800 text-white flex items-center justify-between p-4">
        <Link href="/">
          <h1 className="text-2xl">DM Companion</h1>
        </Link>
        {/* Tab Bar / Nav Links */}
        <NavBar router={router}></NavBar>
      </header>
      {currentUser ? (
        <div className="h-[80vh] w-full  relative">
          <Link
            href="/api/auth/logout?returnTo=http%3A%2F%2Flocalhost%3A3000"
            className="text-blue-600 hover:underline"
          >
            Logout
          </Link>
          <main className="flex-grow p-4">{children}</main>
          {router.pathname !== '/' && (
            <Link href="/" className="absolute bottom-0 left-0 w-full  p-4">
              <button className="btn btn-primary w-[inherit]">Back</button>
            </Link>
          )}
        </div>
      ) : (
        <div
          className="flex h-full items-center justify-center w-full
        min-h-[80vh]"
        >
          <Link href="/api/auth/login">
            <button className="btn btn-primary">Loginz</button>
          </Link>
        </div>
      )}

      <footer className="bg-gray-200 p-4 text-center">
        <p>All rights reserved.</p>
      </footer>
    </div>
  );
}

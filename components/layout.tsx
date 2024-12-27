import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useUserSignIn } from '../hooks/use-user-sign-in.hook';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [isLoading, currentUser] = useUserSignIn();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  // You can check the current route to highlight the active tab
  const isActive = (path: string) => router.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header or top nav */}
      <header className="bg-gray-800 text-white flex items-center justify-between p-4">
        <h1 className="text-2xl">DM Companion</h1>
        {/* Tab Bar / Nav Links */}
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link
                href="/encounters"
                className={isActive('/encounters') ? 'underline' : ''}
              >
                Encounter Manager
              </Link>
            </li>
            <li>
              <Link
                href="/npc-generator"
                className={isActive('/npc-generator') ? 'underline' : ''}
              >
                NPC Generator
              </Link>
            </li>
            <li>
              <Link
                href="/loot-generator"
                className={isActive('/loot-generator') ? 'underline' : ''}
              >
                Loot
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <div className="h-[80vh] w-full ">
        {/* Main Content */}
        {currentUser ? (
          <>
            <Link
              href="/api/auth/logout?returnTo=http%3A%2F%2Flocalhost%3A3000"
              className="text-blue-600 hover:underline"
            >
              Logout
            </Link>
            <main className="flex-grow p-4">{children}</main>
            {router.pathname !== '/' && (
              <Link href="/">
                <button className="btn btn-primary">Back</button>
              </Link>
            )}
          </>
        ) : (
          // Box replacement
          <div className="flex h-full items-center justify-center w-full">
            <Link href="/api/auth/login">
              <button className="btn btn-primary">Loginz</button>
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-200 p-4 text-center">
        <p>All rights reserved.</p>
      </footer>
    </div>
  );
}

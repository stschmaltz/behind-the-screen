import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import { ReactNode, useEffect } from 'react';
import { Layout } from './layout';

// List of paths that don't require authentication
const PUBLIC_PATHS = [
  '/',
  '/api/auth/login',
  '/api/auth/callback',
  '/api/auth/logout',

  '/login-required',
  '/domain-moved',
];

interface ProtectedLayoutProps {
  children: ReactNode;
}

export const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  const { user, isLoading } = useUser();
  const router = useRouter();

  const isPublicPath =
    PUBLIC_PATHS.includes(router.pathname) ||
    router.pathname.startsWith('/api/') ||
    router.pathname === '/404' ||
    router.pathname === '/_offline';

  useEffect(() => {
    // Only redirect if not loading, no user, and not on a public path
    if (!isLoading && !user && !isPublicPath) {
      // Redirect to login-required page with current path as returnTo
      router.replace(
        `/login-required?returnTo=${encodeURIComponent(router.asPath)}`,
      );
    }
  }, [isLoading, user, router, isPublicPath]);

  // If we're on a protected route and loading auth state or need to redirect
  if (!isPublicPath && (isLoading || (!user && !isLoading))) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      </Layout>
    );
  }

  // Either public path or authenticated user
  if (user && !user.email_verified) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Verify your email</h1>
          <p>
            Please verify your email address to continue. Check your inbox for a
            verification link.
          </p>
          <a href="/api/auth/logout" className="btn btn-primary mt-6">
            Log out
          </a>
        </div>
      </Layout>
    );
  }

  return <Layout>{children}</Layout>;
};

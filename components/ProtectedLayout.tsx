import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import { ReactNode, useEffect } from 'react';
import { Layout } from './layout';
import { isPublicPath as checkPublicPath } from '../lib/routes';

interface ProtectedLayoutProps {
  children: ReactNode;
}

export const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  const { user, isLoading } = useUser();
  const router = useRouter();

  const isPublicPath = checkPublicPath(router.pathname);

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
        <div
          className="flex items-center justify-center h-[calc(100vh-200px)]"
          role="status"
          aria-label="Loading"
        >
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      </Layout>
    );
  }

  return <Layout>{children}</Layout>;
};

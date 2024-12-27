import Link from 'next/link';

import Layout from '../components/layout';
import { useUserSignIn } from '../hooks/use-user-sign-in.hook';
import HomePage from '../components/pages/Home';

export default function Home() {
  const [isLoading, currentUser] = useUserSignIn();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Layout home>
      {/* Container replacement */}
      <div className="relative mt-5 p-0 w-full max-w-none">
        {currentUser ? (
          <>
            <Link
              href="/api/auth/logout?returnTo=http%3A%2F%2Flocalhost%3A3000"
              className="text-blue-600 hover:underline"
            >
              Logout
            </Link>
            <HomePage></HomePage>
          </>
        ) : (
          // Box replacement
          <div className="h-[80vh]">
            {/* Flex replacement */}
            <div className="flex h-full items-center justify-center">
              <Link href="/api/auth/login">
                <button className="btn btn-primary">Loginz</button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

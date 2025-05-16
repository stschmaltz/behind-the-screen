import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { LockClosedIcon } from '@heroicons/react/24/outline';

const LoginRequiredPage: NextPage = () => {
  const router = useRouter();
  const { returnTo } = router.query;

  // URL to redirect after login (get from query or default to home)
  const returnUrl = typeof returnTo === 'string' ? returnTo : '/';

  // URL for login with returnTo parameter
  const loginUrl = `/api/auth/login?returnTo=${encodeURIComponent(returnUrl)}`;

  return (
    <>
      <Head>
        <title>Login Required - DM Essentials</title>
        <meta
          name="description"
          content="Please log in to access this content"
          key="desc"
        />
      </Head>
      <div className="bg-base-100 min-h-[80vh] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-base-200 p-8 rounded-lg shadow-md flex flex-col items-center">
          <LockClosedIcon className="w-16 h-16 text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-4">Login Required</h1>

          <p className="text-center mb-6">
            The page you&apos;re trying to access requires you to be signed in.
            Please log in to continue.
          </p>

          <div className="flex flex-col w-full gap-3">
            <Link href={loginUrl} className="btn btn-primary w-full">
              Log In / Sign up
            </Link>

            <Link href="/" className="btn btn-outline w-full">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginRequiredPage;

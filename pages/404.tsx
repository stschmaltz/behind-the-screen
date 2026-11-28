import Link from 'next/link';
import { NextPage } from 'next';
import Head from 'next/head';

const Custom404: NextPage = () => {
  return (
    <>
      <Head>
        <title>Page Not Found | Encounter Manager</title>
      </Head>
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh] gap-4">
        <p
          className="reveal text-7xl font-extrabold text-primary"
          aria-hidden="true"
        >
          Nat 1
        </p>
        <h1
          className="reveal text-2xl font-bold"
          style={{ animationDelay: '70ms' }}
        >
          404 - Page not found
        </h1>
        <p
          className="reveal max-w-md text-base-content/70"
          style={{ animationDelay: '140ms' }}
        >
          You rolled a critical failure on your Investigation check. The page
          you&apos;re looking for doesn&apos;t exist.
        </p>
        <div
          className="reveal flex flex-wrap justify-center gap-3"
          style={{ animationDelay: '210ms' }}
        >
          <Link href="/" className="btn btn-primary">
            Go back home
          </Link>
          <Link href="/encounters" className="btn btn-ghost">
            Encounter Manager
          </Link>
        </div>
      </div>
    </>
  );
};

export default Custom404;

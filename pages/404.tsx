import Link from 'next/link';
import { NextPage } from 'next';

const Custom404: NextPage = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-8">
        Oops! The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/">
        <button className="btn btn-primary">Go Back Home</button>
      </Link>
    </div>
  );
};

export default Custom404;

import React from 'react';
import Head from 'next/head';

const NEW_DOMAIN = 'https://encountermanager.com';

export default function DomainMoved() {
  return (
    <>
      <Head>
        <title>Domain Moved</title>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
        <div className="card bg-base-100 shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-4 text-center">
            We&apos;ve Moved!
          </h1>
          <p className="mb-6 text-center text-lg">
            This site has moved to a new domain.
            <br />
            Please visit us at:
          </p>
          <a href={NEW_DOMAIN} className="btn btn-primary btn-lg">
            Go to encountermanager.com
          </a>
        </div>
      </div>
    </>
  );
}

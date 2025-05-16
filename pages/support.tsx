import { NextPage } from 'next';
import Head from 'next/head';
import { HeartIcon } from '@heroicons/react/24/outline';

const SupportPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Support DM Essentials</title>
        <meta
          name="description"
          content="Support the development of DM Essentials tools for Dungeon Masters."
          key="desc"
        />
      </Head>
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        <div className="max-w-2xl w-full text-center">
          <div className="flex items-center justify-center mb-6">
            <HeartIcon className="h-10 w-10 text-red-500 mr-2" />
            <h1 className="text-3xl font-bold">Support DM Essentials</h1>
          </div>

          <p className="mb-8 text-lg">
            DM Essentials is a free, open-source project created to help Game
            Masters run better tabletop RPG games. If you&apos;ve found these
            tools helpful and want to support continued development, you can buy
            me a coffee!
          </p>

          <p className="text-base mb-2 text-base-content/80">
            All donations are processed in USD.
          </p>

          <div className="my-8 p-4 border border-base-300 rounded-lg bg-base-200">
            <iframe
              id="kofiframe"
              src="https://ko-fi.com/devshane/?hidefeed=true&widget=true&embed=true"
              style={{
                border: 'none',
                width: '100%',
                maxWidth: '650px',
                margin: '0 auto',
                background: 'transparent',
              }}
              height="600"
              title="Support DM Essentials"
              allow="payment"
              loading="lazy"
            />
          </div>

          <div className="mt-8 text-lg">
            <h2 className="text-2xl font-semibold mb-4">
              Your support helps with:
            </h2>
            <ul className="list-disc text-left ml-8 mb-8">
              <li>Hosting and maintenance costs</li>
              <li>Developing new features</li>
              <li>Improving existing tools</li>
              <li>Quality time to continue building this solo project</li>
            </ul>

            <p>Thank you for your support and for using DM Essentials!</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupportPage;

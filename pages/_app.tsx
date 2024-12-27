import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Analytics } from '@vercel/analytics/react';

import '../styles/global.css';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { CurrentUserProvider } from '../context/UserContext';
import { usePWASetup } from '../hooks/use-pwa-setup.hook';
import { Layout } from '../components/layout';

export default function App({ Component, pageProps }: AppProps) {
  usePWASetup();

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />
      </Head>
      <UserProvider user={pageProps.user}>
        <CurrentUserProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </CurrentUserProvider>
      </UserProvider>
      <Analytics />
    </>
  );
}

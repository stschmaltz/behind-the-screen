import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

import '../styles/global.css';
import { AppProps } from 'next/app';
import Head from 'next/head';
import React, { ReactElement, ReactNode, useEffect } from 'react';
import { NextPage } from 'next';
import { CurrentUserProvider } from '../context/UserContext';
import { usePWASetup } from '../hooks/use-pwa-setup.hook';
import { Layout } from '../components/layout';
import { ActiveCampaignProvider } from '../context/ActiveCampaignContext';

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  usePWASetup();

  // Apply default theme on initial load
  useEffect(() => {
    const theme = localStorage.getItem('dme-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  const getLayout =
    Component.getLayout ??
    ((page) => (
      <UserProvider user={pageProps.user}>
        <CurrentUserProvider>
          <ActiveCampaignProvider>
            <Layout>{page}</Layout>
          </ActiveCampaignProvider>
        </CurrentUserProvider>
      </UserProvider>
    ));

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />
      </Head>
      {getLayout(<Component {...pageProps} />)}
      <Analytics />
      <SpeedInsights />
    </>
  );
}

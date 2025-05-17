import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { DefaultSeo } from 'next-seo';
import SEO from '../next-seo.config';

import '../styles/global.css';
import { AppProps } from 'next/app';
import Head from 'next/head';
import React, { ReactElement, ReactNode } from 'react';
import { NextPage } from 'next';
import { CurrentUserProvider } from '../context/UserContext';
import { usePWASetup } from '../hooks/use-pwa-setup.hook';
import { ProtectedLayout } from '../components/ProtectedLayout';
import { ActiveCampaignProvider } from '../context/ActiveCampaignContext';
import { ThemeProvider } from '../context/ThemeContext';
import { SpellsProvider } from '../context/SpellsContext';

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  usePWASetup();

  const defaultLayout = (page: ReactElement) => (
    <UserProvider user={pageProps.user}>
      <CurrentUserProvider>
        <ActiveCampaignProvider>
          <SpellsProvider>
            <ProtectedLayout>{page}</ProtectedLayout>
          </SpellsProvider>
        </ActiveCampaignProvider>
      </CurrentUserProvider>
    </UserProvider>
  );

  const getLayout = Component.getLayout ?? defaultLayout;

  return (
    <ThemeProvider>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />
      </Head>
      <DefaultSeo {...SEO} />
      {getLayout(<Component {...pageProps} />)}
      <Analytics />
      <SpeedInsights />
    </ThemeProvider>
  );
}

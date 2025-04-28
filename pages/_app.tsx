import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Analytics } from '@vercel/analytics/react';

import '../styles/global.css';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from 'next-themes';
import { ReactElement, ReactNode } from 'react';
import { NextPage } from 'next';
import { CurrentUserProvider } from '../context/UserContext';
import { usePWASetup } from '../hooks/use-pwa-setup.hook';
import { Layout } from '../components/layout';

// Define types for pages with custom layouts
type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  usePWASetup();

  // Use the layout defined at the page level, if available
  const getLayout =
    Component.getLayout ??
    ((page) => (
      <ThemeProvider>
        <UserProvider user={pageProps.user}>
          <CurrentUserProvider>
            <Layout>{page}</Layout>
          </CurrentUserProvider>
        </UserProvider>
      </ThemeProvider>
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
    </>
  );
}

import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { DefaultSeo } from 'next-seo';
import { AppProps } from 'next/app';
import Head from 'next/head';
import React, { ReactElement, ReactNode } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import SEO from '../next-seo.config';
import { CurrentUserProvider } from '../context/UserContext';
import { usePWASetup } from '../hooks/use-pwa-setup.hook';
import { ProtectedLayout } from '../components/ProtectedLayout';
import { ActiveCampaignProvider } from '../context/ActiveCampaignContext';
import { ThemeProvider } from '../context/ThemeContext';
import { SpellsProvider } from '../context/SpellsContext';
import { getCanonicalUrl, getRouteSeo, isIndexableRoute } from '../lib/seo';
import '../styles/global.css';

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  usePWASetup();
  const router = useRouter();
  const routeSeo = getRouteSeo(router.pathname);
  const indexable = isIndexableRoute(router.pathname);
  const canonical = indexable ? getCanonicalUrl(router.asPath) : undefined;

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
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>
      <DefaultSeo
        {...SEO}
        title={routeSeo?.title}
        description={routeSeo?.description ?? SEO.description}
        canonical={canonical}
        openGraph={{
          ...SEO.openGraph,
          url: canonical,
          title: routeSeo?.title ?? SEO.openGraph.title,
          description: routeSeo?.description ?? SEO.openGraph.description,
        }}
      />
      {!indexable && (
        <Head>
          <meta key="robots" name="robots" content="noindex,follow" />
        </Head>
      )}
      {getLayout(<Component {...pageProps} />)}
      <Analytics />
      <SpeedInsights />
    </ThemeProvider>
  );
}

import { Container } from '@chakra-ui/react';
import Head from 'next/head';
import { ReactNode } from 'react';
import styles from '../styles/layout.module.css';

export const siteTitle = 'shanefindsthestars.app';

export default function Layout(input: {
  children: ReactNode | undefined;
  home: boolean;
}) {
  const { children } = input;

  return (
    <Container maxW={'50rem'} minH={'100vh'}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="App to help organize exercises" />
        <meta
          property="og:image"
          content={`https://shanefindsthestars.app/images/profile.png`}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <header className={styles.header}></header>
      <main>{children}</main>
    </Container>
  );
}

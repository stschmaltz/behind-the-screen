import Document, { Head, Html, Main, NextScript } from 'next/document';
import { DocumentContext } from 'next/document';

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const page = await ctx.renderPage();
    const initialProps = await Document.getInitialProps(ctx);

    return { ...initialProps, ...page };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta name="application-name" content="Dungeon Master Essentials" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />
          <meta
            name="apple-mobile-web-app-title"
            content="Dungeon Master Essentials"
          />
          <meta
            name="description"
            content="Essential tools for dungeon masters to manage your tabletop RPG campaigns."
          />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta
            name="msapplication-config"
            content="/icons/browserconfig.xml"
          />
          <meta name="msapplication-TileColor" content="#2B5797" />
          <meta name="msapplication-tap-highlight" content="no" />
          <meta name="theme-color" content="#111111" />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/icons/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/icons/favicon-16x16.png"
          />
          <link rel="manifest" href="/manifest.json" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=optional"
          />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:url" content="https://encountermanager.com" />
          <meta name="twitter:title" content="Dungeon Master Essentials" />
          <meta
            name="twitter:description"
            content="Essential tools for dungeon masters to manage your tabletop RPG campaigns."
          />
          <meta
            name="twitter:image"
            content="https://encountermanager.com/images/profile.png"
          />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="encountermanager.com" />
          <meta
            property="og:description"
            content="Essential tools for dungeon masters to manage your tabletop RPG campaigns."
          />
          <meta property="og:site_name" content="Dungeon Master Essentials" />
          <meta property="og:url" content="https://encountermanager.com" />
          <meta
            property="og:image"
            content="https://encountermanager.com/images/profile.png"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

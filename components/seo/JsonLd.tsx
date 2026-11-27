import Head from 'next/head';

interface JsonLdProps {
  id: string;
  data: object;
}

export const JsonLd = ({ id, data }: JsonLdProps) => (
  <Head>
    <script
      key={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  </Head>
);

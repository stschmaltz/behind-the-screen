import { GetStaticProps, NextPage } from 'next';
import path from 'path';
import { promises as fs } from 'fs';

interface Props {
  html: string;
}

const PrivacyPage: NextPage<Props> = ({ html }) => (
  <div
    className="privacy-policy rounded-xl bg-white p-4 text-black md:p-8"
    dangerouslySetInnerHTML={{ __html: html }}
  />
);

export const getStaticProps: GetStaticProps<Props> = async () => {
  const html = await fs.readFile(
    path.join(process.cwd(), 'public', 'privacy-policy.html'),
    'utf8',
  );

  return { props: { html } };
};

export default PrivacyPage;

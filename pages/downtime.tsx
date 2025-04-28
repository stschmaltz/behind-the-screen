import { GetServerSideProps } from 'next';

// Simple component that won't actually render (due to redirect)
const DowntimePage = () => {
  return null;
};

// Server-side redirect to the static HTML page
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/api/downtime',
      permanent: false,
    },
  };
};

export default DowntimePage;

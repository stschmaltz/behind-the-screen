import { useRouter } from 'next/router';
import { NextPage } from 'next';

const EncounterPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <h1>Encounter Page</h1>
      <p>Encounter ID: {id}</p>
    </div>
  );
};

export default EncounterPage;

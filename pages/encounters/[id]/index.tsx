import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import EncounterContent from './EncounterContent';
import { getAllPlayers } from '../../../hooks/get-all-players.hook';
import { getEncounter } from '../../../hooks/encounter/get-encounter.hook';
import { EncounterProvider } from '../../../context/EncounterContext';

interface EncounterPageProps {
  initialEncounterId: string;
}

const LoadingState = () => (
  <div className="min-h-screen hero bg-base-200">
    <div className="hero-content text-center">
      <div className="max-w-md">
        <div className="loading loading-spinner loading-lg"></div>
        <p className="py-6">Loading encounter details...</p>
      </div>
    </div>
  </div>
);

const ErrorState = ({ id }: { id: string | string[] | undefined }) => (
  <div className="min-h-screen hero bg-base-200">
    <div className="hero-content text-center">
      <div className="max-w-md">
        <h1 className="text-5xl font-bold text-error">Encounter Not Found</h1>
        <p className="py-6">Could not find an encounter with ID: {id}</p>
        <button
          className="btn btn-primary"
          onClick={() => window.history.back()}
        >
          Go Back
        </button>
      </div>
    </div>
  </div>
);

const EncounterPage: NextPage<EncounterPageProps> = ({
  initialEncounterId,
}) => {
  const router = useRouter();
  const { id = initialEncounterId } = router.query;

  const { players: allPlayers, loading: playersLoading } = getAllPlayers();
  const { encounter, loading: encounterLoading } = getEncounter(
    typeof id === 'string' ? id : '',
  );

  if (encounterLoading || playersLoading) {
    return <LoadingState />;
  }

  if (!encounter) {
    return <ErrorState id={id} />;
  }

  return (
    <>
      <Head>
        <title>Encounter Details | Combat & Encounter Management</title>
        <meta
          name="description"
          content="View and manage detailed tabletop RPG encounters. Track combat, initiative, enemies, and players for D&D and other TTRPGs. Powerful encounter and combat management tools for Dungeon Masters."
        />
        <meta
          name="keywords"
          content="Encounter Details, Combat Management, Tabletop RPG, D&D, Initiative Tracker, Enemy Management, Player Management, RPG Tools, Dungeon Master, Combat Tracker"
        />
      </Head>
      <EncounterProvider initialEncounter={encounter}>
        <div className=" bg-base-200">
          <EncounterContent players={allPlayers} />
        </div>
      </EncounterProvider>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {};

  if (!id || typeof id !== 'string') {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      initialEncounterId: id,
    },
  };
};

export default EncounterPage;

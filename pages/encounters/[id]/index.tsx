import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { InactiveEncounterTable } from './InactiveEncounterTable';
import { getAllPlayers } from '../../../hooks/get-all-players.hook';
import { getEncounter } from '../../../hooks/get-encounter.hook';
import { Encounter } from '../../../types/encounters';
import { Player } from '../../../types/player';

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

const EncounterContent = ({
  encounter,
  players,
}: {
  encounter: Encounter;
  players: Player[];
}) => (
  <div className="container mx-auto px-4 py-8">
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h1 className="card-title text-3xl font-bold">{encounter.name}</h1>

        <div className="my-4">
          <div
            className={`badge badge-lg ${
              encounter.status === 'active'
                ? 'badge-primary'
                : 'badge-secondary'
            }`}
          >
            {encounter.status.charAt(0).toUpperCase() +
              encounter.status.slice(1)}
          </div>
        </div>

        <div className="overflow-x-auto">
          {encounter.status === 'active' ? (
            <div className="alert alert-info">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Active encounter view coming soon...</span>
            </div>
          ) : (
            <InactiveEncounterTable encounter={encounter} players={players} />
          )}
        </div>
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
    <div className="min-h-screen bg-base-200">
      <EncounterContent encounter={encounter} players={allPlayers} />
    </div>
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

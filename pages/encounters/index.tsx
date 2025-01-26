// pages/encounters/index.tsx
import Link from 'next/link';
import { NextPage } from 'next';
import { PlayerManagementSection } from './PlayerManagementSection';
import { getAllPlayers } from '../../hooks/get-all-players.hook';
import { getAllEncounters } from '../../hooks/get-all-encounters';

const EncountersPage: NextPage = () => {
  const { encounters, loading: encountersLoading } = getAllEncounters();
  const { players, loading: playersLoading } = getAllPlayers();

  const loadingState = (
    <div className="bg-base-100 flex items-center justify-center">
      <p>Loading...</p>
    </div>
  );

  const emptyState = (
    <div className="flex items-center justify-center text-base-content opacity-80">
      No encounters found
    </div>
  );
  const loading = encountersLoading || playersLoading;

  return (
    <div className="bg-base-100 min-h-screen p-4 flex flex-col items-center w-full max-w-2xl space-y-4 m-auto min-w-72">
      <h1 className="text-2xl font-bold mb-6">Encounters</h1>
      <div className="flex w-full justify-between items-center mb-8 max-w-md">
        <Link href="/encounters/new">
          <button className="btn btn-primary">New Encounter</button>
        </Link>
        <PlayerManagementSection startingPlayers={players ?? []} />
      </div>
      {loading && loadingState}
      {!loading &&
        (!encounters?.length ? (
          emptyState
        ) : (
          <div className="flex w-full flex-col gap-2">
            {encounters.map((encounter) => (
              <Link
                key={encounter._id.toString()}
                href={`/encounters/${encounter._id.toString()}`}
                className="block w-full"
              >
                <div className="p-4 bg-base-200 border border-base-300 rounded shadow-sm flex justify-between items-center hover:bg-base-300 transition-colors">
                  <div className="text-lg font-semibold">{encounter.name}</div>
                  <div className="text-sm opacity-80">
                    {encounter.createdAt.toLocaleString()}
                  </div>
                  <div
                    className={`badge ${
                      encounter.status === 'active'
                        ? 'badge-accent'
                        : 'badge-ghost'
                    }`}
                  >
                    {encounter.status === 'active' ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ))}
    </div>
  );
};

export default EncountersPage;

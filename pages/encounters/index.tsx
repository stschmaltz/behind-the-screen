// pages/encounters/index.tsx
import Link from 'next/link';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { Encounter } from '../../types/encounters';
import { asyncFetch } from '../../data/graphql/graphql-fetcher';
import {
  allEncountersQuery,
  AllEncountersResponse,
} from '../../data/graphql/snippets/encounter';

const EncountersPage: NextPage = () => {
  const [encounters, setEncounters] = useState<Encounter[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = (await asyncFetch(
          allEncountersQuery,
        )) as AllEncountersResponse;
        const sortedEncounters = data.allEncounters
          .map((encounter) => ({
            ...encounter,
            createdAt: new Date(encounter.createdAt),
          }))
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        setEncounters(sortedEncounters);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const emptyState = (
    <div className="flex items-center justify-center text-base-content opacity-80">
      No encounters found
    </div>
  );

  return (
    <div className="bg-base-100 min-h-screen p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Encounters</h1>

      <Link href="/encounters/new">
        <button className="btn btn-primary mb-8">New Encounter</button>
      </Link>

      {encounters.length === 0 && emptyState}

      {encounters.length > 0 && (
        <div className="w-full max-w-2xl space-y-4">
          {encounters.map((encounter) => (
            <Link
              key={encounter._id.toString()}
              href={`/encounters/${encounter._id.toString()}`}
              className="block"
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
      )}
    </div>
  );
};

export default EncountersPage;

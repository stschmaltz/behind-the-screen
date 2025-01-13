// pages/encounters/[id].tsx
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { asyncFetch } from '../../data/graphql/graphql-fetcher';
import {
  encounterByIdQuery,
  EncounterByIdResponse,
} from '../../data/graphql/snippets/encounter';
import { Encounter } from '../../types/encounters';

const EncounterPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const data = (await asyncFetch(encounterByIdQuery, {
          id: id,
        })) as EncounterByIdResponse;
        if (data && data.encounterById) {
          setEncounter({
            ...data.encounterById,
            createdAt: new Date(data.encounterById.createdAt),
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-base-100 min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!encounter) {
    return (
      <div className="bg-base-100 min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-xl font-bold mb-4">Encounter Not Found</h1>
        <p>Couldn’t find an encounter with ID: {id}</p>
      </div>
    );
  }

  return (
    <div className="bg-base-100 min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">{encounter.name}</h1>
      <p className="mb-2">
        <strong>Status:</strong>{' '}
        <span className="badge badge-accent">
          {encounter.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      </p>
      <p className="mb-2">
        <strong>Created At:</strong> {encounter.createdAt.toLocaleString()}
      </p>

      {encounter.description && (
        <p className="mb-4">
          <strong>Description:</strong> {encounter.description}
        </p>
      )}

      {encounter.notes && encounter.notes.length > 0 && (
        <div className="mb-4">
          <strong>Notes:</strong>
          <ul className="list-disc list-inside">
            {encounter.notes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {encounter.enemies && encounter.enemies.length > 0 && (
        <div className="mb-4">
          <strong>Enemies:</strong>
          <ul className="list-disc list-inside">
            {encounter.enemies.map((enemy, idx) => (
              <li key={idx}>
                {enemy.name} (HP: {enemy.currentHP}/{enemy.maxHP}, AC:{' '}
                {enemy.armorClass})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8"></div>
    </div>
  );
};

export default EncounterPage;

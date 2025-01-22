// pages/encounters/[id].tsx
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { asyncFetch } from '../../../data/graphql/graphql-fetcher';
import {
  encounterByIdQuery,
  EncounterByIdResponse,
} from '../../../data/graphql/snippets/encounter';
import { Encounter, EncounterCharacter } from '../../../types/encounters';
import { getEncounter } from '../../../hooks/get-encounter.hook';
import { getAllPlayers } from '../../../hooks/get-all-players.hook';
import { Player } from '../../../types/player';
import { init } from 'next/dist/compiled/webpack/webpack';
import InactiveEncounter from './InactiveEncounter';

type FullEncounter = Encounter & {
  players: Player[];
  characters: (Player | EncounterCharacter)[];
};

const EncounterPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { players: allPlayers, loading: playersLoading } = getAllPlayers();
  const { encounter, loading } = getEncounter(typeof id === 'string' ? id : '');
  const [fullEncounter, setFullEncounter] = useState<FullEncounter | null>(
    null,
  );

  useEffect(() => {
    if (encounter && allPlayers.length) {
      const playerIds = encounter.players.map((player) => player._id);
      const players = allPlayers.filter((player) =>
        playerIds.includes(player._id),
      );

      const encounterCharacters = [
        ...players,
        ...encounter.enemies,
        ...encounter.npcs,
      ];

      setFullEncounter({
        ...encounter,
        players,
        characters: encounterCharacters,
      });
    }
  }, [encounter, allPlayers]);

  if (loading || playersLoading || !fullEncounter) {
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

  console.log('fullEncounter', fullEncounter);
  return (
    <div className="bg-base-100 min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">{encounter.name}</h1>
      <div className="overflow-x-auto">
        {encounter.status === 'active' ? (
          <></>
        ) : (
          <InactiveEncounter
            encounter={{
              _id: encounter._id,
              characters: fullEncounter.characters.map((character) => {
                if ('armorClass' in character) {
                  return {
                    name: character.name,
                    armorClass: character.armorClass,
                    maxHP: character.maxHP,
                    currentHP: character.currentHP,
                  };
                }

                return {
                  name: character.name,
                };
              }),
            }}
          />
        )}
        <div className="mt-8"></div>
      </div>
    </div>
  );
};

export default EncounterPage;

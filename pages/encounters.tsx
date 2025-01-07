import Link from 'next/link';

import { NextPage } from 'next';
import { ObjectId } from 'mongodb';
import { Encounter } from '../types/encounters';

const EncountersPage: NextPage = () => {
  const encounters: Encounter[] = [
    {
      _id: new ObjectId(),
      name: 'Goblin Ambush',
      description: 'A group of goblins ambush the party.',
      notes: ['Goblins are hiding in the trees.'],
      enemies: [
        {
          name: 'Goblin 1',
          maxHP: 7,
          currentHP: 7,
          conditions: [],
          armorClass: 15,
        },
        {
          name: 'Goblin 2',
          maxHP: 7,
          currentHP: 7,
          conditions: [],
          armorClass: 15,
        },
      ],
      status: 'inactive',
      players: [{ _id: new ObjectId() }],
      npcs: [],
      initiativeOrder: [],
      currentRound: 0,
      currentTurn: 0,
      createdAt: new Date(),
    },
  ];

  return (
    <div className="flex h-full items-center justify-center flex-col">
      <div>Encounters</div>
      <Link href="/encounters/new">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          New Encounter
        </button>
      </Link>
      <ul className="list-disc">
        {encounters.map((encounter) => (
          <li key={encounter._id.toHexString()}>
            <Link href={`/encounters/${encounter._id.toHexString()}`}>
              <div className="flex justify-between">
                <div>{encounter.name}</div>
                <div>{encounter.createdAt.toDateString()}</div>
                <div>
                  {encounter.status === 'active' ? 'Active' : 'Inactive'}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EncountersPage;

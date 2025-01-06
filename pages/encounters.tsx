import Link from 'next/link';

import { NextPage } from 'next';

type Condition =
  | 'blinded'
  | 'charmed'
  | 'deafened'
  | 'frightened'
  | 'grappled'
  | 'incapacitated'
  | 'invisible'
  | 'paralyzed'
  | 'petrified'
  | 'poisoned'
  | 'prone'
  | 'restrained'
  | 'stunned'
  | 'unconscious';

interface EncounterCharacter {
  id: number;
  name: string;
  maxHP: number;
  currentHP: number;
  conditions: Condition[];
  armorClass: number;
}
interface Encounter {
  id: number;
  name: string;
  description?: string;
  notes: string[];
  enemies: EncounterCharacter[];
  status: 'active' | 'inactive';
  players: {
    id: number;
  }[];
  npcs: EncounterCharacter[];
  initiativeOrder: {
    characterId: number;
    initiative: number;
  }[];
  currentRound: number;
  currentTurn: number;
  createdAt: Date;
}
interface Player {
  id: number;
  name: string;
  conditions: Condition[];
  armorClass: number;
}

const EncountersPage: NextPage = () => {
  const encounters: Encounter[] = [
    {
      id: 1,
      name: 'Goblin Ambush',
      description: 'A group of goblins ambush the party.',
      notes: ['Goblins are hiding in the trees.'],
      enemies: [
        {
          id: 1,
          name: 'Goblin 1',
          maxHP: 7,
          currentHP: 7,
          conditions: [],
          armorClass: 15,
        },
        {
          id: 2,
          name: 'Goblin 2',
          maxHP: 7,
          currentHP: 7,
          conditions: [],
          armorClass: 15,
        },
      ],
      status: 'inactive',
      players: [{ id: 1 }],
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
          <li key={encounter.id}>
            <Link href={`/encounters/${encounter.id}`}>
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

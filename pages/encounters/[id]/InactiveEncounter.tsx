import React from 'react';
import { Encounter } from '../../../types/encounters';
import { Interface } from 'readline';
import FormInput from '../../../components/FormInput';
import InactiveEncounterCharacterRow from './InactiveEncounterCharacterRow';

interface InactiveEncounter {
  _id: string;
  characters: {
    name: string;
    armorClass?: number;
    maxHP?: number;
    currentHP?: number;
    initiative?: number;
  }[];
}

interface Props {
  encounter: InactiveEncounter;
}

const InactiveEncounter: React.FC<Props> = ({ encounter }) => {
  console.log(encounter.characters);
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Initiative</th>
          <th>HP</th>
          <th>AC</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {encounter.characters.map((character) => (
          <InactiveEncounterCharacterRow
            key={character.name}
            character={character}
          />
        ))}
      </tbody>
    </table>
  );
};

export default InactiveEncounter;

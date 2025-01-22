import React from 'react';
import FormInput from '../../../components/FormInput';

interface Props {
  character: {
    name: string;
    armorClass?: number;
    maxHP?: number;
    currentHP?: number;
    initiative?: number;
  };
}

const InactiveEncounterCharacterRow: React.FC<Props> = ({ character }) => {
  const [characterState, setCharacterState] = React.useState(character);
  return (
    <tr key={characterState.name}>
      <td>{characterState.name}</td>
      <td>
        <FormInput
          type="number"
          value={characterState.initiative}
          className="w-16"
          id="initiative"
          onChange={(character) => {
            setCharacterState({
              ...characterState,
              initiative: Number(character.target.value),
            });
          }}
        />
      </td>
      <td>
        <FormInput
          type="number"
          value={characterState.currentHP}
          className="w-16"
          id="currentHP"
          onChange={(character) => {
            setCharacterState({
              ...characterState,
              currentHP: Number(character.target.value),
            });
          }}
        />
        /
        <FormInput
          type="number"
          value={characterState.maxHP}
          className="w-16"
          id="maxHP"
          onChange={(character) => {
            setCharacterState({
              ...characterState,
              maxHP: Number(character.target.value),
            });
          }}
        />
      </td>
      <td>
        <FormInput
          type="number"
          value={characterState.armorClass}
          className="w-16"
          id="armorClass"
          onChange={(character) => {
            setCharacterState({
              ...characterState,
              armorClass: Number(character.target.value),
            });
          }}
        />
      </td>
      <td>
        <button className="btn">Remove</button>
      </td>
    </tr>
  );
};

export default InactiveEncounterCharacterRow;

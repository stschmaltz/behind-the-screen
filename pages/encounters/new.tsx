import { NextPage } from 'next';
import { useState } from 'react';
import {
  EncounterCharacter,
  NewEncounterTemplate,
} from '../../types/encounters';
import FormInput from '../../components/FormInput';

const NewEncounterPage: NextPage = () => {
  const [newEncounter, setNewEncounter] = useState<NewEncounterTemplate>({
    name: '',
    description: '',
    notes: [],
    enemies: [],
    status: 'inactive',
    createdAt: new Date(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEncounter((prev) => ({ ...prev, [name]: value }));
  };

  const handleNoteChange = (index: number, value: string) => {
    const updatedNotes = [...newEncounter.notes];
    updatedNotes[index] = value;
    setNewEncounter((prev) => ({ ...prev, notes: updatedNotes }));
  };

  const addNote = () => {
    setNewEncounter((prev) => ({ ...prev, notes: [...prev.notes, ''] }));
  };

  const removeNote = (index: number) => {
    const updatedNotes = newEncounter.notes.filter((_, i) => i !== index);
    setNewEncounter((prev) => ({ ...prev, notes: updatedNotes }));
  };

  const handleEnemyChange = (
    index: number,
    field: keyof EncounterCharacter,
    value: string | number,
  ) => {
    const updatedEnemies = [...newEncounter.enemies];
    updatedEnemies[index] = { ...updatedEnemies[index], [field]: value };
    setNewEncounter((prev) => ({ ...prev, enemies: updatedEnemies }));
  };

  const addEnemy = () => {
    setNewEncounter((prev) => ({
      ...prev,
      enemies: [
        ...prev.enemies,
        { name: '', maxHP: 0, currentHP: 0, conditions: [], armorClass: 0 },
      ],
    }));
  };

  const removeEnemy = (index: number) => {
    const updatedEnemies = newEncounter.enemies.filter((_, i) => i !== index);
    setNewEncounter((prev) => ({ ...prev, enemies: updatedEnemies }));
  };

  return (
    <div className="flex h-full items-center justify-center flex-col">
      <div>New Encounter</div>
      <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <FormInput
          id="name"
          label="Name"
          value={newEncounter.name}
          onChange={(e) => handleChange(e)}
        />
        <FormInput
          id="description"
          label="Description"
          value={newEncounter.description}
          onChange={(e) => handleChange(e)}
        />
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Notes
          </label>
          {newEncounter.notes.map((note, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                value={note}
                onChange={(e) => handleNoteChange(index, e.target.value)}
              />
              <button
                type="button"
                className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => removeNote(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={addNote}
          >
            Add Note
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Enemies
          </label>
          {newEncounter.enemies.map((enemy, index) => (
            <div key={index} className="mb-4 flex ">
              <FormInput
                id={`enemy-name-${index}`}
                label="Name"
                value={enemy.name}
                onChange={(e) =>
                  handleEnemyChange(index, 'name', e.target.value)
                }
              />
              <FormInput
                id={`enemy-maxHP-${index}`}
                label="Max HP"
                value={enemy.maxHP}
                onChange={(e) =>
                  handleEnemyChange(index, 'maxHP', Number(e.target.value))
                }
              />

              <FormInput
                id={`enemy-currentHP-${index}`}
                label="Current HP"
                type="number"
                value={enemy.currentHP}
                onChange={(e) =>
                  handleEnemyChange(index, 'currentHP', Number(e.target.value))
                }
              />
              <FormInput
                id={`enemy-armorClass-${index}`}
                label="Armor Class"
                type="number"
                value={enemy.armorClass}
                onChange={(e) =>
                  handleEnemyChange(index, 'armorClass', Number(e.target.value))
                }
              />
              <button
                type="button"
                className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => removeEnemy(index)}
              >
                Remove Enemy
              </button>
            </div>
          ))}
          <button
            type="button"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={addEnemy}
          >
            Add Enemy
          </button>
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={() => console.log(newEncounter)}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewEncounterPage;

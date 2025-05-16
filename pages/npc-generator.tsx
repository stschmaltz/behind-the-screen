import { NextPage } from 'next';
import { SetStateAction, useState } from 'react';
import { FormInput } from '../components/ui/FormInput';
import { Button } from '../components/ui/Button';

const sampleData = {
  alignments: ['Neutral', 'Good', 'Evil'],
  races: ['Human', 'Elf', 'Dwarf'],
  classes: ['Fighter', 'Wizard', 'Rogue'],
  genders: ['Male', 'Female', 'Other'],
  backgrounds: ['Commoner', 'Noble', 'Soldier'],
};

const initialText = 'Randomize';

const NpcGeneratorPage: NextPage = () => {
  const initialAlignment = 'Neutral';
  const initialRace = 'Human';
  const initialNpcClass = 'Fighter';
  const initialGender = 'Male';
  const initialBackground = 'Commoner';

  const [alignment, setAlignment] = useState(initialAlignment);
  const [race, setRace] = useState(initialRace);
  const [npcClass, setNpcClass] = useState(initialNpcClass);
  const [gender, setGender] = useState(initialGender);
  const [background, setBackground] = useState(initialBackground);
  const [npcName, setNpcName] = useState(initialText);
  const [npcDescription, setNpcDescription] = useState(initialText);
  const [npcFeatures, setNpcFeatures] = useState(initialText);

  const generateNPC = () => {
    console.log('NPC Generated');
  };

  const resetForm = () => {
    setAlignment(initialAlignment);
    setRace(initialRace);
    setNpcClass(initialNpcClass);
    setGender(initialGender);
    setBackground(initialBackground);
    setNpcName(initialText);
    setNpcDescription(initialText);
    setNpcFeatures(initialText);
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">NPC Generator</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 space-y-4 p-6 bg-base-100 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Create Your NPC
          </h2>
          <div className="form-control">
            <label className="label">Alignment</label>
            <select
              className="select select-bordered"
              value={alignment}
              onChange={(e) => setAlignment(e.target.value)}
            >
              {sampleData.alignments.map((alignment) => (
                <option key={alignment} value={alignment}>
                  {alignment}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label">Race</label>
            <select
              className="select select-bordered"
              value={race}
              onChange={(e) => setRace(e.target.value)}
            >
              {sampleData.races.map((race) => (
                <option key={race} value={race}>
                  {race}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label">Class</label>
            <select
              className="select select-bordered"
              value={npcClass}
              onChange={(e) => setNpcClass(e.target.value)}
            >
              {sampleData.classes.map((npcClass) => (
                <option key={npcClass} value={npcClass}>
                  {npcClass}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label">Gender</label>
            <select
              className="select select-bordered"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              {sampleData.genders.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label">Background</label>
            <select
              className="select select-bordered"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
            >
              {sampleData.backgrounds.map((background) => (
                <option key={background} value={background}>
                  {background}
                </option>
              ))}
            </select>
          </div>
          <FormInput
            id="npc-name"
            label="Name"
            value={npcName}
            placeholder={initialText}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setNpcName(e.target.value)
            }
          />
          <FormInput
            id="npc-description"
            label="Description"
            value={npcDescription}
            placeholder={initialText}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setNpcDescription(e.target.value)
            }
          />
          <FormInput
            id="npc-features"
            label="Distinguishing Features"
            value={npcFeatures}
            placeholder={initialText}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setNpcFeatures(e.target.value)
            }
          />
          <div className="flex space-x-4 mt-6">
            <Button
              label="Generate NPC"
              onClick={generateNPC}
              className="btn-primary flex-grow"
            />
            <Button
              label="Reset Form"
              onClick={resetForm}
              className="btn-outline flex-grow"
            />
          </div>
        </div>
        <div className="w-full md:w-1/2 space-y-2 p-6 bg-base-200 rounded-lg shadow-xl sticky top-8 self-start">
          <h2 className="text-2xl font-semibold mb-6 text-center border-b pb-2">
            NPC Preview
          </h2>
          <p>
            <strong>Name:</strong>{' '}
            {!npcName || npcName === initialText ? (
              <span className="italic text-gray-500">{initialText}</span>
            ) : (
              npcName
            )}
          </p>
          <p>
            <strong>Description:</strong>{' '}
            {!npcDescription || npcDescription === initialText ? (
              <span className="italic text-gray-500">{initialText}</span>
            ) : (
              npcDescription
            )}
          </p>
          <p>
            <strong>Distinguishing Features:</strong>{' '}
            {!npcFeatures || npcFeatures === initialText ? (
              <span className="italic text-gray-500">{initialText}</span>
            ) : (
              npcFeatures
            )}
          </p>
          <p className="pt-2 mt-2 border-t">
            <strong>Alignment:</strong> {alignment}
          </p>
          <p>
            <strong>Race:</strong> {race}
          </p>
          <p>
            <strong>Class:</strong> {npcClass}
          </p>
          <p>
            <strong>Gender:</strong> {gender}
          </p>
          <p>
            <strong>Background:</strong> {background}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NpcGeneratorPage;

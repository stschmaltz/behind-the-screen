import { NextPage } from 'next';
import { useState } from 'react';
import { Button } from '../components/Button';
import { FormInput } from '../components/FormInput';

const sampleData = {
  alignments: ['Neutral', 'Good', 'Evil'],
  races: ['Human', 'Elf', 'Dwarf'],
  classes: ['Fighter', 'Wizard', 'Rogue'],
  genders: ['Male', 'Female', 'Other'],
  backgrounds: ['Commoner', 'Noble', 'Soldier'],
};

const NpcGeneratorPage: NextPage = () => {
  const [alignment, setAlignment] = useState('Neutral');
  const [race, setRace] = useState('Human');
  const [npcClass, setNpcClass] = useState('Fighter');
  const [gender, setGender] = useState('Male');
  const [background, setBackground] = useState('Commoner');
  const [npcName, setNpcName] = useState('');
  const [npcAge, setNpcAge] = useState('');
  const [npcDescription, setNpcDescription] = useState('');
  const [npcHeight, setNpcHeight] = useState('');
  const [npcWeight, setNpcWeight] = useState('');
  const [npcFeatures, setNpcFeatures] = useState('');

  const generateNPC = () => {
    // Placeholder for generating NPC logic
    console.log('NPC Generated');
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">NPC Generator</h1>
      <div className="w-full max-w-md space-y-4">
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
          onChange={(e) => setNpcName(e.target.value)}
        />
        <FormInput
          id="npc-age"
          label="Age"
          value={npcAge}
          onChange={(e) => setNpcAge(e.target.value)}
        />
        <FormInput
          id="npc-description"
          label="Description"
          value={npcDescription}
          onChange={(e) => setNpcDescription(e.target.value)}
        />
        <FormInput
          id="npc-height"
          label="Height"
          value={npcHeight}
          onChange={(e) => setNpcHeight(e.target.value)}
        />
        <FormInput
          id="npc-weight"
          label="Weight"
          value={npcWeight}
          onChange={(e) => setNpcWeight(e.target.value)}
        />
        <FormInput
          id="npc-features"
          label="Distinguishing Features"
          value={npcFeatures}
          onChange={(e) => setNpcFeatures(e.target.value)}
        />
        <Button label="Generate NPC" onClick={generateNPC} />
      </div>
      <div className="mt-8 w-full max-w-md p-4 border rounded-md shadow-sm bg-base-200">
        <h2 className="text-xl font-semibold mb-4">NPC Preview</h2>
        <p><strong>Name:</strong> {npcName}</p>
        <p><strong>Age:</strong> {npcAge}</p>
        <p><strong>Description:</strong> {npcDescription}</p>
        <p><strong>Height:</strong> {npcHeight}</p>
        <p><strong>Weight:</strong> {npcWeight}</p>
        <p><strong>Distinguishing Features:</strong> {npcFeatures}</p>
        <p><strong>Alignment:</strong> {alignment}</p>
        <p><strong>Race:</strong> {race}</p>
        <p><strong>Class:</strong> {npcClass}</p>
        <p><strong>Gender:</strong> {gender}</p>
        <p><strong>Background:</strong> {background}</p>
      </div>
    </div>
  );
};

export default NpcGeneratorPage;

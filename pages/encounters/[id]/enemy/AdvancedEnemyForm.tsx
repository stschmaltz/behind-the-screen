import React from 'react';
import { FormInput } from '../../../../components/FormInput';
import { EncounterCharacter } from '../../../../types/encounters';

interface Props {
  enemy: EncounterCharacter;
  onEnemyChange: (enemy: EncounterCharacter) => void;
}

const AdvancedEnemyForm: React.FC<Props> = ({ enemy, onEnemyChange }) => {
  const handleManualChange = (
    field: keyof EncounterCharacter,
    value: string | number,
  ) => {
    onEnemyChange({
      ...enemy,
      [field]: field === 'name' ? value : value,
    });
  };

  const handleAbilityScoreChange = (
    ability: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA',
    value: number,
  ) => {
    if (!enemy.stats) {
      onEnemyChange({
        ...enemy,
        stats: {
          STR: ability === 'STR' ? value : 10,
          DEX: ability === 'DEX' ? value : 10,
          CON: ability === 'CON' ? value : 10,
          INT: ability === 'INT' ? value : 10,
          WIS: ability === 'WIS' ? value : 10,
          CHA: ability === 'CHA' ? value : 10,
        },
      });
    } else {
      onEnemyChange({
        ...enemy,
        stats: {
          ...enemy.stats,
          [ability]: value,
        },
      });
    }
  };

  return (
    <>
      <FormInput
        label="Type & Alignment"
        id="meta"
        value={enemy.meta || ''}
        onChange={(e) => handleManualChange('meta', e.target.value)}
        placeholder="e.g., Large undead, chaotic evil"
        className="mb-2"
      />

      <FormInput
        label="Speed"
        id="speed"
        value={enemy.speed || ''}
        onChange={(e) => handleManualChange('speed', e.target.value)}
        placeholder="e.g., 30 ft., fly 60 ft."
        className="mb-2"
      />

      <FormInput
        label="Challenge Rating"
        id="challenge"
        value={enemy.challenge || ''}
        onChange={(e) => handleManualChange('challenge', e.target.value)}
        placeholder="e.g., 5 (1,800 XP)"
        className="mb-2"
      />

      <label className="label">Ability Scores</label>
      <div className="grid grid-cols-3 gap-2 mb-2">
        <FormInput
          label="STR"
          id="str"
          type="number"
          value={enemy.stats?.STR || ''}
          onChange={(e) => {
            const value = Number(e.target.value);
            handleAbilityScoreChange('STR', value);
          }}
          className="w-full"
        />
        <FormInput
          label="DEX"
          id="dex"
          type="number"
          value={enemy.stats?.DEX || ''}
          onChange={(e) => {
            const value = Number(e.target.value);
            handleAbilityScoreChange('DEX', value);
          }}
          className="w-full"
        />
        <FormInput
          label="CON"
          id="con"
          type="number"
          value={enemy.stats?.CON || ''}
          onChange={(e) => {
            const value = Number(e.target.value);
            handleAbilityScoreChange('CON', value);
          }}
          className="w-full"
        />
        <FormInput
          label="INT"
          id="int"
          type="number"
          value={enemy.stats?.INT || ''}
          onChange={(e) => {
            const value = Number(e.target.value);
            handleAbilityScoreChange('INT', value);
          }}
          className="w-full"
        />
        <FormInput
          label="WIS"
          id="wis"
          type="number"
          value={enemy.stats?.WIS || ''}
          onChange={(e) => {
            const value = Number(e.target.value);
            handleAbilityScoreChange('WIS', value);
          }}
          className="w-full"
        />
        <FormInput
          label="CHA"
          id="cha"
          type="number"
          value={enemy.stats?.CHA || ''}
          onChange={(e) => {
            const value = Number(e.target.value);
            handleAbilityScoreChange('CHA', value);
          }}
          className="w-full"
        />
      </div>

      <FormInput
        label="Image URL"
        id="img_url"
        value={enemy.img_url || ''}
        onChange={(e) => handleManualChange('img_url', e.target.value)}
        placeholder="URL to monster image"
        className="mb-2"
      />

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Traits (HTML supported)</span>
        </label>
        <textarea
          id="traits"
          value={enemy.traits || ''}
          onChange={(e) => handleManualChange('traits', e.target.value)}
          placeholder="Special abilities and traits"
          className="textarea textarea-bordered h-24"
        />
      </div>

      <div className="form-control w-full mt-2">
        <label className="label">
          <span className="label-text">Actions (HTML supported)</span>
        </label>
        <textarea
          id="actions"
          value={enemy.actions || ''}
          onChange={(e) => handleManualChange('actions', e.target.value)}
          placeholder="Attack actions and abilities"
          className="textarea textarea-bordered h-24"
        />
      </div>

      <div className="form-control w-full mt-2">
        <label className="label">
          <span className="label-text">Legendary Actions (HTML supported)</span>
        </label>
        <textarea
          id="legendaryActions"
          value={enemy.legendaryActions || ''}
          onChange={(e) =>
            handleManualChange('legendaryActions', e.target.value)
          }
          placeholder="Legendary actions (if any)"
          className="textarea textarea-bordered h-24"
        />
      </div>
    </>
  );
};

export default AdvancedEnemyForm;

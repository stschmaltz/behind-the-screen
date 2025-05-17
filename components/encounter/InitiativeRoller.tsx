import React from 'react';
import DiceIcon from '../icons/DiceIcon';
import { getAbilityModifier, rollInitiative } from '../../lib/random';
import { InitiativeOrderCharacter } from '../../types/encounters';
import type { Player } from '../../src/generated/graphql';

type InitiativeRollerProps = {
  characters: InitiativeOrderCharacter[];
  type: 'player' | 'enemy';
  players?: Player[];
  onUpdateInitiative: (updated: InitiativeOrderCharacter[]) => void;
  disabled?: boolean;
  className?: string;
  getStatsForCharacter?: (characterId: string) => { DEX: number } | undefined;
};

const InitiativeRoller: React.FC<InitiativeRollerProps> = ({
  characters,
  type,
  players = [],
  onUpdateInitiative,
  disabled = false,
  className = '',
  getStatsForCharacter,
}) => {
  const targets = characters.filter((c) => c.type === type);
  const withoutInitiative = targets.filter((c) => c.initiative === undefined);

  const handleRoll = () => {
    const updated = characters.map((c) => {
      if (c.type !== type) return c;
      let modifier = 0;
      if (type === 'enemy' && getStatsForCharacter) {
        const stats = getStatsForCharacter(c._id);
        if (stats && typeof stats.DEX === 'number') {
          modifier = getAbilityModifier(stats.DEX);
        }
      }
      if (type === 'player') {
        const player = players.find((p) => p._id === c._id);
        if (player && typeof player.level === 'number') {
          modifier = 0;
        }
      }

      return {
        ...c,
        initiative: rollInitiative(modifier),
      };
    });
    onUpdateInitiative(updated);
  };

  if (targets.length === 0) return null;

  return (
    <button
      onClick={handleRoll}
      className={`btn btn-sm btn-ghost flex items-center gap-1 mt-1 ${className}`}
      title={`Roll initiative for all ${type === 'enemy' ? 'enemies' : 'players'}`}
      disabled={disabled}
    >
      <DiceIcon />
      {withoutInitiative.length > 0
        ? `Auto-roll ${type} initiative (${withoutInitiative.length})`
        : `Re-roll all ${type} initiatives`}
    </button>
  );
};

export default InitiativeRoller;

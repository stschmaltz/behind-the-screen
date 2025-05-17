import React from 'react';
import ActiveEncounterTableContent from './ActiveEncounterTableContent';
import type { Player } from '../../../../src/generated/graphql';
import { PopoverProvider } from '../../../../context/PopoverContext';

const ActiveEncounterTable: React.FC<{ players: Player[] }> = ({ players }) => {
  return (
    <PopoverProvider>
      <ActiveEncounterTableContent players={players} />
    </PopoverProvider>
  );
};

export default ActiveEncounterTable;

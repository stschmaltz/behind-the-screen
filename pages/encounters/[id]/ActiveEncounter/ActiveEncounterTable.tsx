import React from 'react';
import ActiveEncounterTableContent from './ActiveEncounterTableContent';
import type { Player } from '../../../../generated/graphql';

const ActiveEncounterTable: React.FC<{ players: Player[] }> = ({ players }) => {
  return <ActiveEncounterTableContent players={players} />;
};

export default ActiveEncounterTable;

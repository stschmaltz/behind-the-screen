import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Encounter } from '../types/encounters';

interface EncounterContextProps {
  encounter: Encounter;
  setEncounter: React.Dispatch<React.SetStateAction<Encounter>>;
  // You can add more functions here for updating characters, saving, etc.
}

const EncounterContext = createContext<EncounterContextProps | undefined>(
  undefined,
);

interface EncounterProviderProps {
  initialEncounter: Encounter;
  children: ReactNode;
}

export const EncounterProvider: React.FC<EncounterProviderProps> = ({
  initialEncounter,
  children,
}) => {
  const [encounter, setEncounter] = useState<Encounter>(initialEncounter);

  return (
    <EncounterContext.Provider value={{ encounter, setEncounter }}>
      {children}
    </EncounterContext.Provider>
  );
};

export const useEncounterContext = (): EncounterContextProps => {
  const context = useContext(EncounterContext);
  if (!context) {
    throw new Error(
      'useEncounterContext must be used within an EncounterProvider',
    );
  }

  return context;
};

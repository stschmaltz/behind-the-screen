import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Encounter, NewEncounterTemplate } from '../types/encounters';
import { useManageEncounter } from '../hooks/encounter/use-manage-encounter';

interface EncounterContextProps {
  encounter: Encounter;
  setEncounter: React.Dispatch<React.SetStateAction<Encounter>>;
  isSaving: boolean;
  handleSave: (encounter: Encounter | NewEncounterTemplate) => Promise<boolean>;
  deleteEncounter: (encounterId: string) => Promise<boolean>;
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
  const { handleSave, isSaving, deleteEncounter } = useManageEncounter();
  return (
    <EncounterContext.Provider
      value={{ handleSave, isSaving, encounter, setEncounter, deleteEncounter }}
    >
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

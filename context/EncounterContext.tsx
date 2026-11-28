import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { Encounter, NewEncounterTemplate } from '../types/encounters';
import {
  SaveOptions,
  SaveResult,
  useManageEncounter,
} from '../hooks/encounter/use-manage-encounter';

interface EncounterContextProps {
  encounter: Encounter;
  setEncounter: React.Dispatch<React.SetStateAction<Encounter>>;
  isSaving: boolean;
  handleSave: (
    encounter: Encounter | NewEncounterTemplate,
    options?: SaveOptions,
  ) => Promise<SaveResult>;
  deleteEncounter: (encounterId: string) => Promise<boolean>;
  updateEncounterDescription: (
    encounterId: string,
    newDescription: string,
  ) => Promise<void>;
  isDemo: boolean;
  onLeave?: () => void;
}

export interface EncounterStorage {
  save: (
    encounter: Encounter | NewEncounterTemplate,
  ) => Promise<{ success: boolean; errors?: string[] }>;
  remove: (encounterId: string) => Promise<boolean>;
  updateDescription: (
    encounterId: string,
    newDescription: string,
  ) => Promise<void>;
}

const EncounterContext = createContext<EncounterContextProps | null>(null);

interface EncounterProviderProps {
  initialEncounter: Encounter;
  children: ReactNode;
  storage?: EncounterStorage;
  isDemo?: boolean;
  onLeave?: () => void;
}

export const EncounterProvider: React.FC<EncounterProviderProps> = ({
  initialEncounter,
  children,
  storage,
  isDemo = false,
  onLeave,
}) => {
  const [encounter, setEncounter] = useState<Encounter>(initialEncounter);
  const manageEncounter = useManageEncounter();
  const originalHandleSave = storage?.save ?? manageEncounter.handleSave;
  const deleteEncounter = storage?.remove ?? manageEncounter.deleteEncounter;
  const originalUpdateDescription =
    storage?.updateDescription ?? manageEncounter.updateDescription;
  const isSaving = storage ? false : manageEncounter.isSaving;

  const handleSave = useCallback(
    (
      encounterToSave: Encounter | NewEncounterTemplate,
      options?: SaveOptions,
    ) => originalHandleSave(encounterToSave, options),
    [originalHandleSave],
  );

  const updateEncounterDescription = useCallback(
    async (encounterId: string, newDescription: string) => {
      setEncounter((prev) => ({ ...prev, description: newDescription }));
      try {
        await originalUpdateDescription(encounterId, newDescription);
      } catch (error) {
        setEncounter(initialEncounter);
        console.error('Failed to update description:', error);
        throw error;
      }
    },
    [originalUpdateDescription, initialEncounter],
  );

  const contextValue = useMemo(
    () => ({
      encounter,
      setEncounter,
      isSaving,
      handleSave,
      deleteEncounter,
      updateEncounterDescription,
      isDemo,
      onLeave,
    }),
    [
      encounter,
      setEncounter,
      isSaving,
      handleSave,
      deleteEncounter,
      updateEncounterDescription,
      isDemo,
      onLeave,
    ],
  );

  return (
    <EncounterContext.Provider value={contextValue}>
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

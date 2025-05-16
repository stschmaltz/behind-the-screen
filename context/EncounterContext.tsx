import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { Encounter, NewEncounterTemplate } from '../types/encounters';
import { useManageEncounter } from '../hooks/encounter/use-manage-encounter';

interface EncounterContextProps {
  encounter: Encounter;
  setEncounter: React.Dispatch<React.SetStateAction<Encounter>>;
  isSaving: boolean;
  handleSave: (
    encounter: Encounter | NewEncounterTemplate,
  ) => Promise<{ success: boolean; errors?: string[] }>;
  deleteEncounter: (encounterId: string) => Promise<boolean>;
  updateEncounterDescription: (
    encounterId: string,
    newDescription: string,
  ) => Promise<void>;
}

const EncounterContext = createContext<EncounterContextProps | null>(null);

interface EncounterProviderProps {
  initialEncounter: Encounter;
  children: ReactNode;
}

export const EncounterProvider: React.FC<EncounterProviderProps> = ({
  initialEncounter,
  children,
}) => {
  const [encounter, setEncounter] = useState<Encounter>(initialEncounter);
  const {
    handleSave: originalHandleSave,
    isSaving,
    deleteEncounter,
    updateDescription: originalUpdateDescription,
  } = useManageEncounter();

  const handleSave = useCallback(
    (encounterToSave: Encounter | NewEncounterTemplate) =>
      originalHandleSave(encounterToSave),
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
    }),
    [
      encounter,
      setEncounter,
      isSaving,
      handleSave,
      deleteEncounter,
      updateEncounterDescription,
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

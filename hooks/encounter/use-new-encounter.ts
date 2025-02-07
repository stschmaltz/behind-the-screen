import { ChangeEvent, useState } from 'react';
import { INITIAL_NEW_ENCOUNTER } from '../../pages/encounters/new';
import { NewEncounterTemplate } from '../../types/encounters';
import { useSaveEncounter } from './use-save-encounter';

export const useNewEncounter = () => {
  const [newEncounter, setNewEncounter] = useState<NewEncounterTemplate>(
    INITIAL_NEW_ENCOUNTER,
  );

  const handleFieldChange =
    (field: keyof NewEncounterTemplate) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setNewEncounter((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const { isSaving, handleSave } = useSaveEncounter();

  return {
    newEncounter,
    setNewEncounter,
    isSaving,
    handleFieldChange,
    handleSave,
  };
};

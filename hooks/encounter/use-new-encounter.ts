import { ChangeEvent, useState } from 'react';
import { INITIAL_NEW_ENCOUNTER } from '../../pages/encounters/new';
import { NewEncounterTemplate } from '../../types/encounters';
import { useManageEncounter } from './use-manage-encounter';

export const useNewEncounter = () => {
  const [newEncounter, setNewEncounter] = useState<NewEncounterTemplate>(
    INITIAL_NEW_ENCOUNTER,
  );

  const handleFieldChange =
    (field: keyof NewEncounterTemplate) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setNewEncounter((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return {
    newEncounter,
    setNewEncounter,
    handleFieldChange,
  };
};

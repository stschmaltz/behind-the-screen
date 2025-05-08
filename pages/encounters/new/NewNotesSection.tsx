import React, { ChangeEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { FormInput } from '../../../components/ui/FormInput';

interface NewNotesSectionProps {
  notes: string[];
  onNotesChange: (updatedNotes: string[]) => void;
}

const NewNotesSection: React.FC<NewNotesSectionProps> = ({
  notes,
  onNotesChange,
}) => {
  const handleNoteChange = (index: number, value: string) => {
    const updatedNotes = [...notes];
    updatedNotes[index] = value;
    onNotesChange(updatedNotes);
  };

  const addNote = () => {
    onNotesChange([...notes, '']);
  };

  const removeNote = (index: number) => {
    onNotesChange(notes.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-4">
      <label className="label">Notes</label>
      {notes.map((note, index) => (
        <div key={index} className="mb-2 flex items-center gap-2">
          <FormInput
            id={`note-${index}`}
            type="text"
            value={note}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleNoteChange(index, e.target.value)
            }
          />
          <Button
            variant="error"
            label="Remove"
            className="btn-sm"
            onClick={() => removeNote(index)}
          />
        </div>
      ))}

      <Button
        variant="secondary"
        label="Add Note"
        className="btn-sm"
        onClick={addNote}
      />
    </div>
  );
};

export default NewNotesSection;

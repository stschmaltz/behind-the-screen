import React from 'react';

interface RenameEncounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newName: string) => void;
  currentName: string | undefined;
  isSaving: boolean;
}

const RenameEncounterModal = ({
  isOpen,
  onClose,
  onConfirm,
  currentName,
  isSaving,
}: RenameEncounterModalProps) => {
  const [newName, setNewName] = React.useState(currentName || '');

  // Update internal state if currentName prop changes (e.g., opening modal for different item)
  React.useEffect(() => {
    setNewName(currentName || '');
  }, [currentName]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (newName.trim()) {
      onConfirm(newName.trim());
    }
  };

  return (
    <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Rename Encounter</h3>
        <p className="pt-4 pb-2">Enter a new name for the encounter.</p>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="input input-bordered w-full mb-4"
          placeholder="New Encounter Name"
          required
          autoFocus
        />
        <div className="modal-action">
          <button className="btn" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={
              isSaving || !newName.trim() || newName.trim() === currentName
            }
          >
            {isSaving ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              'Save Name'
            )}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose} disabled={isSaving}>
          close
        </button>
      </form>
    </dialog>
  );
};

export default RenameEncounterModal;

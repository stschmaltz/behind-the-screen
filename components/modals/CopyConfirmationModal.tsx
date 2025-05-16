import React from 'react';

interface CopyConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  encounterName: string | undefined;
  newEncounterName: string;
  setNewEncounterName: (name: string) => void;
  isSaving: boolean;
}

const CopyConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  encounterName,
  newEncounterName,
  setNewEncounterName,
  isSaving,
}: CopyConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Re-create Encounter</h3>
        <p className="pt-4 pb-2">
          Enter a name for the new inactive encounter.
        </p>
        <input
          type="text"
          value={newEncounterName}
          onChange={(e) => setNewEncounterName(e.target.value)}
          className="input input-bordered w-full mb-4"
          placeholder="New Encounter Name"
          required
          autoFocus
        />
        <p className="text-sm opacity-80 pb-4">
          Enemies from &quot;{encounterName}&quot; will be copied, but players
          will not.
        </p>
        <div className="modal-action">
          <button className="btn" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={isSaving || !newEncounterName.trim()}
          >
            {isSaving ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              'Confirm Re-create'
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

export default CopyConfirmationModal;

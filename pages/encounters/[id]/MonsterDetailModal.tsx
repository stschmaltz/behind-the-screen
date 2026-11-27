import React, { useEffect, useRef } from 'react';
import { EncounterCharacter } from '../../../types/encounters';
import CloseButton from '../../../components/ui/CloseButton';
import MonsterStatBlock from '../../../components/encounter/MonsterStatBlock';

interface Props {
  monster?: EncounterCharacter;
  isOpen: boolean;
  onClose: () => void;
}

const MonsterDetailModal: React.FC<Props> = ({ monster, isOpen, onClose }) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const modalElement = modalRef.current;
    if (modalElement) {
      if (isOpen) {
        modalElement.showModal();
      } else {
        modalElement.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const modalElement = modalRef.current;
    const handleDialogClose = () => {
      if (isOpen) {
        onClose();
      }
    };
    modalElement?.addEventListener('close', handleDialogClose);

    return () => modalElement?.removeEventListener('close', handleDialogClose);
  }, [isOpen, onClose]);

  if (!monster) return null;

  return (
    <dialog className="modal" ref={modalRef}>
      <div className="modal-box max-w-4xl">
        <CloseButton onClick={onClose} />
        {isOpen && <MonsterStatBlock monster={monster} />}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default MonsterDetailModal;

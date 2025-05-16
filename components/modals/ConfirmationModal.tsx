import React from 'react';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isProcessing,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isProcessing?: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4 whitespace-pre-wrap">{message}</p>
        <div className="modal-action">
          <button className="btn" onClick={onClose} disabled={isProcessing}>
            Cancel
          </button>
          <button
            className="btn btn-error"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              'Confirm Delete'
            )}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose} disabled={isProcessing}>
          close
        </button>
      </form>
    </dialog>
  );
};

export default ConfirmationModal;

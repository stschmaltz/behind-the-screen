import React, { useEffect, useRef } from 'react';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isProcessing,
  confirmLabel = 'Confirm Delete',
  confirmClassName = 'btn-error',
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isProcessing?: boolean;
  confirmLabel?: string;
  confirmClassName?: string;
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    if (!dialog.open) dialog.showModal?.();

    return () => {
      if (dialog.open) dialog.close?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-open"
      onCancel={(event) => {
        event.preventDefault();
        if (!isProcessing) onClose();
      }}
    >
      <div className="modal-box slide-up shadow-2xl">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4 whitespace-pre-wrap">{message}</p>
        <div className="modal-action">
          <button
            className="btn hover:scale-105 transition-all duration-200 active:scale-95"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            className={`btn ${confirmClassName} hover:scale-105 transition-all duration-200 active:scale-95`}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop fade-in">
        <button onClick={onClose} disabled={isProcessing}>
          close
        </button>
      </form>
    </dialog>
  );
};

export default ConfirmationModal;

import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import ConfirmationModal from '../ConfirmationModal';

const renderModal = (props: { isProcessing?: boolean } = {}) => {
  const onClose = jest.fn();
  render(
    <ConfirmationModal
      isOpen
      onClose={onClose}
      onConfirm={jest.fn()}
      title="Finish Encounter?"
      message="This ends combat."
      {...props}
    />,
  );
  const dialog = document.querySelector('dialog') as HTMLDialogElement;

  return { onClose, dialog };
};

describe('ConfirmationModal', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = jest.fn();
    HTMLDialogElement.prototype.close = jest.fn();
  });

  it('opens as a native modal so focus is trapped inside it', () => {
    renderModal();

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
  });

  it('treats Escape as cancel', () => {
    const { onClose, dialog } = renderModal();

    fireEvent(dialog, new Event('cancel', { cancelable: true }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cannot be dismissed while the action is running', () => {
    const { onClose, dialog } = renderModal({ isProcessing: true });
    const cancel = new Event('cancel', { cancelable: true });

    fireEvent(dialog, cancel);

    expect(onClose).not.toHaveBeenCalled();
    expect(cancel.defaultPrevented).toBe(true);
  });
});

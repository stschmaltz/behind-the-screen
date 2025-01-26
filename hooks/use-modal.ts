export const useModal = (modalId: string) => {
  const showModal = () => {
    (document.getElementById(modalId) as HTMLDialogElement)?.showModal();
  };

  const closeModal = () => {
    (document.getElementById(modalId) as HTMLDialogElement)?.close();
  };

  return { showModal, closeModal };
};

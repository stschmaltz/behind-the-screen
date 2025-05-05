import { useState } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';

interface KofiButtonProps {
  text?: string;
  buttonClassName?: string;
  modalSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const KofiButton: React.FC<KofiButtonProps> = ({
  text = 'Support Project',
  buttonClassName = 'btn btn-primary',
  modalSize = 'lg',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Use a slightly modified Ko-fi URL with reduced parameters
  const kofiUrl =
    'https://ko-fi.com/devshane/?hidefeed=true&widget=true&embed=true';

  return (
    <>
      <button
        className={`${buttonClassName} flex items-center gap-2`}
        onClick={openModal}
        type="button"
        aria-label={text}
      >
        <HeartIcon className="h-5 w-5" />
        {text}
      </button>

      {isModalOpen && (
        <div className="modal modal-open">
          <div className={`modal-box max-w-${modalSize} bg-base-100`}>
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={closeModal}
              type="button"
              aria-label="Close"
            >
              ✕
            </button>
            <h3 className="font-bold text-lg mb-4 text-center">
              Support DM Essentials
            </h3>

            <p className="text-center text-sm mb-4">
              All donations are in USD. Thank you for your support!
            </p>

            <div className="w-full flex justify-center mb-4">
              <iframe
                id="kofiframe-inline"
                src={kofiUrl}
                style={{
                  border: 'none',
                  width: '100%',
                  height: '560px',
                  background: 'transparent',
                }}
                title="Support DM Essentials"
                allow="payment"
                loading="lazy"
              />
            </div>

            <div className="modal-action">
              <button className="btn" onClick={closeModal} type="button">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

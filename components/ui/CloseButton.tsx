import React from 'react';

interface CloseButtonProps {
  onClick: () => void;
  className?: string;
}

const CloseButton: React.FC<CloseButtonProps> = ({
  onClick,
  className = '',
}) => (
  <div className={`sticky top-2 right-2 z-20 flex justify-end ${className}`}>
    <button
      className="btn btn-sm btn-circle btn-ghost flex items-center gap-1"
      onClick={onClick}
      type="button"
      aria-label="Close"
    >
      ✕ <span className="text-base font-medium">Close</span>
    </button>
  </div>
);

export default CloseButton;

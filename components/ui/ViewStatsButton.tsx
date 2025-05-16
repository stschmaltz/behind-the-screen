import React from 'react';

type ViewStatsButtonProps = {
  onClick?: () => void;
  className?: string;
};

const ViewStatsButton: React.FC<ViewStatsButtonProps> = ({
  onClick,
  className,
}) => (
  <button
    onClick={onClick}
    className={`btn btn-ghost btn-xs text-info p-0 h-auto justify-start hover:bg-transparent ${className ?? ''}`.trim()}
    aria-label="View Stats"
    type="button"
  >
    View Stats
  </button>
);

export default ViewStatsButton;

import React from 'react';

interface DiceIconProps {
  className?: string;
}

const DiceIcon: React.FC<DiceIconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.25 6.087c-.495.201-.874.594-1.034 1.07l-2.466 7.398a2.25 2.25 0 01-1.213 1.376l-3.75 1.5a2.25 2.25 0 01-2.874-2.874l1.5-3.75a2.25 2.25 0 011.376-1.213l7.398-2.466c.476-.16.869-.539 1.07-1.034a2.25 2.25 0 013.636 0c.201.495.594.874 1.07 1.034l7.398 2.466a2.25 2.25 0 011.376 1.213l1.5 3.75a2.25 2.25 0 01-2.874 2.874l-3.75-1.5a2.25 2.25 0 01-1.213-1.376l-2.466-7.398c-.16-.476-.539-.869-1.034-1.07a2.25 2.25 0 00-3.636 0z"
      />
    </svg>
  );
};

export default DiceIcon;

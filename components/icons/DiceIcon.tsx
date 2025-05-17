import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

const DiceIcon: React.FC<IconProps> = (props) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
    <circle cx="8" cy="8" r="1"></circle>
    <circle cx="16" cy="8" r="1"></circle>
    <circle cx="8" cy="16" r="1"></circle>
    <circle cx="16" cy="16" r="1"></circle>
    <circle cx="12" cy="12" r="1"></circle>
  </svg>
);

export default DiceIcon;

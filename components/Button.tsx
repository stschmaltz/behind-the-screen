import React from 'react';

interface ButtonProps {
  label: string;
  variant?:
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'info'
    | 'success'
    | 'warning'
    | 'error';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  tooltip?: string;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  tooltip,
  loading,
}) => {
  const variantClassesMap: Record<
    NonNullable<ButtonProps['variant']>,
    string
  > = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
    info: 'btn-info',
    success: 'btn-success',
    warning: 'btn-warning',
    error: 'btn-error',
  };

  const variantClasses = `btn ${variantClassesMap[variant] || 'btn-primary'}`;

  return (
    <div className={`${!!tooltip && tooltip}`} data-tip={tooltip}>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${variantClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {loading ? (
          <span className="loading loading-spinner loading-xs" />
        ) : (
          label
        )}
      </button>
    </div>
  );
};

export { Button };

import React from 'react';

interface ButtonProps {
  label?: string;
  icon?: React.ReactNode;
  variant?:
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'info'
    | 'success'
    | 'warning'
    | 'error';
  onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  tooltip?: string;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = React.memo(
  ({
    label,
    icon,
    variant = 'primary',
    onClick,
    type = 'button',
    disabled = false,
    className = '',
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

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(event);
      }
    };

    return (
      <button
        type={type}
        onClick={handleClick}
        disabled={disabled}
        className={`${variantClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {loading ? (
          <span className="loading loading-spinner loading-xs" />
        ) : icon ? (
          icon
        ) : (
          label
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };

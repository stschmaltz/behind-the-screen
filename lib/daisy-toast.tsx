import { toast } from 'react-toastify';

export function showDaisyToast(
  type: 'success' | 'error' | 'info',
  message: string,
) {
  const className = {
    success: 'alert-success',
    error: 'alert-error',
    info: 'alert-info',
  }[type];

  toast(message, {
    className: `${className} alert shadow-lg`,
    ariaLabel: message,
    position: 'top-center',
  });
}

import { toast } from 'react-toastify';

export function showDaisyToast(
  type: 'success' | 'error' | 'info',
  message: string,
) {
  const alertClass = {
    success: 'alert-success',
    error: 'alert-error',
    info: 'alert-info',
  }[type];

  toast(
    <div className="toast toast-top toast-center w-full max-w-xs justify-center">
      <div className={`alert ${alertClass} flex items-center w-full shadow-lg`}>
        <span className="text-base font-medium">{message}</span>
      </div>
    </div>,
    {
      position: 'top-center',
      closeOnClick: true,
      hideProgressBar: false,
      autoClose: 4000,
      draggable: false,
      pauseOnHover: true,
      style: {
        background: 'transparent',
        boxShadow: 'none',
        padding: 0,
        minHeight: 0,
        width: '100%',
        maxWidth: '20rem',
        margin: '0 auto',
        zIndex: 9999,
      },
    },
  );
}

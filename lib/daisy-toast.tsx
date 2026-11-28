import React from 'react';
import { toast } from 'react-toastify';

type ToastType = 'success' | 'error' | 'info';

interface DaisyToastOptions {
  replaceId?: string;
  duration?: number;
}

const DEFAULT_DURATION = 4000;

const ALERT_CLASSES: Record<ToastType, string> = {
  success: 'alert-success',
  error: 'alert-error',
  info: 'alert-info',
};

interface ReplaceableToast {
  content: React.ReactNode;
  duration: number;
}

const latestReplaceable = new Map<string, ReplaceableToast>();

const showLatest = (replaceId: string, shownContent: React.ReactNode) => {
  const latest = latestReplaceable.get(replaceId);
  if (!latest || latest.content === shownContent) return;

  toast.update(replaceId, {
    render: latest.content,
    autoClose: latest.duration,
  });
};

export function showDaisyToast(
  type: ToastType,
  message: string,
  { replaceId, duration = DEFAULT_DURATION }: DaisyToastOptions = {},
) {
  const content = (
    <div className="toast toast-top toast-center w-full max-w-xs justify-center">
      <div
        className={`alert ${ALERT_CLASSES[type]} flex items-center w-full shadow-lg`}
      >
        <span className="text-base font-medium">{message}</span>
      </div>
    </div>
  );

  if (replaceId) {
    latestReplaceable.set(replaceId, { content, duration });
    if (toast.isActive(replaceId)) {
      toast.update(replaceId, { render: content, autoClose: duration });

      return;
    }
  }

  toast(content, {
    toastId: replaceId,
    onOpen: replaceId ? () => showLatest(replaceId, content) : undefined,
    position: 'top-center',
    closeOnClick: true,
    hideProgressBar: false,
    autoClose: duration,
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
  });
}

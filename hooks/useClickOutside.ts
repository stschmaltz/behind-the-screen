import { useEffect, RefObject } from 'react';

/**
 * Options for the useClickOutside hook
 */
interface UseClickOutsideOptions {
  /** Whether the hook is enabled */
  enabled?: boolean;
  /** Optional parent dialog element to listen for close events */
  parentDialog?: HTMLDialogElement | null;
  /** Callback when dialog closes */
  onDialogClose?: () => void;
}

/**
 * Hook to detect clicks outside of a referenced element
 * Also handles parent dialog close events
 *
 * @param ref - Ref to the element to detect clicks outside of
 * @param callback - Function to call when click outside is detected
 * @param options - Optional configuration
 */
export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  callback: () => void,
  options: UseClickOutsideOptions = {},
): void => {
  const { enabled = true, parentDialog, onDialogClose } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback, enabled]);

  useEffect(() => {
    if (!enabled || !parentDialog) return;

    const handleDialogClose = () => {
      onDialogClose?.();
      callback();
    };

    parentDialog.addEventListener('close', handleDialogClose);

    return () => {
      parentDialog.removeEventListener('close', handleDialogClose);
    };
  }, [parentDialog, callback, onDialogClose, enabled]);
};

/**
 * Helper function to find the parent dialog element
 * @param element - Starting element to search from
 * @returns The parent dialog element or null
 */
export const findParentDialog = (
  element: HTMLElement | null,
): HTMLDialogElement | null => {
  let parent = element?.parentElement;
  while (parent) {
    if (parent.tagName === 'DIALOG') {
      return parent as HTMLDialogElement;
    }
    parent = parent.parentElement;
  }
  return null;
};

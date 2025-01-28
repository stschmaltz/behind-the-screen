import { useEffect } from 'react';
import { useRouter } from 'next/router';

export const useUnsavedChangesWarning = (hasUnsavedChanges: boolean) => {
  const router = useRouter();

  useEffect(() => {
    const warningText =
      'You have unsaved changes - are you sure you want to leave?';

    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      return (e.returnValue = warningText);
    };

    const handleBrowseAway = (url: string) => {
      if (!hasUnsavedChanges) return;
      if (window.confirm(warningText)) return;
      router.events.emit('routeChangeError');
      throw 'routeChange aborted.';
    };

    window.addEventListener('beforeunload', handleWindowClose);
    router.events.on('routeChangeStart', handleBrowseAway);

    return () => {
      window.removeEventListener('beforeunload', handleWindowClose);
      router.events.off('routeChangeStart', handleBrowseAway);
    };
  }, [hasUnsavedChanges, router]);
};

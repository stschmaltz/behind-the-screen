import { useEffect } from 'react';
import { logger } from '../lib/logger';

function usePWASetup() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox;

      const promptNewVersionAvailable = (_event: unknown) => {
        if (
          confirm(
            'A newer version of this web app is available, reload to update?',
          )
        ) {
          wb.addEventListener('controlling', (_event: unknown) => {
            window.location.reload();
          });

          wb.messageSkipWaiting();
        } else {
          logger.info(
            'User rejected to reload the web app, keep using old version. New version will be automatically load when user open the app next time.',
          );
        }
      };

      wb.addEventListener('waiting', promptNewVersionAvailable);

      wb.register();
    }
  }, []);
}

export { usePWASetup };

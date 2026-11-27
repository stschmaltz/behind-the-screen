import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';

const SESSION_HINT_KEY = 'dme-signed-in';

export function useAuthedQueriesEnabled(): boolean {
  const { user, isLoading } = useUser();
  const [hasSessionHint, setHasSessionHint] = useState(false);

  useEffect(() => {
    try {
      setHasSessionHint(localStorage.getItem(SESSION_HINT_KEY) === '1');
    } catch {
      setHasSessionHint(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    try {
      if (user) {
        localStorage.setItem(SESSION_HINT_KEY, '1');
      } else {
        localStorage.removeItem(SESSION_HINT_KEY);
      }
    } catch {
      return;
    }
  }, [user, isLoading]);

  return Boolean(user) || (isLoading && hasSessionHint);
}

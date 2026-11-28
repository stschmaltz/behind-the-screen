import { useEffect, useState } from 'react';

function useLocalStorage<T>(key: string, fallbackValue: T) {
  const [value, setValue] = useState<T>(fallbackValue);
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) setValue(JSON.parse(stored) as T);
    } catch {}
    setHydratedKey(key);
  }, [key]);

  useEffect(() => {
    if (hydratedKey !== key) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value, hydratedKey]);

  return [value, setValue] as const;
}

export { useLocalStorage };

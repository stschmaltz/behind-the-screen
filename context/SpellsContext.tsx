import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Spell } from '../types/spells';

interface SpellsContextType {
  spells: Spell[] | null;
  isLoading: boolean;
  error: string | null;
  ensureLoaded: () => void;
}

const SpellsContext = createContext<SpellsContextType | undefined>(undefined);

export const SpellsProvider = ({ children }: { children: ReactNode }) => {
  const [spells, setSpells] = useState<Spell[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasRequested = useRef(false);

  const ensureLoaded = useCallback(() => {
    if (hasRequested.current) return;
    hasRequested.current = true;
    setIsLoading(true);
    fetch('/api/spells')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load spells');

        return res.json();
      })
      .then((data) => {
        setSpells(data);
        setIsLoading(false);
      })
      .catch(() => {
        hasRequested.current = false;
        setError('Failed to load spells');
        setIsLoading(false);
      });
  }, []);

  const value = useMemo(
    () => ({ spells, isLoading, error, ensureLoaded }),
    [spells, isLoading, error, ensureLoaded],
  );

  return (
    <SpellsContext.Provider value={value}>{children}</SpellsContext.Provider>
  );
};

export const useSpells = () => {
  const context = useContext(SpellsContext);
  if (!context) {
    throw new Error('useSpells must be used within a SpellsProvider');
  }
  const { ensureLoaded } = context;

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  return context;
};

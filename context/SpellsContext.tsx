import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Spell } from '../types/spells';

interface SpellsContextType {
  spells: Spell[] | null;
  isLoading: boolean;
  error: string | null;
}

const SpellsContext = createContext<SpellsContextType | undefined>(undefined);

export const SpellsProvider = ({ children }: { children: ReactNode }) => {
  const [spells, setSpells] = useState<Spell[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/spells')
      .then((res) => res.json())
      .then((data) => {
        setSpells(data);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Failed to load spells');
        setIsLoading(false);
      });
  }, []);

  return (
    <SpellsContext.Provider value={{ spells, isLoading, error }}>
      {children}
    </SpellsContext.Provider>
  );
};

export const useSpells = () => {
  const context = useContext(SpellsContext);
  if (!context) {
    throw new Error('useSpells must be used within a SpellsProvider');
  }
  return context;
};

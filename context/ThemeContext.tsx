import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { asyncFetch } from '../data/graphql/graphql-fetcher';
import { setThemeMutation } from '../data/graphql/snippets/user-preferences';
import { logger } from '../lib/logger';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<string>('dark');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const loadAndApplyTheme = () => {
      try {
        const storedTheme = localStorage.getItem('dme-theme') || 'dark';
        setThemeState(storedTheme);
        document.documentElement.setAttribute('data-theme', storedTheme);
      } catch (error) {
        logger.error('Error loading theme from localStorage', error);
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    };

    loadAndApplyTheme();

    window.addEventListener('storage', loadAndApplyTheme);
    return () => window.removeEventListener('storage', loadAndApplyTheme);
  }, [isClient]);

  const setTheme = async (newTheme: string): Promise<void> => {
    try {
      setThemeState(newTheme);

      if (typeof window !== 'undefined') {
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('dme-theme', newTheme);

        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'dme-theme',
            newValue: newTheme,
          }),
        );
      }

      await asyncFetch(setThemeMutation, {
        input: { theme: newTheme },
      });
    } catch (error) {
      logger.error('Failed to set theme preference', {
        error: error instanceof Error ? error.message : String(error),
        theme: newTheme,
      });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

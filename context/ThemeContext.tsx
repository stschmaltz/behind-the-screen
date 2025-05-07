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
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getInitialTheme = (): string => {
  try {
    return localStorage.getItem('dme-theme') || 'cupcake';
  } catch (error) {
    logger.error('Error reading theme from localStorage:', error);
    return 'cupcake';
  }
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<string>(getInitialTheme);
  console.log('theme', theme);
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('dme-theme', theme);
    } catch (error) {
      logger.error('Failed to apply theme to DOM/localStorage', {
        error: error instanceof Error ? error.message : String(error),
        theme: theme,
      });
      logger.error(
        '[ThemeContext] Error applying theme to DOM/localStorage:',
        error,
      );
    }
  }, [theme]);

  const saveThemeToDb = async (themeToSave: string) => {
    try {
      await asyncFetch(setThemeMutation, {
        input: { theme: themeToSave },
      });
    } catch (error) {
      logger.error('Failed to save theme preference to DB', {
        error: error instanceof Error ? error.message : String(error),
        theme: themeToSave,
      });
      logger.error('[ThemeContext] Error saving theme to DB:', error);
    }
  };

  const setTheme = (newTheme: string): void => {
    setThemeState(newTheme);

    saveThemeToDb(newTheme);
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

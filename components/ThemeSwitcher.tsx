import React, { useEffect, useState } from 'react';
import { asyncFetch } from '../data/graphql/graphql-fetcher';
import { setThemeMutation } from '../data/graphql/snippets/user-preferences';
import { logger } from '../lib/logger';

const ThemeSwitcher: React.FC = () => {
  // Keep track of current theme locally
  const [currentTheme, setCurrentTheme] = useState<string>('dark');

  // Initialize theme from localStorage on component mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('dme-theme') || 'dark';
    setCurrentTheme(storedTheme);
  }, []);

  const themes = [
    'acid',
    'autumn',
    'business',
    'dim',
    'dracula',
    'emerald',
    'fantasy',
    'garden',
    'halloween',
    'lemonade',
    'night',
    'nord',
    'pastel',
    'retro',
    'sunset',
    'synthwave',
    'valentine',
    'winter',
    // 'aqua',
    // 'black',
    // 'bumblebee',
    // 'cmyk',
    // 'coffee',
    // 'corporate',
    // 'cupcake',
    // 'cyberpunk',
    // 'dark',
    // 'forest',
    // 'light',
    // 'lofi',
    // 'luxury',
    // 'wireframe',
  ];

  // Common themes to show at the top
  const commonThemes = [
    'light',
    'dark',
    // 'dracula',
    'cupcake',
    'cyberpunk',
    // 'fantasy',
  ];

  const handleThemeChange = async (newTheme: string) => {
    // Update local state
    setCurrentTheme(newTheme);

    // Set in localStorage
    localStorage.setItem('dme-theme', newTheme);

    // Apply to document
    document.documentElement.setAttribute('data-theme', newTheme);

    try {
      // Save to MongoDB
      await asyncFetch(setThemeMutation, {
        input: { theme: newTheme },
      });
    } catch (error) {
      logger.error('Failed to save theme preference to database', {
        error: error instanceof Error ? error.message : String(error),
        theme: newTheme,
      });
    }
  };

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="w-5 h-5 stroke-current"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </div>
      <div
        tabIndex={0}
        className="mt-3 dropdown-content shadow-lg bg-base-100 rounded-box w-52 max-h-96 overflow-y-auto z-50"
      >
        <div className="grid grid-cols-1 gap-1 p-2">
          <div className="mb-2 p-2 border-b">
            <div className="grid grid-cols-2 gap-1">
              {commonThemes.map((t) => (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  className={`btn btn-xs font-medium ${
                    currentTheme === t
                      ? 'bg-primary text-primary-content border-primary'
                      : 'bg-neutral-content text-neutral border-2 hover:bg-neutral-focus hover:text-neutral-content'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 p-1">
            {themes.map((t) => (
              <button
                key={t}
                onClick={() => handleThemeChange(t)}
                className={`btn btn-xs font-medium ${
                  currentTheme === t
                    ? 'bg-primary text-primary-content border-primary'
                    : 'bg-neutral-content text-neutral border-2 hover:bg-neutral-focus hover:text-neutral-content'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export { ThemeSwitcher };

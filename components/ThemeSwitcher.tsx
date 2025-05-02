import { useTheme } from 'next-themes';
import React from 'react';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const themes = [
    'light',
    'dark',
    'cupcake',
    'bumblebee',
    'emerald',
    'corporate',
    'synthwave',
    'retro',
    'cyberpunk',
    'valentine',
    'halloween',
    'garden',
    'forest',
    'aqua',
    'lofi',
    'pastel',
    'fantasy',
    'wireframe',
    'black',
    'luxury',
    'dracula',
    'cmyk',
    'autumn',
    'business',
    'acid',
    'lemonade',
    'night',
    'coffee',
    'winter',
    'dim',
    'nord',
    'sunset',
  ];

  // Common themes to show at the top
  const commonThemes = ['cupcake', 'dark', 'sunset', '', 'dracula'];

  return (
    <div className="dropdown dropdown-end z-50">
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
        className="mt-3 z-[1] dropdown-content shadow-lg bg-base-100 rounded-box w-52 max-h-96 overflow-y-auto"
      >
        <div className="grid grid-cols-1 gap-1 p-2">
          <div className="mb-2 p-2 border-b">
            <div className="grid grid-cols-2 gap-1">
              {commonThemes.map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`btn btn-xs ${theme === t ? 'btn-primary' : 'text-primary-content hover:bg-base-300'}`}
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
                onClick={() => setTheme(t)}
                className={`btn btn-xs ${theme === t ? 'btn-primary' : 'text-primary-content hover:bg-base-300'}`}
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

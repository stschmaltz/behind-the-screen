import { useTheme } from 'next-themes';
import React from 'react';

const ThemeSwitcher: React.FC = ({}) => {
  const { theme: _, setTheme } = useTheme();
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

  return (
    <>
      <details className="dropdown">
        <summary className="btn m-1">Theme</summary>
        <ul className="dropdown-content rounded-box z-[1] w-52 p-2 shadow">
          {themes?.map((theme) => (
            <li key={theme}>
              <button
                onClick={() => setTheme(theme)}
                className="btn btn-ghost text-primary"
              >
                {theme}
              </button>
            </li>
          ))}
        </ul>
      </details>
    </>
  );
};

export default ThemeSwitcher;
import React, { useRef, useState } from 'react';
import { darkThemes, themeDisplayNames } from './theme-options';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { theme: currentTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleThemeChange = async (theme: string) => {
    await setTheme(theme);
  };

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
  ].sort((a, b) => {
    const nameA = themeDisplayNames[a]?.toLowerCase() || a;
    const nameB = themeDisplayNames[b]?.toLowerCase() || b;

    return nameA.localeCompare(nameB);
  });

  const commonThemes = ['light', 'dark', 'cupcake', 'cyberpunk'];

  const getThemeIndicator = (theme: string) =>
    darkThemes.has(theme) ? (
      <span title="Dark theme">🌙</span>
    ) : (
      <span title="Light theme">☀️</span>
    );

  return (
    <div className="dropdown dropdown-end relative" ref={dropdownRef}>
      <button
        className="btn btn-ghost btn-circle hover:scale-110 transition-all duration-200 active:scale-95"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className={`w-7 h-7 stroke-current transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="mt-0 dropdown-content shadow-2xl bg-base-100 rounded-box w-64 max-h-96 overflow-y-auto z-50 slide-down border border-base-300">
          <div className="grid grid-cols-1 gap-1 p-2">
            <div className="mb-2 p-2 border-b border-base-300">
              <div className="grid grid-cols-2 gap-1">
                {commonThemes.map((theme, index) => (
                  <button
                    key={theme}
                    onClick={() => handleThemeChange(theme)}
                    className={`btn btn-xs font-medium flex items-center min-w-[110px] justify-start text-left w-full border-2 focus:ring-2 focus:ring-primary/30 hover:ring-2 hover:ring-primary/20 transition-all duration-200 hover:scale-105 active:scale-95 ${
                      currentTheme === theme
                        ? 'bg-primary text-primary-content border-primary bounce-subtle'
                        : darkThemes.has(theme)
                          ? 'bg-gray-600 text-white border-gray-500 hover:border-gray-400'
                          : 'bg-gray-100 text-gray-900 border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <span className="flex flex-row items-center gap-2 w-full">
                      {getThemeIndicator(theme)}
                      {themeDisplayNames[theme] || theme}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1 p-1">
              {themes.map((theme, index) => (
                <button
                  key={theme}
                  onClick={() => handleThemeChange(theme)}
                  className={`btn btn-xs font-medium flex items-center min-w-[110px] justify-start text-left w-full border-2 focus:ring-2 focus:ring-primary/30 hover:ring-2 hover:ring-primary/20 transition-all duration-200 hover:scale-105 active:scale-95 ${
                    currentTheme === theme
                      ? 'bg-primary text-primary-content border-primary'
                      : darkThemes.has(theme)
                        ? 'bg-gray-600 text-white border-gray-500 hover:border-gray-400'
                        : 'bg-gray-100 text-gray-900 border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ animationDelay: `${(index + 4) * 20}ms` }}
                >
                  <span className="flex flex-row items-center gap-2 w-full">
                    {getThemeIndicator(theme)}
                    {themeDisplayNames[theme] || theme}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { ThemeSwitcher };

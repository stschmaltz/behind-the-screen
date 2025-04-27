import Link from 'next/link';
import { NextRouter } from 'next/router';
import React, { useState } from 'react';

interface Props {
  router: NextRouter;
}

const NavBar: React.FC<Props> = ({ router }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isActive = (path: string) => router.pathname === path;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { path: '/encounters', label: 'Encounter Manager' },
    { path: '/npc-generator', label: 'NPC Generator' },
    { path: '/loot-generator', label: 'Loot' },
  ];

  return (
    <nav className="relative">
      <button
        className="md:hidden flex flex-col justify-center items-center"
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
      >
        <span
          className={`block w-6 h-0.5 bg-white mb-1.5 transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}
        ></span>
        <span
          className={`block w-6 h-0.5 bg-white mb-1.5 transition-opacity ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}
        ></span>
        <span
          className={`block w-6 h-0.5 bg-white transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}
        ></span>
      </button>

      <ul className="hidden md:flex space-x-4">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              href={item.path}
              className={`${isActive(item.path) ? 'underline font-bold' : 'hover:text-primary-content/80'}`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {isMenuOpen && (
        <ul className="md:hidden absolute top-10 right-0 bg-primary p-4 rounded-md shadow-lg z-50 min-w-[200px]">
          {navItems.map((item) => (
            <li key={item.path} className="mb-2 last:mb-0">
              <Link
                href={item.path}
                className={`block py-2 px-4 rounded-md ${
                  isActive(item.path)
                    ? 'bg-primary-focus font-bold'
                    : 'hover:bg-primary-focus'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

export { NavBar };

import Link from 'next/link';
import { NextRouter } from 'next/router';
import React from 'react';

interface Props {
  router: NextRouter;
}

const NavBar: React.FC<Props> = ({ router }) => {
  const isActive = (path: string) => router.pathname === path;

  const navItems = [
    { path: '/encounters', label: 'Encounter Manager', enabled: true },
    { path: '/npc-generator', label: 'NPC Generator', enabled: true },
    { path: '/loot-generator', label: 'Loot', enabled: true },
    { path: '/feedback', label: 'Feedback', enabled: true },
  ];

  return (
    <nav className="relative">
      <ul className="hidden md:flex space-x-4">
        {navItems.map((item) => (
          <li key={item.label}>
            {item.enabled ? (
              <Link
                href={item.path}
                className={`relative transition-all duration-200 ${
                  isActive(item.path)
                    ? 'font-bold after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-white after:rounded-full'
                    : 'hover:text-primary-content/80 hover:scale-105 inline-block'
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <span className="opacity-50 cursor-not-allowed">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export { NavBar };

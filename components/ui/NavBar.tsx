import Link from 'next/link';
import { NextRouter } from 'next/router';
import React from 'react';

interface Props {
  router: NextRouter;
}

const NavBar: React.FC<Props> = ({ router }) => {
  const isActive = (path: string) =>
    router.pathname === path || router.pathname.startsWith(`${path}/`);

  const navItems = [
    { path: '/encounters', label: 'Encounter Manager', enabled: true },
    { path: '/npc-generator', label: 'NPC Generator', enabled: true },
    { path: '/loot-generator', label: 'Loot', enabled: true },
    { path: '/feedback', label: 'Feedback', enabled: true },
  ];

  return (
    <nav className="relative" aria-label="Primary">
      <ul className="hidden md:flex space-x-4">
        {navItems.map((item) => (
          <li key={item.label}>
            {item.enabled ? (
              <Link
                href={item.path}
                aria-current={isActive(item.path) ? 'page' : undefined}
                className={`relative inline-block py-1 transition-opacity duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:rounded-full after:bg-current after:transition-transform after:duration-300 ${
                  isActive(item.path)
                    ? 'font-bold after:scale-x-100'
                    : 'opacity-90 hover:opacity-100 after:scale-x-0 hover:after:scale-x-100'
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

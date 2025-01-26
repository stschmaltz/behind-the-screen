import Link from 'next/link';
import { NextRouter } from 'next/router';
import React from 'react';

interface Props {
  router: NextRouter;
}

const NavBar: React.FC<Props> = ({ router }) => {
  const isActive = (path: string) => router.pathname === path;

  return (
    <nav>
      <ul className="flex space-x-4">
        <li>
          <Link
            href="/encounters"
            className={isActive('/encounters') ? 'underline' : ''}
          >
            Encounter Manager
          </Link>
        </li>
        <li>
          <Link
            href="/npc-generator"
            className={isActive('/npc-generator') ? 'underline' : ''}
          >
            NPC Generator
          </Link>
        </li>
        <li>
          <Link
            href="/loot-generator"
            className={isActive('/loot-generator') ? 'underline' : ''}
          >
            Loot
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export { NavBar };

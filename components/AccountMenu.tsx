import Image from 'next/image';
import Link from 'next/link';
import { RefObject } from 'react';
import type { User } from '../src/generated/graphql';

type AccountMenuProps = {
  currentUser: User | undefined;
  accountMenuRef: RefObject<HTMLDivElement | null>;
  isAccountMenuOpen: boolean;
  toggleAccountMenu: () => void;
  setIsAccountMenuOpen: (open: boolean) => void;
};

export default function AccountMenu({
  currentUser,
  accountMenuRef,
  isAccountMenuOpen,
  toggleAccountMenu,
  setIsAccountMenuOpen,
}: AccountMenuProps) {
  if (!currentUser) {
    return (
      <Link href="/api/auth/login" className="btn btn-ghost">
        Log In / Sign Up
      </Link>
    );
  }

  return (
    <div className="dropdown dropdown-end relative" ref={accountMenuRef}>
      <button
        className="btn btn-ghost btn-circle avatar"
        onClick={toggleAccountMenu}
        aria-expanded={isAccountMenuOpen}
      >
        <div className="w-10 rounded-full relative">
          <Image
            alt={currentUser.name || 'User avatar'}
            src={currentUser.picture || '/default-avatar.svg'}
            fill
            sizes="40px"
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
      </button>
      {isAccountMenuOpen && (
        <ul className="menu menu-sm dropdown-content mt-0 z-[1] p-2 shadow bg-base-100 rounded-box w-52 text-base-content">
          {currentUser.name && (
            <li className="menu-title">
              <span>Signed in as {currentUser.name}</span>
            </li>
          )}
          <li>
            <Link
              href="/account-settings"
              onClick={() => setIsAccountMenuOpen(false)}
            >
              Account Settings
            </Link>
          </li>
          <li>
            <Link
              href="/api/auth/logout?returnTo=http%3A%2F%2Flocalhost%3A3000"
              onClick={() => setIsAccountMenuOpen(false)}
            >
              Logout
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}

import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Cog6ToothIcon,
  HomeIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/encounters', label: 'Encounters', icon: UsersIcon },
  { href: '/account-settings', label: 'Settings', icon: Cog6ToothIcon },
];

export function BottomNav() {
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-base-100 border-t border-base-200 md:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
      <ul className="flex justify-around items-center h-20 pb-6 pt-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = router.pathname === href;

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center justify-center gap-1 text-xs transition-all duration-200 ${
                  active
                    ? 'text-primary font-bold scale-110'
                    : 'text-base-content hover:scale-105 active:scale-95'
                }`}
                aria-label={label}
              >
                <Icon
                  className={`w-6 h-6 transition-all duration-200 ${
                    active ? 'text-primary bounce-subtle' : 'text-base-content'
                  }`}
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

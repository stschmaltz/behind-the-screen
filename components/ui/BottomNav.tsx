import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Cog6ToothIcon,
  GiftIcon,
  HomeIcon,
  UserGroupIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/encounters', label: 'Encounters', icon: UsersIcon },
  { href: '/npc-generator', label: 'NPCs', icon: UserGroupIcon },
  { href: '/loot-generator', label: 'Loot', icon: GiftIcon },
  { href: '/account-settings', label: 'Settings', icon: Cog6ToothIcon },
];

const isActivePath = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname.startsWith(href);

export function BottomNav() {
  const router = useRouter();

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-40 bg-base-100/95 backdrop-blur border-t border-base-200 md:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.1)] safe-bottom"
    >
      <ul className="flex justify-around items-stretch h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActivePath(router.pathname, href);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`relative h-full flex flex-col items-center justify-center gap-1 text-[11px] transition-colors duration-200 active:scale-95 ${
                  active
                    ? 'text-primary font-semibold'
                    : 'text-base-content/70 hover:text-base-content'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute top-0 h-0.5 rounded-full bg-primary transition-all duration-300 ${
                    active ? 'w-8 opacity-100' : 'w-0 opacity-0'
                  }`}
                />
                <Icon
                  className={`w-6 h-6 transition-transform duration-200 ${
                    active ? 'scale-110' : ''
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

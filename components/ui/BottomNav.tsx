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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-base-100 border-t border-base-200 md:hidden">
      <ul className="flex justify-around items-center h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = router.pathname === href;

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center justify-center gap-1 text-xs ${active ? 'text-primary font-bold' : 'text-base-content'}`}
                aria-label={label}
              >
                <Icon
                  className={`w-6 h-6 ${active ? 'text-primary' : 'text-base-content'}`}
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

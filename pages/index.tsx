import { NextPage } from 'next';
import Link from 'next/link';
import {
  GiftIcon,
  ShieldCheckIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const HomePage: NextPage = () => {
  const primaryFeature = {
    href: '/encounters',
    label: 'Encounter Manager',
    description: 'Plan and run encounters with ease',
    status: 'alpha' as const,
    icon: UsersIcon,
  } as const;

  const comingSoon = [
    {
      href: '/npc-generator',
      label: 'NPC Generator',
      description: 'Create memorable NPCs',
      status: 'soon' as const,
      icon: ShieldCheckIcon,
    },
    {
      href: '/loot-generator',
      label: 'Loot Generator',
      description: 'Generate treasure for your party',
      status: 'soon' as const,
      icon: GiftIcon,
    },
  ] as const;

  return (
    <div className="bg-base-100 min-h-screen p-4 flex flex-col items-center space-y-6">
      <h1 className="text-3xl font-bold">Dungeon Master Essentials</h1>
      <p className="text-center max-w-xl text-base-content opacity-90">
        Welcome, and thanks for checking out my app! I&apos;m Shane, a solo
        developer building{' '}
        <span className="font-semibold">
          Dungeon&nbsp;Master&nbsp;Essentials
        </span>
        —a multi-purpose toolkit for game and dungeon masters to run their
        tabletop role-playing campaigns like Dungeons &amp; Dragons.
      </p>
      <p className="text-center max-w-xl text-base-content opacity-70">
        Dungeon&nbsp;Master&nbsp;Essentials is in active development, and your
        feedback will directly shape its direction. Please share your ideas,
        pain points, or feature requests—
        <Link href="/feedback" className="text-primary hover:underline">
          I&apos;d love to hear from you!
        </Link>
      </p>

      <Link
        href={primaryFeature.href}
        className="flex flex-col items-center gap-2 p-6 rounded-lg border border-base-300 bg-base-200 hover:bg-base-300 transition-colors w-full max-w-md"
      >
        <primaryFeature.icon className="w-12 h-12 text-primary" />
        <span className="text-2xl font-semibold flex items-center gap-2">
          {primaryFeature.label}
          <span className="badge badge-warning badge-sm">Alpha</span>
        </span>
        <span className="text-center opacity-80">
          {primaryFeature.description}
        </span>
      </Link>

      <div className="mt-10 w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {comingSoon.map((feature) => (
            <div
              key={feature.href}
              className="flex flex-col gap-1 p-4 rounded-lg border border-base-300 bg-base-200 opacity-60 cursor-not-allowed"
            >
              <feature.icon className="w-8 h-8 text-primary mb-1" />
              <span className="text-lg font-semibold flex items-center gap-2">
                {feature.label}
                <span className="badge badge-outline badge-sm">
                  Coming Soon
                </span>
              </span>
              <span className="text-sm opacity-80">{feature.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

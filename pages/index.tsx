import { NextPage } from 'next';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import {
  GiftIcon,
  ShieldCheckIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useUser } from '@auth0/nextjs-auth0/client';
import { isFeatureEnabled } from '../lib/featureFlags';

const HomePage: NextPage = () => {
  const { user } = useUser();

  const primaryFeature = {
    href: '/encounters',
    label: 'Encounter Manager',
    description: 'Plan and run encounters with ease',
    status: 'beta' as const,
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
    <>
      <NextSeo
        title="D&D 5e Encounter Manager & Combat Tracker"
        description="Encounter manager and combat tracker for D&D 5e, dungeons and dragons, and tabletop RPGs. Manage encounters, initiative, and combat for your campaigns."
        canonical="https://encountermanager.com/"
        openGraph={{
          url: 'https://encountermanager.com/',
          title: 'D&D 5e Encounter Manager & Combat Tracker',
          description:
            'Encounter manager and combat tracker for D&D 5e, dungeons and dragons, and tabletop RPGs. Manage encounters, initiative, and combat for your campaigns.',
          images: [
            {
              url: 'https://encountermanager.com/images/profile.png',
              width: 800,
              height: 600,
              alt: 'D&D 5e Encounter Manager',
            },
          ],
          site_name: 'Encounter Manager',
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content:
              'encounter manager, d&d, dnd, dungeons and dragons, 5e, d&d 5e combat manager, encounters, combat tracker, tabletop rpg, initiative tracker',
          },
        ]}
      />
      <div className="bg-base-100 h-full p-4 flex flex-col items-center space-y-6">
        <h1 className="text-3xl font-bold text-center">
          Dungeon Master Essentials
        </h1>
        <p className="text-center max-w-xl text-base-content opacity-90">
          Welcome to DM Essentials! I&apos;m Shane, the solo developer building
          this free toolkit to help Game Masters run engaging TTRPGs like
          D&amp;D.
        </p>
        <p className="text-center max-w-xl text-base-content opacity-90">
          Start streamlining your combat with the{' '}
          <Link
            href="/encounters"
            className="font-bold text-primary hover:underline"
          >
            Encounter Manager
          </Link>
          , designed for ease of use. More helpful tools are coming soon!
        </p>

        <Link
          href={primaryFeature.href}
          className="flex flex-col items-center gap-2 p-6 rounded-lg border border-base-300 bg-base-200 hover:bg-base-300 transition-colors w-full max-w-md"
        >
          <primaryFeature.icon className="w-12 h-12 text-primary" />
          <div className="flex flex-col md:flex-row items-center gap-0 md:gap-2">
            <span className="text-2xl font-semibold text-center mb-0">
              {primaryFeature.label}
            </span>
          </div>
          <span className="text-center opacity-80">
            {primaryFeature.description}
          </span>
          <span className="text-sm mt-2 text-center opacity-70">
            Use the{' '}
            <span
              className="text-primary hover:underline cursor-pointer"
              onClick={() => (window.location.href = '/campaigns')}
            >
              Campaigns page
            </span>{' '}
            to organize your game world
          </span>
        </Link>
        <p className="text-center max-w-xl text-base-content ">
          Your feedback is vital as I build this solo project. Please share your
          valuable thoughts and feature requests{' '}
          <Link href="/feedback" className="text-primary hover:underline">
            here!
          </Link>
        </p>
        {user?.email === 'stschmaltz@gmail.com' && (
          <Link
            href="/admin"
            className="flex items-center justify-center mx-auto mt-2 w-fit btn btn-accent btn-xs rounded-full gap-2 shadow-sm hover:scale-105 transition-transform"
            style={{ letterSpacing: '0.05em' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2zm0 0V7m0 4v4m0 0c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2z"
              />
            </svg>
            Admin
          </Link>
        )}

        <div className="mt-10 w-full max-w-3xl">
          <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {comingSoon.map((feature) => {
              if (
                feature.href === '/loot-generator' &&
                isFeatureEnabled(user?.email)
              ) {
                return (
                  <Link
                    key={feature.href}
                    href={feature.href}
                    className="flex flex-col gap-1 p-4 rounded-lg border border-base-300 bg-base-200 hover:bg-base-300 transition-colors cursor-pointer"
                  >
                    <feature.icon className="w-8 h-8 text-primary mb-1" />
                    <span className="text-lg font-semibold flex items-center gap-2">
                      {feature.label}
                      <span className="badge badge-accent badge-sm">Beta</span>
                    </span>
                    <span className="text-sm opacity-80">
                      {feature.description}
                    </span>
                  </Link>
                );
              }

              return (
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
                  <span className="text-sm opacity-80">
                    {feature.description}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;

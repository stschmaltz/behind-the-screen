import { NextPage } from 'next';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import type { CSSProperties } from 'react';
import {
  ArrowRightIcon,
  BoltIcon,
  BookOpenIcon,
  DevicePhoneMobileIcon,
  GiftIcon,
  HeartIcon,
  MapIcon,
  ScaleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useUser } from '@auth0/nextjs-auth0/client';
import { JsonLd } from '../components/seo/JsonLd';
import {
  buildFaqJsonLd,
  buildWebAppJsonLd,
  buildWebSiteJsonLd,
  FaqItem,
} from '../lib/seo';

const PAGE_TITLE = 'D&D 5e Encounter Manager & Combat Tracker';
const PAGE_DESCRIPTION =
  'Free D&D 5e encounter manager and combat tracker. Track initiative, HP and conditions, build encounters from a full monster database, and generate NPCs and loot for your campaigns.';

const SIGN_UP_URL = '/api/auth/login?returnTo=%2Fencounters';

const TOOLS = [
  {
    href: '/encounters',
    label: 'Encounter Manager',
    description:
      'Build encounters, roll initiative and track HP, conditions and turns at the table.',
    cta: 'Run an encounter',
    icon: UsersIcon,
    badge: null,
  },
  {
    href: '/npc-generator',
    label: 'NPC Generator',
    description:
      'Create a memorable NPC with a name, personality, quirk and motivation in one click.',
    cta: 'Generate an NPC',
    icon: UserGroupIcon,
    badge: 'Beta',
  },
  {
    href: '/loot-generator',
    label: 'Loot Generator',
    description:
      'Roll coins and treasure scaled to your party level, ready to hand out.',
    cta: 'Roll some loot',
    icon: GiftIcon,
    badge: 'Beta',
  },
] as const;

const FEATURES = [
  {
    icon: BoltIcon,
    title: 'Initiative & turn tracking',
    body: 'Roll or enter initiative, then step through rounds with the current turn always in view.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'HP, AC & conditions',
    body: 'Apply damage and healing in a tap and keep conditions attached to the right creature.',
  },
  {
    icon: BookOpenIcon,
    title: 'Built-in monster database',
    body: 'Add SRD 5e monsters with full stat blocks, or create your own custom enemies.',
  },
  {
    icon: ScaleIcon,
    title: 'Encounter difficulty',
    body: 'See whether a fight is easy, medium, hard or deadly for your party before you run it.',
  },
  {
    icon: MapIcon,
    title: 'Campaigns & adventures',
    body: 'Organize encounters by campaign and adventure, and reuse your party of players.',
  },
  {
    icon: DevicePhoneMobileIcon,
    title: 'Works on any screen',
    body: 'Use it on a laptop behind the screen or install it on your phone or tablet.',
  },
] as const;

const FAQS: FaqItem[] = [
  {
    question: 'Is Encounter Manager free?',
    answer:
      'Yes. The encounter manager, combat tracker, NPC generator and loot generator are free to use. A free account lets you save encounters and campaigns.',
  },
  {
    question: 'Do I need an account?',
    answer:
      'The demo encounter and the NPC and loot generators work without an account. Saving encounters, campaigns and players requires a free sign-in so your data follows you across devices.',
  },
  {
    question: 'Which monsters are included?',
    answer:
      'The monster database includes creatures from the D&D 5e System Reference Document (SRD 5.1) with full stat blocks, and you can add your own custom enemies.',
  },
  {
    question: 'Can I use it on my phone or tablet?',
    answer:
      'Yes. Encounter Manager is designed for phones, tablets and laptops, and can be installed to your home screen like an app.',
  },
];

const stagger = (index: number) => ({ '--i': index }) as CSSProperties;

const HomePage: NextPage = () => {
  const { user } = useUser();

  return (
    <>
      <NextSeo title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
      <JsonLd id="website" data={buildWebSiteJsonLd()} />
      <JsonLd
        id="webapp"
        data={buildWebAppJsonLd({
          name: 'Encounter Manager',
          description: PAGE_DESCRIPTION,
          path: '/',
        })}
      />
      <JsonLd id="home-faq" data={buildFaqJsonLd(FAQS)} />

      <div className="flex flex-col items-center gap-16 pb-8">
        <section className="hero-glow w-full rounded-3xl px-4 py-12 md:py-16 text-center flex flex-col items-center gap-5">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            For Dungeon Masters
          </p>
          <h1 className="max-w-3xl text-4xl md:text-5xl font-extrabold leading-tight text-balance">
            The free D&amp;D 5e encounter manager &amp; combat tracker
          </h1>
          <p className="max-w-2xl text-lg text-base-content/75 text-balance">
            Track initiative, HP and conditions, pull monsters from a full stat
            block database, and generate NPCs and loot on the fly. Less
            bookkeeping, more game.
          </p>
          <div
            className="reveal flex flex-col sm:flex-row items-center gap-3 pt-2"
            style={stagger(0)}
          >
            <Link
              href={user ? '/encounters' : '/demo'}
              className="btn btn-primary btn-lg gap-2"
            >
              {user ? 'Open Encounter Manager' : 'Try a demo encounter'}
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            {!user && (
              <a href={SIGN_UP_URL} className="btn btn-ghost btn-lg">
                Sign up to save your encounters
              </a>
            )}
          </div>
          <p className="reveal text-sm text-base-content/60" style={stagger(1)}>
            {user
              ? 'Free to use. No ads, no spam.'
              : 'No account needed for the demo. Free to use, no ads, no spam.'}
          </p>
          {user?.email === 'stschmaltz@gmail.com' && (
            <Link
              href="/admin"
              className="btn btn-accent btn-xs rounded-full tracking-wide"
            >
              Admin
            </Link>
          )}
        </section>

        <section className="w-full max-w-5xl" aria-labelledby="tools-heading">
          <h2 id="tools-heading" className="text-2xl font-bold mb-5">
            Tools for your table
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {TOOLS.map((tool, index) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="feature-card reveal flex flex-col gap-2 rounded-xl border-2 border-base-300 bg-base-200 p-5"
                style={stagger(index + 1)}
              >
                <tool.icon className="h-9 w-9 text-primary" />
                <span className="text-lg font-semibold flex items-center gap-2">
                  {tool.label}
                  {tool.badge && (
                    <span className="badge badge-accent badge-sm">
                      {tool.badge}
                    </span>
                  )}
                </span>
                <span className="text-sm text-base-content/75 flex-1">
                  {tool.description}
                </span>
                <span className="mt-2 text-sm font-semibold text-primary flex items-center gap-1">
                  {tool.cta}
                  <ArrowRightIcon className="feature-arrow h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-sm text-base-content/70">
            Running a longer game? Use{' '}
            <Link href="/campaigns" className="link link-primary">
              Campaigns
            </Link>{' '}
            to organize adventures, encounters and your party.
          </p>
        </section>

        <section
          className="w-full max-w-5xl"
          aria-labelledby="features-heading"
        >
          <h2 id="features-heading" className="text-2xl font-bold mb-2">
            Everything you need to run combat
          </h2>
          <p className="text-base-content/70 mb-6 max-w-2xl">
            The encounter manager is an initiative tracker, monster reference
            and difficulty calculator in one place.
          </p>
          <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </span>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-base-content/70">{feature.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="w-full max-w-3xl rounded-2xl border border-base-300 bg-base-200 p-6 md:p-8 text-center"
          aria-labelledby="about-heading"
        >
          <HeartIcon className="mx-auto h-8 w-8 text-primary mb-2" />
          <h2 id="about-heading" className="text-xl font-bold mb-2">
            Built by one DM, for DMs
          </h2>
          <p className="text-base-content/80 max-w-xl mx-auto">
            I&apos;m Shane, the solo developer building this free toolkit to
            help Game Masters run engaging TTRPGs like D&amp;D. Your feedback
            shapes what gets built next.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href="/feedback" className="btn btn-primary btn-sm">
              Share feedback
            </Link>
            <Link href="/support" className="btn btn-outline btn-sm">
              Support the project
            </Link>
          </div>
        </section>

        <section className="w-full max-w-3xl" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-bold mb-4">
            Frequently asked questions
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="collapse collapse-arrow border border-base-300 bg-base-100"
              >
                <summary className="collapse-title font-medium">
                  {faq.question}
                </summary>
                <div className="collapse-content text-sm text-base-content/80">
                  <p>{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;

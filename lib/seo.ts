export const SITE_URL = 'https://encountermanager.com';
export const SITE_NAME = 'DM Essentials';
export const OG_IMAGE = `${SITE_URL}/images/profile.png`;

interface RouteSeo {
  title: string;
  description: string;
}

const ROUTE_SEO: Record<string, RouteSeo> = {
  '/npc-generator': {
    title: 'Free D&D 5e NPC Generator',
    description:
      'Generate memorable D&D 5e NPCs in one click: name, race, occupation, personality, appearance, quirks, motivations and secrets. Free random NPC generator for Dungeon Masters.',
  },
  '/loot-generator': {
    title: 'Free D&D 5e Loot & Treasure Generator',
    description:
      'Roll random treasure for your D&D 5e party by level: coins, gear, trinkets, magic items and custom loot. A free loot generator for Dungeon Masters.',
  },
  '/support': {
    title: 'Support DM Essentials',
    description:
      'Support the development of DM Essentials, a free toolkit of encounter, NPC and loot tools for Dungeon Masters.',
  },
  '/privacy': {
    title: 'Privacy Policy',
    description: 'How DM Essentials collects, uses and protects your data.',
  },
  '/terms': {
    title: 'Terms of Service',
    description: 'The terms that govern your use of DM Essentials.',
  },
  '/feedback': {
    title: 'Send Feedback',
    description:
      'Share feature requests, bug reports and ideas to help shape DM Essentials.',
  },
  '/encounters': {
    title: 'Encounter Manager',
    description:
      'Plan and run D&D 5e combat encounters with initiative tracking, HP, conditions and a full monster database.',
  },
  '/campaigns': {
    title: 'Campaigns',
    description: 'Organize your campaigns, adventures and players.',
  },
};

const INDEXABLE_ROUTES = new Set([
  '/',
  '/npc-generator',
  '/loot-generator',
  '/support',
  '/privacy',
  '/terms',
]);

export const getRouteSeo = (pathname: string): RouteSeo | undefined =>
  ROUTE_SEO[pathname];

export const isIndexableRoute = (pathname: string): boolean =>
  INDEXABLE_ROUTES.has(pathname);

export const getCanonicalUrl = (asPath: string): string => {
  const path = asPath.split(/[?#]/)[0] || '/';
  const withSlash = path.endsWith('/') ? path : `${path}/`;

  return `${SITE_URL}${withSlash}`;
};

export interface FaqItem {
  question: string;
  answer: string;
}

export const buildFaqJsonLd = (items: FaqItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
});

export const buildWebAppJsonLd = (input: {
  name: string;
  description: string;
  path: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: input.name,
  description: input.description,
  url: getCanonicalUrl(input.path),
  applicationCategory: 'GameApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
});

export const buildWebSiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  alternateName: ['Dungeon Master Essentials', 'Encounter Manager'],
  url: `${SITE_URL}/`,
});

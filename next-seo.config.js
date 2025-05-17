const title = 'D&D 5e Encounter Manager & Combat Tracker';
const description =
  'Encounter manager and combat tracker for D&D 5e, dungeons and dragons, and tabletop RPGs. Manage encounters, initiative, and combat for your campaigns.';

module.exports = {
  title,
  description,
  canonical: 'https://encountermanager.com/',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://encountermanager.com/',
    site_name: 'Dungeon Master Essentials',
    title,
    description,
    images: [
      {
        url: 'https://encountermanager.com/images/profile.png',
        width: 800,
        height: 600,
        alt: 'D&D 5e Encounter Manager',
      },
    ],
  },
  twitter: {
    handle: '@yourtwitter',
    site: '@yourtwitter',
    cardType: 'summary_large_image',
    title,
    description,
    image: 'https://encountermanager.com/images/profile.png',
  },
  additionalMetaTags: [
    {
      name: 'keywords',
      content:
        'encounter manager, d&d, dnd, dungeons and dragons, 5e, d&d 5e combat manager, encounters, combat tracker, tabletop rpg, initiative tracker',
    },
  ],
};

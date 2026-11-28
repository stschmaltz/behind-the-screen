const title = 'D&D 5e Encounter Manager & Combat Tracker';
const description =
  'Free D&D 5e encounter manager and combat tracker. Track initiative, HP and conditions, build encounters from a full monster database, and generate NPCs and loot for your campaigns.';

module.exports = {
  defaultTitle: `${title} | Encounter Manager`,
  titleTemplate: '%s | Encounter Manager',
  description,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    site_name: 'Encounter Manager',
    title,
    description,
    images: [
      {
        url: 'https://encountermanager.com/images/profile.png',
        width: 512,
        height: 512,
        alt: 'Encounter Manager - D&D 5e combat tracker',
      },
    ],
  },
  twitter: {
    cardType: 'summary',
  },
};

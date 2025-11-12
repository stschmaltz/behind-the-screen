import { LootItemType } from '../components/loot';

const MUNDANE_ITEMS = [
  'Torch',
  'Rope (50 ft)',
  'Backpack',
  'Bedroll',
  'Rations (1 day)',
  'Waterskin',
  'Tinderbox',
  'Lantern',
  'Oil Flask',
  'Iron Spikes (10)',
  'Chalk',
  'Hammer',
  'Pitons (10)',
  'Crowbar',
  'Grappling Hook',
  'Leather Pouch',
  'Belt Pouch',
  'Sack',
  'Vial',
  'Iron Pot',
  'Blanket',
  'Canvas (1 sq. yd.)',
  'Chain (10 ft)',
  'Manacles',
  'Mirror, Steel',
  'Fishing Tackle',
  'Shovel',
  'Ladder (10 ft)',
  'Barrel',
  'Bucket',
  'Bottle, Glass',
  'Jug',
  'Mug',
  'Basket',
  'Bell',
  'Candle',
  'Hourglass',
  'Ink',
  'Ink Pen',
  'Paper (sheet)',
  'Parchment (sheet)',
  'Sealing Wax',
  'Soap',
  'Whetstone',
];

const COMMON_WEAPONS = [
  'Dagger',
  'Club',
  'Quarterstaff',
  'Handaxe',
  'Javelin',
  'Mace',
  'Spear',
  'Shortbow',
  'Shortsword',
  'Light Crossbow',
];

const COMMON_ARMOR = ['Padded Armor', 'Leather Armor', 'Hide Armor', 'Shield'];

const TRINKETS = [
  'A small silver coin with a mysterious symbol',
  'A tarnished brass ring',
  'A carved wooden figurine',
  'A smooth river stone',
  'A small vial of colored sand',
  'A faded playing card',
  'A piece of polished bone',
  'A copper locket',
  'A pressed flower',
  'A small iron key',
  'A leather bracelet',
  'A lucky coin',
  'A glass marble',
  'A rusty nail',
  'A colorful feather',
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateCoins(partyLevel: number): string {
  const baseCopper = Math.floor(Math.random() * (10 * partyLevel + 10));
  const baseSilver = Math.floor(Math.random() * (5 * partyLevel + 5));
  const baseGold = Math.floor(Math.random() * Math.max(1, partyLevel));

  const parts: string[] = [];
  if (baseGold > 0) parts.push(`${baseGold} gp`);
  if (baseSilver > 0) parts.push(`${baseSilver} sp`);
  if (baseCopper > 0) parts.push(`${baseCopper} cp`);

  return parts.length > 0 ? parts.join(', ') : '0 cp';
}

export function generateFreeLoot(
  partyLevel: number,
  itemCount: number,
): LootItemType[] {
  const loot: LootItemType[] = [];

  loot.push({
    level: `${partyLevel}`,
    coins: generateCoins(partyLevel),
    item: 'Coins',
    description: 'Currency found on the creature or in the area',
    note: '',
    source: 'Free',
    rarity: 'Common',
  });

  for (let i = 0; i < itemCount; i++) {
    const roll = Math.random();
    let item: string;
    let description: string;
    let category: string;

    if (roll < 0.5) {
      item = getRandomElement(MUNDANE_ITEMS);
      description = 'A useful adventuring item';
      category = 'Mundane Item';
    } else if (roll < 0.7) {
      item = getRandomElement(COMMON_WEAPONS);
      description = 'A basic weapon';
      category = 'Weapon';
    } else if (roll < 0.85) {
      item = getRandomElement(COMMON_ARMOR);
      description = 'Basic protective gear';
      category = 'Armor';
    } else {
      item = getRandomElement(TRINKETS);
      description = 'A curious trinket';
      category = 'Trinket';
    }

    loot.push({
      level: `${partyLevel}`,
      coins: '',
      item,
      description,
      note: category,
      source: 'Free',
      rarity: 'Common',
    });
  }

  return loot;
}

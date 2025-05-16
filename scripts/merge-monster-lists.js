const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Paths to the monsters JSON files
const srdMonstersFilePath = path.join(
  __dirname,
  '..',
  'data',
  'monsters',
  'srd_5e_monsters.json',
);

const gosMonstersFilePath = path.join(
  __dirname,
  '..',
  'data',
  'monsters',
  'gos_5e_monsters.json',
);

const outputFilePath = path.join(
  __dirname,
  '..',
  'data',
  'monsters',
  'merged_monsters.json',
);

// Function to create a deterministic ID based on the monster name
function createDeterministicId(name) {
  const hash = crypto.createHash('md5').update(name).digest('hex');
  return hash.substring(0, 24); // Use first 24 chars for MongoDB-like ID
}

async function mergeMonsterLists() {
  try {
    // Read the SRD monsters file
    console.log('Reading SRD monsters file...');
    const srdData = fs.readFileSync(srdMonstersFilePath, 'utf8');
    const srdMonsters = JSON.parse(srdData);

    console.log(`Found ${srdMonsters.length} SRD monsters`);

    // Read the GoS monsters file
    console.log('Reading GoS monsters file...');
    const gosData = fs.readFileSync(gosMonstersFilePath, 'utf8');
    const gosMonsters = JSON.parse(gosData);

    console.log(`Found ${gosMonsters.length} GoS monsters`);

    // Update the _id field in GoS monsters to be MongoDB-style IDs
    const updatedGosMonsters = gosMonsters.map((monster) => {
      // Replace the numeric ID with a MongoDB-style ID
      return {
        ...monster,
        _id: createDeterministicId(monster.name),
      };
    });

    // Create a Map to track monsters by name to avoid duplicates
    const monsterMap = new Map();

    // Add all SRD monsters to the map
    srdMonsters.forEach((monster) => {
      monsterMap.set(monster.name.toLowerCase(), monster);
    });

    // Add all GoS monsters to the map (will overwrite any duplicates)
    updatedGosMonsters.forEach((monster) => {
      monsterMap.set(monster.name.toLowerCase(), monster);
    });

    // Convert the map values back to an array
    const mergedMonsters = Array.from(monsterMap.values());

    // Sort by name for easier browsing
    mergedMonsters.sort((a, b) => a.name.localeCompare(b.name));

    console.log(
      `Merged list contains ${mergedMonsters.length} unique monsters`,
    );

    // Write the merged data to the output file
    console.log('Writing merged monsters file...');
    fs.writeFileSync(
      outputFilePath,
      JSON.stringify(mergedMonsters, null, 2),
      'utf8',
    );

    console.log('Successfully merged monster lists!');
  } catch (error) {
    console.error('Error merging monster lists:', error);
  }
}

// Run the function
mergeMonsterLists();

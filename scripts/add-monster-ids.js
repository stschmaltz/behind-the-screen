const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Path to the monsters JSON file
const monstersFilePath = path.join(
  __dirname,
  '..',
  'data',
  'monsters',
  'srd_5e_monsters.json',
);

// Function to generate a MongoDB-style ObjectId
function generateMongoId() {
  return crypto.randomBytes(12).toString('hex');
}

// Function to create a deterministic ID based on the monster name
// This ensures the same monster always gets the same ID
function createDeterministicId(name) {
  const hash = crypto.createHash('md5').update(name).digest('hex');
  return hash.substring(0, 24); // Use first 24 chars for MongoDB-like ID
}

async function addIdsToMonsters() {
  try {
    // Read the monsters file
    console.log('Reading monsters file...');
    const data = fs.readFileSync(monstersFilePath, 'utf8');
    const monsters = JSON.parse(data);

    console.log(`Found ${monsters.length} monsters`);

    // Add _id field to each monster
    const updatedMonsters = monsters.map((monster) => {
      // Check if monster already has an _id
      if (!monster._id) {
        return {
          _id: createDeterministicId(monster.name),
          ...monster,
        };
      }
      return monster;
    });

    // Write the updated data back to the file
    console.log('Writing updated monsters file...');
    fs.writeFileSync(
      monstersFilePath,
      JSON.stringify(updatedMonsters, null, 2),
      'utf8',
    );

    console.log('Successfully added _id to all monsters!');
  } catch (error) {
    console.error('Error processing monsters file:', error);
  }
}

// Run the function
addIdsToMonsters();

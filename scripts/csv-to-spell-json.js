const fs = require('fs');
const path = require('path');
const csvFile = path.join(__dirname, '../5e-spells-dnd.csv');

function parseBoolean(val) {
  if (typeof val !== 'string') return false;
  return val.trim().toLowerCase() === 'true';
}

function parseArray(val) {
  if (!val) return [];
  return val
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function cleanField(val) {
  if (val === undefined || val === null) return undefined;
  const trimmed = String(val).trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'false') return undefined;
  return trimmed;
}

function spellFromRow(row, id) {
  const spell = {
    _id: id,
    name: cleanField(row.name),
    level: Number(row.level),
    school: cleanField(row.school),
    components: [
      parseBoolean(row.V) ? 'V' : null,
      parseBoolean(row.S) ? 'S' : null,
      cleanField(row.M) ? 'M' : null,
    ].filter(Boolean),
    material: cleanField(row.M),
    casting_time: cleanField(row.casting_time),
    concentration: parseBoolean(row.concentration),
    duration: cleanField(row.duration),
    range: cleanField(row.range),
    ritual: parseBoolean(row.ritual),
    description: cleanField(row.description),
    higher_levels: cleanField(row.higher_levels),
    classes: parseArray(row.classes),
    book: cleanField(row.book),
  };
  Object.keys(spell).forEach((k) => {
    if (
      spell[k] === undefined ||
      (Array.isArray(spell[k]) && spell[k].length === 0) ||
      spell[k] === ''
    ) {
      delete spell[k];
    }
  });
  return spell;
}

function parseCSV(data) {
  const lines = data.split(/\r?\n/).filter(Boolean);
  const header = lines[0].split(',');
  const rows = lines.slice(1).map((line) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    const row = {};
    header.forEach((h, i) => {
      row[h] = values[i] || '';
    });
    return row;
  });
  return rows;
}

fs.readFile(csvFile, 'utf8', (err, data) => {
  if (err) {
    process.exit(1);
  }
  const rows = parseCSV(data);
  const spells = rows.map((row, i) => spellFromRow(row, i + 1));
  process.stdout.write(JSON.stringify(spells, null, 2));
});

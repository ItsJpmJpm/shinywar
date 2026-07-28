const fs = require('fs');
const code = fs.readFileSync('pokemon-data.js', 'utf8');

const tierEnd = code.indexOf('};');
const before = code.slice(0, tierEnd + 2);
const after = code.slice(tierEnd + 2);

const fn = new Function(before + '; return POKEMON_TIERS;');
const tiers = fn();

const names = new Set();
for (const list of Object.values(tiers)) {
    for (const n of list) names.add(n);
}

const sorted = [...names].sort((a, b) => a.localeCompare(b));
const seasonEntries = sorted.map(n => "    '" + n.replace(/'/g, "\\'") + "': 'all'").join(',\n');

const seasonsBlock = '\n\nconst POKEMON_SEASONS = {\n' + seasonEntries + ',\n};\n';

const funcBlock = '\nfunction getPokemonSeason(pokemonName) {\n    return POKEMON_SEASONS[pokemonName] || "all";\n}\n';

const finalCode = before + after + seasonsBlock + funcBlock;
fs.writeFileSync('pokemon-data.js', finalCode);
console.log('Added ' + names.size + ' entries to POKEMON_SEASONS');

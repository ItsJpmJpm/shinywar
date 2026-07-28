const fs = require('fs');
const code = fs.readFileSync('pokemon-data.js', 'utf8');
const fn = new Function(code + '; return { POKEMON_TIERS, getPokemonTier };');
const { POKEMON_TIERS, getPokemonTier } = fn();

let sql = '-- One-time migration: update all target tiers\n';
sql += '-- Run in Supabase SQL Editor\n\n';

for (const [tier, list] of Object.entries(POKEMON_TIERS)) {
    for (const name of list) {
        const escaped = name.replace(/'/g, "''");
        sql += "UPDATE targets SET tier = '" + tier + "' WHERE pokemon_name = '" + escaped + "';\n";
    }
}

sql += "\n-- Verify\nSELECT pokemon_name, tier FROM targets ORDER BY tier, pokemon_name;\n";
fs.writeFileSync('migrate-tiers.sql', sql);
console.log('Done: ' + (sql.split(';').length - 1) + ' statements');

const fs = require('fs');

const evoCode = fs.readFileSync('./evolution-lines.js', 'utf8');
const match = evoCode.match(/const EVOLUTION_LINES = (\{[\s\S]*?\});/);
const EVOLUTION_LINES = eval('(' + match[1] + ')');

const userTiers = {
    tier0: [
        "Bulbasaur","Charmander","Squirtle","Eevee","Porygon","Snorlax",
        "Chikorita","Cyndaquil","Totodile","Togepi","Tyrogue",
        "Treecko","Torchic","Mudkip","Shedinja","Beldum",
        "Turtwig","Chimchar","Piplup","Riolu","Rotom",
        "Snivy","Tepig","Oshawott"
    ],
    tier1: [
        "Chansey","Kangaskhan","Scyther","Pinsir","Sudowoodo","Skarmory",
        "Shroomish","Slakoth","Skitty","Plusle","Minun",
        "Gulpin","Castform","Absol","Burmy","Combee","Cherubi",
        "Spiritomb","Skorupi","Carnivine","Pansage","Pansear","Panpour",
        "Drilbur","Audino","Ducklett","Emolga","Alomomola","Larvesta"
    ],
    tier2: [
        "Clefairy","Shellder","Mr. Mime","Lapras","Omanyte","Kabuto",
        "Aerodactyl","Aipom","Pineco","Qwilfish","Shuckle","Corsola",
        "Houndour","Miltank","Ralts","Nincada","Lileep","Anorith",
        "Feebas","Relicanth","Bagon","Cranidos","Shieldon","Tirtouga",
        "Archen","Zorua","Pawniard"
    ],
    tier3: [
        "Vulpix","Growlithe","Farfetch'd","Exeggcute","Staryu","Jynx",
        "Magmar","Dratini","Sentret","Ledyba","Sunkern","Murkrow",
        "Misdreavus","Gligar","Heracross","Remoraid","Delibird","Mantine",
        "Nosepass","Volbeat","Illumise","Carvanha","Wailmer","Cacnea",
        "Zangoose","Seviper","Barboach","Kecleon","Tropius","Chimecho",
        "Luvdisc","Drifloon","Stunky","Chatot","Gible","Croagunk",
        "Finneon","Darumaka","Maractus","Sigilyph","Cryogonal"
    ],
    tier4: [
        "Oddish","Venonat","Meowth","Drowzee","Electabuzz","Hoothoot",
        "Spinarak","Wooper","Snubbull","Sneasel","Larvitar","Lotad",
        "Surskit","Spinda","Trapinch","Lunatone","Corphish","Kricketot",
        "Pachirisu","Buneary","Purrloin","Pidove","Scraggy","Axew",
        "Bouffalant","Rufflet","Heatmor","Deino"
    ],
    tier5: [
        "Caterpie","Weedle","Pikachu","Nidoran\u2642","Jigglypuff","Paras",
        "Bellsprout","Horsea","Natu","Hoppip","Teddiursa","Wurmple",
        "Taillow","Numel","Swablu","Snorunt","Starly","Hippopotas",
        "Lillipup","Timburr","Throh","Sawk","Venipede","Cottonee",
        "Dwebble","Trubbish","Karrablast","Foongus","Joltik","Ferroseed",
        "Tynamo","Cubchoo","Shelmet"
    ],
    tier6: [
        "Pidgey","Spearow","Ekans","Nidoran\u2640","Diglett","Mankey",
        "Abra","Ponyta","Doduo","Grimer","Cubone","Lickitung",
        "Tangela","Ditto","Chinchou","Mareep","Slugma","Phanpy",
        "Stantler","Poochyena","Zigzagoon","Wingull","Whismur","Makuhita",
        "Sableye","Mawile","Aron","Electrike","Roselia","Spoink",
        "Solrock","Clamperl","Bidoof","Shinx","Snover","Patrat",
        "Munna","Blitzle","Roggenrola","Woobat","Tympole","Sewaddle",
        "Minccino","Gothita","Solosis","Vanillite","Klink","Elgyem",
        "Stunfisk","Druddigon","Vullaby","Durant"
    ],
    tier7: [
        "Rattata","Sandshrew","Zubat","Psyduck","Poliwag","Machop",
        "Tentacool","Geodude","Slowpoke","Magnemite","Seel","Gastly",
        "Onix","Krabby","Voltorb","Koffing","Rhyhorn","Goldeen",
        "Magikarp","Marill","Unown","Wobbuffet","Girafarig","Dunsparce",
        "Swinub","Smeargle","Seedot","Meditite","Torkoal","Baltoy",
        "Shuppet","Duskull","Spheal","Buizel","Shellos","Glameow",
        "Bronzor","Basculin","Sandile","Yamask","Deerling","Frillish",
        "Litwick","Mienfoo","Golett"
    ]
};

const legendaries = [
    "Articuno","Zapdos","Moltres","Mewtwo","Mew",
    "Raikou","Entei","Suicune","Lugia","Ho-Oh","Celebi",
    "Regirock","Regice","Registeel","Latias","Latios",
    "Kyogre","Groudon","Rayquaza","Jirachi","Deoxys",
    "Uxie","Mesprit","Azelf","Dialga","Palkia",
    "Heatran","Regigigas","Giratina","Cresselia",
    "Phione","Manaphy","Darkrai","Shaymin","Arceus",
    "Victini","Cobalion","Terrakion","Virizion",
    "Tornadus","Thundurus","Landorus",
    "Reshiram","Zekrom","Kyurem",
    "Keldeo","Meloetta","Genesect"
];

// Build tiers
const baseToTier = {};
for (const [tier, list] of Object.entries(userTiers)) {
    for (const name of list) baseToTier[name] = tier;
}

const POKEMON_TIERS = { tier0: [], tier1: [], tier2: [], tier3: [], tier4: [], tier5: [], tier6: [], tier7: [], legendary: [] };

for (const name of legendaries) POKEMON_TIERS.legendary.push(name);

for (const [tier, list] of Object.entries(userTiers)) {
    for (const name of list) {
        if (!POKEMON_TIERS[tier].includes(name)) POKEMON_TIERS[tier].push(name);
    }
}

const assigned = new Set();
for (const [tier, list] of Object.entries(userTiers)) {
    for (const name of list) assigned.add(name.toLowerCase());
}
for (const name of legendaries) assigned.add(name.toLowerCase());

for (const [evo, base] of Object.entries(EVOLUTION_LINES)) {
    if (assigned.has(evo.toLowerCase())) continue;
    let tier = null;
    for (const [t, list] of Object.entries(userTiers)) {
        if (list.some(n => n.toLowerCase() === base.toLowerCase())) { tier = t; break; }
    }
    if (!tier && legendaries.some(n => n.toLowerCase() === base.toLowerCase())) tier = 'legendary';
    if (tier) {
        if (!POKEMON_TIERS[tier].includes(evo)) POKEMON_TIERS[tier].push(evo);
        assigned.add(evo.toLowerCase());
    }
}

for (const [evo, base] of Object.entries(EVOLUTION_LINES)) {
    if (!assigned.has(evo.toLowerCase())) {
        if (!POKEMON_TIERS.tier7.includes(evo)) POKEMON_TIERS.tier7.push(evo);
        assigned.add(evo.toLowerCase());
    }
}

for (const tier of Object.keys(POKEMON_TIERS)) {
    POKEMON_TIERS[tier].sort((a, b) => a.localeCompare(b));
}

// Build seasons map (all default to "all")
const allNames = [];
for (const list of Object.values(POKEMON_TIERS)) {
    for (const n of list) allNames.push(n);
}
allNames.sort((a, b) => a.localeCompare(b));

const seasonEntries = allNames.map(n => '    "' + n.replace(/"/g, '\\"') + '": "all"').join(',\n');

// Generate the file
const tierEntries = Object.entries(POKEMON_TIERS).map(([tier, list]) => {
    const names = list.map(n => '        "' + n.replace(/"/g, '\\"') + '"').join(',\n');
    return '    ' + tier + ': [\n' + names + ',\n    ]';
}).join(',\n');

const js = `const POKEMON_TIERS = {
${tierEntries},
};

const TIER_POINTS = {
    "legendary": 200,
    "tier0": 50,
    "tier1": 45,
    "tier2": 40,
    "tier3": 30,
    "tier4": 15,
    "tier5": 10,
    "tier6": 5,
    "tier7": 3
};

const METHOD_BONUS = {
    "wild": 0,
    "egg": 35,
    "safari": 10,
    "secret": 20
};

const TIER_COLORS = {
    "legendary": "#fbbf24",
    "tier0": "#ef4444",
    "tier1": "#f97316",
    "tier2": "#eab308",
    "tier3": "#84cc16",
    "tier4": "#22c55e",
    "tier5": "#14b8a6",
    "tier6": "#06b6d4",
    "tier7": "#64748b"
};

const POKEMON_SEASONS = {
${seasonEntries},
};

const SEASON_LABELS = {
    "all": "Todas",
    "spring": "Primavera",
    "summer": "Verano",
    "autumn": "Otono",
    "winter": "Invierno"
};

function getPokemonTier(pokemonName) {
    const name = pokemonName.toLowerCase();
    for (const [tier, list] of Object.entries(POKEMON_TIERS)) {
        if (list.some(p => p.toLowerCase() === name)) {
            return tier;
        }
    }
    return null;
}

function getPokemonSeason(pokemonName) {
    return POKEMON_SEASONS[pokemonName] || "all";
}

function getSeasonLabel(season) {
    return SEASON_LABELS[season] || "Todas";
}

function calculatePoints(tier, method, isAlpha, isSecret) {
    const normalizedTier = tier && !tier.startsWith('tier') && tier !== 'legendary' && tier !== 'alpha' ? 'tier' + tier : tier;
    let base = isAlpha ? 75 : (TIER_POINTS[normalizedTier] || TIER_POINTS[tier] || 0);
    if (method === "egg") base = Math.max(35, base);
    if (method === "safari") base += 10;
    if (isSecret) base += 20;
    return base;
}

function getEvolutionLine(pokemonName) {
    const key = pokemonName.toLowerCase();
    for (const [name, line] of Object.entries(EVOLUTION_LINES)) {
        if (name.toLowerCase() === key) return line;
    }
    return pokemonName;
}

function calculateTeamScore(allTargets) {
    const caught = allTargets.filter(t => t.caught);
    if (caught.length === 0) return { total: 0, base: 0, methodBonus: 0, uniqueBonus: 0, duplicateCount: 0, perPlayer: {}, uniqueLines: [], caughtCount: 0 };
    let base = 0, methodBonus = 0;
    const perPlayer = {}, allLines = new Set(), pokemonCatchers = {};
    let duplicateCount = 0;
    caught.forEach(t => {
        const key = t.pokemon_name.toLowerCase();
        if (!pokemonCatchers[key]) pokemonCatchers[key] = [];
        pokemonCatchers[key].push(t);
    });
    caught.forEach(t => {
        const line = getEvolutionLine(t.pokemon_name);
        const method = t.method || 'wild';
        const key = t.pokemon_name.toLowerCase();
        const isDuplicate = pokemonCatchers[key].length > 1 && pokemonCatchers[key][0] !== t;
        let pts;
        if (isDuplicate) {
            pts = t.is_alpha ? 35 : 1;
            duplicateCount++;
        } else {
            let b = t.is_alpha ? 75 : (TIER_POINTS[t.tier] || 0);
            if (method === 'egg') b = Math.max(35, b);
            if (method === 'safari') b += 10;
            if (t.is_secret) b += 20;
            pts = b;
        }
        const rawBase = t.is_alpha ? 75 : (TIER_POINTS[t.tier] || 0);
        base += isDuplicate ? pts : rawBase;
        if (!isDuplicate) methodBonus += (pts - rawBase);
        allLines.add(line);
        if (!perPlayer[t.user_id]) perPlayer[t.user_id] = [];
        perPlayer[t.user_id].push({ ...t, line, points: pts, isDuplicate });
    });
    const uniqueLines = [...allLines];
    return { total: base + methodBonus + uniqueLines.length * 8, base, methodBonus, uniqueBonus: uniqueLines.length * 8, duplicateCount, uniqueLines, caughtCount: caught.length };
}

function calculatePlayerScore(playerTargets, allTargets) {
    const caught = playerTargets.filter(t => t.caught);
    if (caught.length === 0) return { total: 0, base: 0, methodBonus: 0, uniqueBonus: 0, caughtCount: 0 };
    const teamCaught = allTargets.filter(t => t.caught);
    const teamLines = new Set();
    teamCaught.forEach(t => teamLines.add(getEvolutionLine(t.pokemon_name)));
    const pokemonCatchers = {};
    teamCaught.forEach(t => {
        const key = t.pokemon_name.toLowerCase();
        if (!pokemonCatchers[key]) pokemonCatchers[key] = [];
        pokemonCatchers[key].push(t);
    });
    let base = 0, methodBonus = 0;
    caught.forEach(t => {
        const method = t.method || 'wild';
        const key = t.pokemon_name.toLowerCase();
        const isDuplicate = pokemonCatchers[key] && pokemonCatchers[key].length > 1;
        let pts;
        if (isDuplicate) {
            pts = t.is_alpha ? 35 : 1;
        } else {
            let b = t.is_alpha ? 75 : (TIER_POINTS[t.tier] || 0);
            if (method === 'egg') b = Math.max(35, b);
            if (method === 'safari') b += 10;
            if (t.is_secret) b += 20;
            pts = b;
        }
        const rawBase = t.is_alpha ? 75 : (TIER_POINTS[t.tier] || 0);
        base += isDuplicate ? pts : rawBase;
        if (!isDuplicate) methodBonus += (pts - rawBase);
    });
    let uniqueBonus = 0;
    const playerLines = new Set();
    caught.forEach(t => playerLines.add(getEvolutionLine(t.pokemon_name)));
    playerLines.forEach(line => { if (teamLines.has(line)) uniqueBonus += 8; });
    return { total: base + methodBonus + uniqueBonus, base, methodBonus, uniqueBonus, caughtCount: caught.length };
}

function searchPokemon(query) {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase();
    const results = [], seen = new Set();
    for (const [tier, list] of Object.entries(POKEMON_TIERS)) {
        for (const name of list) {
            if (name.toLowerCase().includes(q) && !seen.has(name.toLowerCase())) {
                seen.add(name.toLowerCase());
                results.push({ name, tier, points: TIER_POINTS[tier] || 0 });
            }
        }
    }
    results.sort((a, b) => b.points - a.points);
    return results.slice(0, 30);
}

function suggestPokemon(query) {
    return searchPokemon(query);
}
`;

fs.writeFileSync('pokemon-data.js', js);
console.log('Done! Tiers: ' + Object.values(POKEMON_TIERS).reduce((a,l) => a+l.length, 0) + ' Pokemon');

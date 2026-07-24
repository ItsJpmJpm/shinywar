const POKEMON_TIERS = {
    tier0: [
        "Bayleef","Beldum","Blastoise","Blaziken","Bulbasaur","Charizard","Charmander","Charmeleon","Chikorita","Chimchar"
        "Combusken","Croconaw","Cyndaquil","Dewott","Eevee","Emboar","Empoleon","Espeon","Feraligatr","Flareon"
        "Glaceon","Grotle","Grovyle","Hitmonchan","Hitmonlee","Hitmontop","Infernape","Ivysaur","Jolteon","Leafeon"
        "Lucario","Marshtomp","Meganium","Metagross","Metang","Monferno","Mudkip","Munchlax","Oshawott","Pignite"
        "Piplup","Porygon","Porygon-Z","Porygon2","Prinplup","Quilava","Riolu","Rotom","Samurott","Sceptile"
        "Serperior","Servine","Shedinja","Snivy","Snorlax","Squirtle","Swampert","Tepig","Togekiss","Togepi"
        "Togetic","Torchic","Torterra","Totodile","Treecko","Turtwig","Typhlosion","Tyrogue","Umbreon","Vaporeon"
        "Venusaur","Wartortle"
    ],
    tier1: [
        "Absol","Alomomola","Audino","Blissey","Breloom","Burmy","Carnivine","Castform","Chansey","Cherrim"
        "Cherubi","Combee","Delcatty","Drapion","Drilbur","Ducklett","Emolga","Excadrill","Gulpin","Kangaskhan"
        "Larvesta","Minun","Mothim","Panpour","Pansage","Pansear","Pinsir","Plusle","Scizor","Scyther"
        "Shroomish","Simipour","Simisage","Simisear","Skarmory","Skitty","Skorupi","Slaking","Slakoth","Spiritomb"
        "Sudowoodo","Swalot","Swanna","Vespiquen","Vigoroth","Volcarona","Wormadam"
    ],
    tier2: [
        "Aerodactyl","Aipom","Ambipom","Anorith","Archen","Archeops","Armaldo","Bagon","Bastiodon","Bisharp"
        "Carracosta","Clefable","Clefairy","Cleffa","Cloyster","Corsola","Cradily","Cranidos","Feebas","Forretress"
        "Gallade","Gardevoir","Houndoom","Houndour","Kabuto","Kabutops","Kirlia","Lapras","Lileep","Milotic"
        "Miltank","Mr. Mime","Nincada","Ninjask","Omanyte","Omastar","Pawniard","Pineco","Qwilfish","Ralts"
        "Rampardos","Relicanth","Salamence","Shelgon","Shellder","Shieldon","Shuckle","Tirtouga"
    ],
    tier3: [
        "Arcanine","Barboach","Cacnea","Cacturne","Carvanha","Chatot","Chimecho","Croagunk","Cryogonal","Darmanitan"
        "Darumaka","Delibird","Dragonair","Dragonite","Dratini","Drifblim","Drifloon","Exeggcute","Exeggutor","Farfetch'd"
        "Finneon","Furret","Gligar","Gliscor","Growlithe","Heracross","Honchkrow","Illumise","Jynx","Kecleon"
        "Ledian","Ledyba","Lumineon","Luvdisc","Magby","Magmar","Magmortar","Mantine","Maractus","Misdreavus"
        "Mismagius","Murkrow","Ninetales","Nosepass","Octillery","Probopass","Remoraid","Sentret","Seviper","Sharpedo"
        "Sigilyph","Skuntank","Smoochum","Starmie","Staryu","Stunky","Sunflora","Sunkern","Toxicroak","Tropius"
        "Volbeat","Vulpix","Wailmer","Wailord","Whiscash","Zangoose"
    ],
    tier4: [
        "Ariados","Axew","Bellossom","Bouffalant","Braviary","Buneary","Corphish","Crawdaunt","Deino","Drowzee"
        "Electabuzz","Electivire","Elekid","Flygon","Fraxure","Gloom","Granbull","Haxorus","Heatmor","Hoothoot"
        "Hydreigon","Hypno","Kricketot","Kricketune","Larvitar","Liepard","Lombre","Lopunny","Lotad","Ludicolo"
        "Lunatone","Masquerain","Meowth","Noctowl","Oddish","Pachirisu","Persian","Pidove","Pupitar","Purrloin"
        "Quagsire","Rufflet","Scrafty","Scraggy","Sneasel","Snubbull","Spinarak","Spinda","Surskit","Tranquill"
        "Trapinch","Tyranitar","Unfezant","Venomoth","Venonat","Vibrava","Vileplume","Weavile","Wooper","Zweilous"
    ],
    tier5: [
        "Accelgor","Altaria","Amoonguss","Beartic","Beautifly","Beedrill","Bellsprout","Butterfree","Camerupt","Cascoon"
        "Caterpie","Conkeldurr","Cottonee","Crustle","Cubchoo","Dustox","Dwebble","Eelektrik","Eelektross","Escavalier"
        "Ferroseed","Ferrothorn","Foongus","Froslass","Galvantula","Garbodor","Glalie","Gurdurr","Herdier","Hippopotas"
        "Hippowdon","Hoppip","Horsea","Igglybuff","Jigglypuff","Joltik","Jumpluff","Kakuna","Karrablast","Kingdra"
        "Lillipup","Metapod","Natu","Nidoking","Nidoran♂","Nidorino","Numel","Paras","Parasect","Pichu"
        "Pikachu","Raichu","Sawk","Scolipede","Seadra","Shelmet","Silcoon","Skiploom","Snorunt","Staraptor"
        "Staravia","Starly","Stoutland","Swablu","Swellow","Taillow","Teddiursa","Throh","Timburr","Trubbish"
        "Tynamo","Ursaring","Venipede","Victreebel","Weedle","Weepinbell","Whimsicott","Whirlipede","Wigglytuff","Wurmple"
        "Xatu"
    ],
    tier6: [
        "Abomasnow","Abra","Aggron","Alakazam","Ampharos","Arbok","Aron","Beheeyem","Bibarel","Bidoof"
        "Blitzle","Boldore","Chinchou","Cinccino","Clamperl","Cubone","Diglett","Ditto","Dodrio","Doduo"
        "Donphan","Druddigon","Dugtrio","Duosion","Durant","Ekans","Electrike","Elgyem","Fearow","Flaaffy"
        "Gigalith","Gorebyss","Gothita","Gothitelle","Gothorita","Grimer","Grumpig","Hariyama","Huntail","Kadabra"
        "Klang","Klink","Klinklang","Lairon","Lanturn","Leavanny","Lickilicky","Lickitung","Linoone","Luxio"
        "Luxray","Magcargo","Makuhita","Mandibuzz","Manectric","Mankey","Mareep","Marowak","Mawile","Mightyena"
        "Minccino","Muk","Munna","Musharna","Nidoqueen","Nidoran♀","Nidorina","Palpitoad","Patrat","Pelipper"
        "Phanpy","Pidgeot","Pidgeotto","Pidgey","Ponyta","Poochyena","Primeape","Rapidash","Reuniclus","Roggenrola"
        "Roselia","Roserade","Sableye","Seismitoad","Sewaddle","Shinx","Slugma","Snover","Solosis","Solrock"
        "Spearow","Spoink","Stantler","Stunfisk","Swadloon","Swoobat","Tangela","Tangrowth","Tympole","Vanillish"
        "Vanillite","Vanilluxe","Vullaby","Watchog","Whismur","Wingull","Woobat","Zebstrika","Zigzagoon"
    ],
    tier7: [
        "Azumarill","Azurill","Baltoy","Banette","Basculin","Bonsly","Bronzong","Bronzor","Budew","Buizel"
        "Chandelure","Chingling","Claydol","Cofagrigus","Crobat","Deerling","Dewgong","Dunsparce","Dusclops","Dusknoir"
        "Duskull","Electrode","Floatzel","Frillish","Gabite","Garchomp","Gastly","Gastrodon","Gengar","Geodude"
        "Gible","Girafarig","Glameow","Golbat","Goldeen","Golduck","Golem","Golett","Golurk","Graveler"
        "Gyarados","Happiny","Haunter","Jellicent","Kingler","Koffing","Krabby","Krokorok","Krookodile","Lampent"
        "Lilligant","Litwick","Machamp","Machoke","Machop","Magikarp","Magnemite","Magneton","Mamoswine","Mantyke"
        "Marill","Medicham","Meditite","Mienfoo","Mienshao","Mime Jr.","Nuzleaf","Onix","Petilil","Piloswine"
        "Politoed","Poliwag","Poliwhirl","Poliwrath","Psyduck","Purugly","Raticate","Rattata","Rhydon","Rhyhorn"
        "Rhyperior","Sandile","Sandshrew","Sandslash","Sawsbuck","Seaking","Sealeo","Seedot","Seel","Shellos"
        "Shiftry","Shuppet","Slowbro","Slowking","Slowpoke","Smeargle","Spheal","Steelix","Swinub","Tauros"
        "Tentacool","Tentacruel","Torkoal","Unown","Voltorb","Walrein","Weezing","Wobbuffet","Wynaut","Yamask"
        "Yanma","Yanmega","Zoroark","Zorua","Zubat"
    ],
    legendary: [
        "Arceus","Articuno","Azelf","Celebi","Cobalion","Cresselia","Darkrai","Deoxys","Dialga","Entei"
        "Genesect","Giratina","Groudon","Heatran","Ho-Oh","Jirachi","Keldeo","Kyogre","Kyurem","Landorus"
        "Latias","Latios","Lugia","Manaphy","Meloetta","Mesprit","Mew","Mewtwo","Moltres","Palkia"
        "Phione","Raikou","Rayquaza","Regice","Regigigas","Regirock","Registeel","Reshiram","Shaymin","Suicune"
        "Terrakion","Thundurus","Tornadus","Uxie","Victini","Virizion","Zapdos","Zekrom"
    ]
};

const TIER_POINTS = {
    "legendary": 200,
    "alpha": 75,
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
    "alpha": "#f472b6",
    "tier0": "#ef4444",
    "tier1": "#f97316",
    "tier2": "#eab308",
    "tier3": "#84cc16",
    "tier4": "#22c55e",
    "tier5": "#14b8a6",
    "tier6": "#06b6d4",
    "tier7": "#64748b"
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

    let base = 0;
    let methodBonus = 0;
    const perPlayer = {};
    const allLines = new Set();
    const pokemonCatchers = {};
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
        const isAlphaCatch = t.is_alpha;
        const isSecretCatch = t.is_secret;
        let pts;
        if (isDuplicate) {
            pts = isAlphaCatch ? 35 : 1;
            duplicateCount++;
        } else {
            let basePts = isAlphaCatch ? 75 : (TIER_POINTS[t.tier] || 0);
            if (method === 'egg') basePts = Math.max(35, basePts);
            if (method === 'safari') basePts += 10;
            if (isSecretCatch) basePts += 20;
            pts = basePts;
        }
        const rawBase = isAlphaCatch ? 75 : (TIER_POINTS[t.tier] || 0);
        base += isDuplicate ? pts : rawBase;
        if (!isDuplicate) methodBonus += (pts - rawBase);
        allLines.add(line);

        if (!perPlayer[t.user_id]) perPlayer[t.user_id] = [];
        perPlayer[t.user_id].push({ ...t, line, points: pts, isDuplicate });
    });

    const uniqueLines = [...allLines];
    const uniqueBonus = uniqueLines.length * 8;

    return {
        total: base + methodBonus + uniqueBonus,
        base,
        methodBonus,
        uniqueBonus,
        duplicateCount,
        uniqueLines,
        caughtCount: caught.length
    };
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

    let base = 0;
    let methodBonus = 0;

    caught.forEach(t => {
        const method = t.method || 'wild';
        const key = t.pokemon_name.toLowerCase();
        const isDuplicate = pokemonCatchers[key] && pokemonCatchers[key].length > 1;
        const isAlphaCatch = t.is_alpha;
        const isSecretCatch = t.is_secret;
        let pts;
        if (isDuplicate) {
            pts = isAlphaCatch ? 35 : 1;
        } else {
            let basePts = isAlphaCatch ? 75 : (TIER_POINTS[t.tier] || 0);
            if (method === 'egg') basePts = Math.max(35, basePts);
            if (method === 'safari') basePts += 10;
            if (isSecretCatch) basePts += 20;
            pts = basePts;
        }
        const rawBase = isAlphaCatch ? 75 : (TIER_POINTS[t.tier] || 0);
        base += isDuplicate ? pts : rawBase;
        if (!isDuplicate) methodBonus += (pts - rawBase);
    });

    let uniqueBonus = 0;
    const playerLines = new Set();
    caught.forEach(t => {
        const line = getEvolutionLine(t.pokemon_name);
        playerLines.add(line);
    });
    playerLines.forEach(line => {
        if (teamLines.has(line)) uniqueBonus += 8;
    });

    return {
        total: base + methodBonus + uniqueBonus,
        base,
        methodBonus,
        uniqueBonus,
        caughtCount: caught.length
    };
}

function searchPokemon(query) {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase();
    const results = [];
    const seen = new Set();

    for (const [tier, list] of Object.entries(POKEMON_TIERS)) {
        for (const name of list) {
            if (name.toLowerCase().includes(q) && !seen.has(name.toLowerCase())) {
                seen.add(name.toLowerCase());
                results.push({
                    name,
                    tier,
                    points: TIER_POINTS[tier] || 0
                });
            }
        }
    }

    results.sort((a, b) => b.points - a.points);
    return results.slice(0, 30);
}

function suggestPokemon(query) {
    return searchPokemon(query);
}

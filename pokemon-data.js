const POKEMON_TIERS = {
    // TODO: el usuario define los tiers — todos empiezan en tier7
    tier7: [
        "Abomasnow","Abra","Absol","Accelgor","Aerodactyl","Aggron","Aipom","Alakazam","Alomomola",
        "Altaria","Ambipom","Amoonguss","Ampharos","Anorith","Arbok","Arcanine","Archen","Archeops",
        "Ariados","Armaldo","Aron","Audino","Axew","Azumarill","Azurill","Bagon","Baltoy","Banette",
        "Barboach","Basculin","Bastiodon","Bayleef","Beartic","Beautifly","Beedrill","Beheeyem",
        "Beldum","Bellossom","Bellsprout","Bibarel","Bidoof","Bisharp","Blastoise","Blaziken",
        "Blissey","Blitzle","Boldore","Bonsly","Bouffalant","Braviary","Breloom","Bronzong",
        "Bronzor","Budew","Buizel","Bulbasaur","Buneary","Burmy","Butterfree","Cacnea","Cacturne",
        "Camerupt","Carnivine","Carracosta","Carvanha","Cascoon","Castform","Caterpie","Chandelure",
        "Chansey","Charizard","Charmander","Charmeleon","Chatot","Cherrim","Cherubi","Chikorita",
        "Chimchar","Chimecho","Chinchou","Chingling","Cinccino","Clamperl","Claydol","Clefable",
        "Clefairy","Cleffa","Cloyster","Cofagrigus","Combee","Combusken","Conkeldurr","Corphish",
        "Corsola","Cottonee","Cradily","Cranidos","Crawdaunt","Croagunk","Crobat","Croconaw",
        "Crustle","Cryogonal","Cubchoo","Cubone","Cyndaquil","Darmanitan","Darumaka","Deerling",
        "Deino","Delcatty","Delibird","Dewgong","Dewott","Diglett","Ditto","Dodrio","Doduo",
        "Donphan","Dragonair","Dragonite","Drapion","Dratini","Drifblim","Drifloon","Drilbur",
        "Drowzee","Druddigon","Ducklett","Dugtrio","Dunsparce","Duosion","Durant","Dusclops",
        "Dusknoir","Duskull","Dustox","Dwebble","Eelektrik","Eelektross","Eevee","Ekans",
        "Electabuzz","Electivire","Electrike","Electrode","Elekid","Elgyem","Emboar","Emolga",
        "Empoleon","Escavalier","Espeon","Excadrill","Exeggcute","Exeggutor","Farfetch'd","Fearow",
        "Feebas","Feraligatr","Ferroseed","Ferrothorn","Finneon","Flaaffy","Flareon","Floatzel",
        "Flygon","Foongus","Forretress","Fraxure","Frillish","Froslass","Furret","Gabite","Gallade",
        "Galvantula","Garbodor","Garchomp","Gardevoir","Gastly","Gastrodon","Gengar","Geodude",
        "Gible","Gigalith","Girafarig","Glaceon","Glalie","Glameow","Gligar","Gliscor","Gloom",
        "Golbat","Goldeen","Golduck","Golem","Golett","Golurk","Gorebyss","Gothita","Gothitelle",
        "Gothorita","Granbull","Graveler","Grimer","Grotle","Grovyle","Growlithe","Grumpig","Gulpin",
        "Gurdurr","Gyarados","Happiny","Hariyama","Haunter","Haxorus","Heatmor","Heracross",
        "Herdier","Hippopotas","Hippowdon","Hitmonchan","Hitmonlee","Hitmontop","Honchkrow",
        "Hoothoot","Hoppip","Horsea","Houndoom","Houndour","Huntail","Hydreigon","Hypno","Igglybuff",
        "Illumise","Infernape","Ivysaur","Jellicent","Jigglypuff","Jolteon","Joltik","Jumpluff",
        "Jynx","Kabuto","Kabutops","Kadabra","Kakuna","Kangaskhan","Karrablast","Kecleon","Kingdra",
        "Kingler","Kirlia","Klang","Klink","Klinklang","Koffing","Krabby","Kricketot","Kricketune",
        "Krokorok","Krookodile","Lairon","Lampent","Lanturn","Lapras","Larvesta","Larvitar",
        "Leafeon","Leavanny","Ledian","Ledyba","Lickilicky","Lickitung","Liepard","Lileep",
        "Lilligant","Lillipup","Linoone","Litwick","Lombre","Lopunny","Lotad","Lucario","Ludicolo",
        "Lumineon","Lunatone","Luvdisc","Luxio","Luxray","Machamp","Machoke","Machop","Magby",
        "Magcargo","Magikarp","Magmar","Magmortar","Magnemite","Magneton","Makuhita","Mamoswine",
        "Mandibuzz","Manectric","Mankey","Mantine","Mantyke","Maractus","Mareep","Marill","Marowak",
        "Marshtomp","Masquerain","Mawile","Medicham","Meditite","Meganium","Meowth","Metagross",
        "Metang","Metapod","Mienfoo","Mienshao","Mightyena","Milotic","Miltank","Mime Jr.",
        "Minccino","Minun","Misdreavus","Mismagius","Monferno","Mothim","Mr. Mime","Mudkip","Muk",
        "Munchlax","Munna","Murkrow","Musharna","Natu","Nidoking","Nidoqueen","Nidoran♀","Nidoran♂",
        "Nidorina","Nidorino","Nincada","Ninjask","Ninetales","Noctowl","Nosepass","Numel","Nuzleaf","Octillery",
        "Oddish","Omanyte","Omastar","Onix","Oshawott","Pachirisu","Palpitoad","Panpour","Pansage",
        "Pansear","Paras","Parasect","Patrat","Pawniard","Pelipper","Persian","Petilil","Phanpy",
        "Pichu","Pidgeot","Pidgeotto","Pidgey","Pidove","Pignite","Pikachu","Piloswine","Pineco",
        "Pinsir","Piplup","Plusle","Politoed","Poliwag","Poliwhirl","Poliwrath","Ponyta","Poochyena",
        "Porygon","Porygon-Z","Porygon2","Primeape","Prinplup","Probopass","Psyduck","Pupitar",
        "Purrloin","Purugly","Quagsire","Quilava","Qwilfish","Raichu","Ralts","Rampardos","Rapidash",
        "Raticate","Rattata","Relicanth","Remoraid","Reuniclus","Rhydon","Rhyhorn","Rhyperior",
        "Riolu","Roggenrola","Roselia","Roserade","Rotom","Rufflet","Sableye","Salamence","Samurott",
        "Sandile","Sandshrew","Sandslash","Sawk","Sawsbuck","Sceptile","Scizor","Scolipede",
        "Scrafty","Scraggy","Scyther","Seadra","Seaking","Sealeo","Seedot","Seel","Seismitoad",
        "Sentret","Serperior","Servine","Seviper","Sewaddle","Sharpedo","Shedinja","Shelgon","Shellder",
        "Shellos","Shelmet","Shieldon","Shiftry","Shinx","Shroomish","Shuckle","Shuppet","Sigilyph",
        "Silcoon","Simipour","Simisage","Simisear","Skarmory","Skiploom","Skitty","Skorupi",
        "Skuntank","Slaking","Slakoth","Slowbro","Slowking","Slowpoke","Slugma","Smeargle",
        "Smoochum","Sneasel","Snivy","Snorlax","Snorunt","Snover","Snubbull","Solosis","Solrock",
        "Spearow","Spheal","Spinarak","Spinda","Spiritomb","Spoink","Squirtle","Stantler",
        "Staraptor","Staravia","Starly","Starmie","Staryu","Steelix","Stoutland","Stunfisk","Stunky",
        "Sudowoodo","Sunflora","Sunkern","Surskit","Swablu","Swadloon","Swalot","Swampert","Swanna",
        "Swellow","Swinub","Swoobat","Taillow","Tangela","Tangrowth","Tauros","Teddiursa",
        "Tentacool","Tentacruel","Tepig","Throh","Timburr","Tirtouga","Togekiss","Togepi","Togetic",
        "Torchic","Torkoal","Torterra","Totodile","Toxicroak","Tranquill","Trapinch","Treecko",
        "Tropius","Trubbish","Turtwig","Tympole","Tynamo","Typhlosion","Tyranitar","Tyrogue",
        "Umbreon","Unfezant","Unown","Ursaring","Vanillish","Vanillite","Vanilluxe","Vaporeon",
        "Venipede","Venomoth","Venonat","Venusaur","Vespiquen","Vibrava","Victreebel","Vigoroth",
        "Vileplume","Volbeat","Volcarona","Voltorb","Vullaby","Vulpix","Wailmer","Wailord","Walrein",
        "Wartortle","Watchog","Weavile","Weedle","Weepinbell","Weezing","Whimsicott","Whirlipede",
        "Whiscash","Wigglytuff","Wingull","Wobbuffet","Woobat","Wooper","Wormadam","Wurmple",
        "Wynaut","Xatu","Yamask","Yanma","Yanmega","Zangoose","Zebstrika","Zigzagoon","Zoroark",
        "Zorua","Zubat","Zweilous"
    ],

    tier6: [],
    tier5: [],
    tier4: [],
    tier3: [],
    tier2: [],
    tier1: [],
    tier0: [],

    // Legendarios/Míticos — 200 pts
    legendary: [
        "Arceus","Articuno","Azelf","Celebi","Cobalion",
        "Cresselia","Darkrai","Deoxys","Dialga","Entei",
        "Genesect","Giratina","Groudon","Heatran","Ho-Oh",
        "Jirachi","Keldeo","Kyogre","Kyurem","Landorus",
        "Latias","Latios","Lugia","Manaphy","Meloetta",
        "Mesprit","Mew","Mewtwo","Moltres","Palkia",
        "Phione","Raikou","Rayquaza","Regice","Regigigas",
        "Regirock","Registeel","Reshiram","Shaymin","Suicune",
        "Terrakion","Thundurus","Tornadus","Uxie","Victini",
        "Virizion","Zapdos","Zekrom"
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
    "7": "#64748b"
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

function calculatePoints(tier, method, isAlpha) {
    const normalizedTier = tier && !tier.startsWith('tier') && tier !== 'legendary' && tier !== 'alpha' ? 'tier' + tier : tier;
    let base = isAlpha ? 75 : (TIER_POINTS[normalizedTier] || TIER_POINTS[tier] || 0);
    if (method === "egg") return Math.max(35, base);
    const bonus = METHOD_BONUS[method] || 0;
    return base + bonus;
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
        let pts;
        if (isDuplicate) {
            const alphaBase = pokemonCatchers[key][0].is_alpha ? 75 : (TIER_POINTS[pokemonCatchers[key][0].tier] || TIER_POINTS[t.tier] || 0);
            pts = isAlphaCatch ? 35 : 1;
            duplicateCount++;
        } else {
            const basePts = isAlphaCatch ? 75 : (TIER_POINTS[t.tier] || 0);
            if (method === 'egg') {
                pts = Math.max(35, basePts);
            } else {
                pts = basePts + (METHOD_BONUS[method] || 0);
            }
        }
        base += isDuplicate ? pts : (isAlphaCatch ? 75 : (TIER_POINTS[t.tier] || 0));
        if (!isDuplicate) {
            const rawBase = isAlphaCatch ? 75 : (TIER_POINTS[t.tier] || 0);
            methodBonus += (pts - rawBase);
        }
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
        let pts;
        if (isDuplicate) {
            pts = isAlphaCatch ? 35 : 1;
        } else {
            const basePts = isAlphaCatch ? 75 : (TIER_POINTS[t.tier] || 0);
            if (method === 'egg') {
                pts = Math.max(35, basePts);
            } else {
                pts = basePts + (METHOD_BONUS[method] || 0);
            }
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

// Gen 6+ Pokemon to remove (PokeMMO only has Gen 1-5)
const GEN6PLUS = new Set([
    "chespin","quilladin","chesnaught","fennekin","braixen","delphox","froakie","frogadier","greninja",
    "bunnelby","diggersby","fletchling","fletchinder","talonflame","scatterbug","spewpa","vivillon",
    "litleo","pyroar","flabebe","floette","florges","skiddo","gogoat","pancham","pangoro","furfrou",
    "espurr","meowstic","honedge","doublade","aegislash","spritzee","aromatisse","swirlix","slurpuff",
    "inkay","malamar","binacle","barbaracle","skrelp","dragalge","clauncher","clawitzer",
    "helioptile","heliolisk","tyrunt","tyrantrum","amaura","aurorus","sylveon","hawlucha",
    "dedenne","carbink","goomy","sliggoo","goodra","klefki","phantump","trevenant",
    "pumpkaboo","gourgeist","bergmite","avalugg","noibat","noivern",
    "xerneas","yveltal","zygarde","diancie","hoopa","volcanion",
    "rowlet","dartrix","decidueye","litten","torracat","incineroar","popplio","brionne","primarina",
    "pikipek","trumbeak","toucannon","yungoos","gumshoos","grubbin","charjabug","vikavolt",
    "crabrawler","crabominable","oricorio","cutiefly","ribombee","rockruff","lycanroc",
    "wishiwashi","mareanie","toxapex","mudbray","mudsdale","dewpider","araquanid",
    "fomantis","lurantis","morelull","shiinotic","salandit","salazzle","stufful","bewear",
    "bounsweet","steenee","tsareena","comfey","oranguru","passimian","wimpod","golisopod",
    "sandygast","palossand","pyukumuku","type-null","silvally","minior","komala","turtonator",
    "mimikyu","bruxish","drampa","dhelmise","jangmo-o","hakamo-o","kommo-o",
    "tapu-koko","tapu-lele","tapu-bulu","tapu-fini","cosmog","cosmoem","solgaleo","lunala",
    "nihilego","buzzwole","pheromosa","xurkitree","celesteela","kartana","guzzlord","necrozma",
    "magearna","marshadow","zeraora","meltan","melmetal",
    "grookey","thwackey","rillaboom","scorbunny","raboot","cinderace","sobble","drizzile","inteleon",
    "skwovet","greedent","rookidee","corvisquire","corviknight","blipbug","dottler","orbeetle",
    "nickit","thievul","gossifleur","eldegoss","wooloo","dubwool","chewtle","drednaw",
    "yamper","boltund","rolycoly","carkol","coalossal","applin","flapple","appletun",
    "silicobra","sandaconda","cramorant","arrokuda","barraskewda","toxel","toxtricity",
    "sizzlipede","centiskorch","clobbopus","grapploct","sinistea","polteageist",
    "hatenna","hattrem","hatterene","impidimp","morgrem","grimmsnarl",
    "obstagoon","perrserker","cursola","sirfetch'd","mr. rime","runerigus",
    "milcery","alcremie","falinks","pincurchin","snom","frosmoth",
    "stonjourner","eiscue","indeedee","morpeko","cufant","copperajah",
    "dracozolt","arctozolt","dracovish","arctovish","duraludon",
    "dreepy","drakloak","dragapult","zacian","zamazenta","eternatus",
    "kubfu","urshifu","zarude","regieleki","regidrago","glastrier","spectrier","calyrex",
    "enamorus"
]);

// Filter out Gen 6+ Pokemon from all tiers
for (const tier of Object.keys(POKEMON_TIERS)) {
    POKEMON_TIERS[tier] = POKEMON_TIERS[tier].filter(name => !GEN6PLUS.has(name.toLowerCase()));
}

function suggestPokemon(query) {
    return searchPokemon(query);
}

const fs = require('fs');
const https = require('https');

const SUPABASE_URL = 'https://nfasholpyvewiosuhedj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mYXNob2xweXZld2lvc3VoZWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MTk3MTEsImV4cCI6MjEwMDM5NTcxMX0.OxgjJcxlzbHQt4Pfh99DX_uFAbWtQv1_pPIkW9Qw2NE';

const code = fs.readFileSync('./pokemon-data.js', 'utf8');
const fn = new Function(code + '; return { POKEMON_TIERS, getPokemonTier };');
const { getPokemonTier } = fn();

function supabaseGet(path) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, SUPABASE_URL);
        const req = https.request(url, { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.end();
    });
}

function supabasePatch(path, body) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, SUPABASE_URL);
        const data = JSON.stringify(body);
        const req = https.request(url, {
            method: 'PATCH',
            headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' }
        }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => resolve({ status: res.statusCode, body: d }));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function fixTiers() {
    const res = await supabaseGet('/rest/v1/targets?select=id,pokemon_name,tier');
    const targets = res.error ? [] : res;
    if (!targets || targets.length === 0) { console.log('No targets or error:', res); return; }

    let fixed = 0;
    for (const t of targets) {
        const correctTier = getPokemonTier(t.pokemon_name);
        if (correctTier && correctTier !== t.tier) {
            await supabasePatch('/rest/v1/targets?id=eq.' + t.id, { tier: correctTier });
            fixed++;
            console.log(t.pokemon_name + ': ' + t.tier + ' -> ' + correctTier);
        }
    }
    console.log('\nDone! Fixed ' + fixed + ' of ' + targets.length + ' targets.');
}

fixTiers();

(() => {
    let allUsers = [];
    let allTargets = [];
    let currentFilter = 'all';
    let searchQuery = '';
    let currentView = 'myTargets';
    let acIndex = -1;

    function getSession() { return Auth.getSession(); }

    function friendlyError(e) {
        if (!e) return 'Error desconocido.';
        const msg = (e.message || String(e)).toLowerCase();
        if (msg.includes('row-level security') || msg.includes('rls'))
            return 'No tenés permiso para esta acción.';
        if (msg.includes('relation') && msg.includes('does not exist'))
            return 'La base de datos no está configurada.';
        if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch'))
            return 'Sin conexión a internet.';
        return e.message ? 'Error: ' + e.message : 'Error desconocido.';
    }

    async function loadAllData() {
        if (!supabaseClient) throw new Error('No se pudo conectar con la base de datos.');
        const { data: users, error: errU } = await supabaseClient
            .from('users').select('id, username, display_name, role').order('created_at');
        const { data: targets, error: errT } = await supabaseClient
            .from('targets').select('id, user_id, pokemon_name, tier, method, is_alpha, is_secret, caught').order('created_at');
        if (errU) throw new Error(friendlyError(errU));
        if (errT) throw new Error(friendlyError(errT));
        allUsers = users || [];
        allTargets = (targets || []).map(t => {
            if (t.tier && !t.tier.startsWith('tier') && t.tier !== 'legendary' && t.tier !== 'alpha') {
                t.tier = 'tier' + t.tier;
            }
            return t;
        });
    }

    function getUserTargets(userId) {
        return allTargets.filter(t => t.user_id === userId);
    }

    function getMemberPoints(user) {
        return getUserTargets(user.id).reduce((s, t) => s + calculatePoints(t.tier, t.method || 'wild', t.is_alpha, t.is_secret), 0);
    }

    function updateStats() {
        const el = (id) => document.getElementById(id);
        const totalTargets = allTargets.length;
        const totalCaught = allTargets.filter(t => t.caught).length;
        const totalPoints = allTargets.reduce((s, t) => s + calculatePoints(t.tier, t.method || 'wild', t.is_alpha, t.is_secret), 0);
        if (el('totalAssigned')) el('totalAssigned').textContent = totalTargets;
        if (el('totalCaught')) el('totalCaught').textContent = totalCaught;
        if (el('totalMembers')) el('totalMembers').textContent = allUsers.length;
        if (el('totalPoints')) el('totalPoints').textContent = totalPoints;
        renderScoreboard();
    }

    function renderScoreboard() {
        const scoreboardEl = document.getElementById('scoreboard');
        const breakdownEl = document.getElementById('scoreBreakdown');
        const perPlayerEl = document.getElementById('scorePerPlayer');
        if (!scoreboardEl || !breakdownEl || !perPlayerEl) return;

        const teamScore = calculateTeamScore(allTargets);

        breakdownEl.innerHTML = `
            <div class="sb-total"><span class="sb-total-number">${teamScore.total}</span><span class="sb-total-label">Puntos totales</span></div>
            <div class="sb-row"><span>Base (tiers capturados)</span><span class="sb-val">${teamScore.base}</span></div>
            <div class="sb-row"><span>Bonus métodos</span><span class="sb-val sb-bonus">+${teamScore.methodBonus}</span></div>
            <div class="sb-row"><span>Bonus especies únicas (${teamScore.uniqueLines.length} líneas × 8)</span><span class="sb-val sb-bonus">+${teamScore.uniqueBonus}</span></div>
            ${teamScore.duplicateCount > 0 ? `<div class="sb-row"><span>Duplicados (reducidos a +1)</span><span class="sb-val sb-muted">${teamScore.duplicateCount}</span></div>` : ''}
            <div class="sb-row"><span>Shinies capturados</span><span class="sb-val">${teamScore.caughtCount}</span></div>
        `;

        let playerHtml = '';
        allUsers.forEach(u => {
            const ps = calculatePlayerScore(getUserTargets(u.id), allTargets);
            if (ps.caughtCount === 0) return;
            const badge = u.role === 'admin' ? ' <span class="admin-badge">Admin</span>' : '';
            playerHtml += `
                <div class="sb-player">
                    <span class="sb-player-name">${esc(u.display_name || u.username)}${badge}</span>
                    <span class="sb-player-detail">${ps.caughtCount} shinies</span>
                    <span class="sb-player-pts">${ps.total} pts</span>
                </div>
            `;
        });
        perPlayerEl.innerHTML = playerHtml;
    }

    function esc(str) {
        if (!str) return '';
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    // ─── MY TARGETS VIEW ───

    function renderMyTargets() {
        const session = getSession();
        if (!session) return;
        const container = document.getElementById('myTargetList');
        if (!container) return;
        const targets = getUserTargets(session.id);

        if (targets.length === 0) {
            container.innerHTML = '<div class="empty-state">Todavía no tenés targets. ¡Agregá uno arriba!</div>';
            return;
        }

        container.innerHTML = targets.map(t => {
            const tc = t.tier === 'legendary' ? 'legendary' : t.tier === 'alpha' ? 'alpha' : `tier-${t.tier.replace('tier', '')}`;
            const tl = t.tier === 'legendary' ? 'LEG' : t.tier === 'alpha' ? 'ALPHA' : `T${t.tier.replace('tier', '')}`;
            const sprite = getShinySpriteUrl(t.pokemon_name);
            const pts = calculatePoints(t.tier, t.method || 'wild', t.is_alpha, t.is_secret);
            const method = t.method || 'wild';
            return `
                <div class="my-target-item ${t.caught ? 'is-caught' : ''}">
                    <button class="caught-btn ${t.caught ? 'is-caught' : ''}" data-tid="${t.id}" title="${t.caught ? 'Descapturar' : 'Marcar como capturado'}">
                        ${t.caught ? '✓' : '○'}
                    </button>
                    ${sprite ? `<img src="${sprite}" class="my-target-sprite" onerror="this.style.display='none'">` : ''}
                    <span class="tier-badge ${tc}">${tl}</span>
                    <span class="my-target-name">${esc(t.pokemon_name)}</span>
                    <div class="target-options" data-tid="${t.id}">
                        <button class="toggle-pill alpha-pill ${t.is_alpha ? 'active' : ''}" data-toggle="is_alpha" title="Alpha (75 pts base)">🅰️ Alpha</button>
                        <button class="toggle-pill secret-pill ${t.is_secret ? 'active' : ''}" data-toggle="is_secret" title="Secret Shiny (+20 pts)">⭐ Secret</button>
                        <span class="options-sep">|</span>
                        <div class="method-pills">
                            <button class="toggle-pill method-pill ${method === 'wild' ? 'active' : ''}" data-method="wild" title="Salvaje">🌿 Salvaje</button>
                            <button class="toggle-pill method-pill ${method === 'egg' ? 'active' : ''}" data-method="egg" title="Huevo">🥚 Huevo</button>
                            <button class="toggle-pill method-pill ${method === 'safari' ? 'active' : ''}" data-method="safari" title="Safari">🌴 Safari</button>
                        </div>
                    </div>
                    <span class="my-target-pts">${pts} pts</span>
                    <button class="my-target-remove" data-tid="${t.id}" title="Quitar de mi lista">✕</button>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.caught-btn').forEach(btn => {
            btn.addEventListener('click', () => toggleMyCaught(btn.dataset.tid));
        });
        container.querySelectorAll('.toggle-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                const opts = pill.parentElement;
                const tid = opts.dataset.tid;
                const field = pill.dataset.toggle;
                const newVal = !pill.classList.contains('active');
                pill.classList.toggle('active');
                changeToggle(tid, field, newVal);
            });
        });
        container.querySelectorAll('.method-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                const methodGroup = pill.parentElement;
                const opts = methodGroup.parentElement;
                const tid = opts.dataset.tid;
                const method = pill.dataset.method;
                methodGroup.querySelectorAll('.method-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                changeMethod(tid, method);
            });
        });
        container.querySelectorAll('.my-target-remove').forEach(btn => {
            btn.addEventListener('click', () => removeMyTarget(btn.dataset.tid));
        });
    }

    async function addMyTarget() {
        const session = getSession();
        if (!session) return;
        const input = document.getElementById('myTargetInput');
        const name = input.value.trim();
        const errorDiv = document.getElementById('myTargetError');

        if (!name) {
            errorDiv.textContent = 'Escribí el nombre del Pokémon.';
            errorDiv.classList.remove('hidden');
            return;
        }

        const tier = getPokemonTier(name);
        if (!tier) {
            errorDiv.textContent = `"${name}" no está en la lista de Pokémon disponibles.`;
            errorDiv.classList.remove('hidden');
            return;
        }

        const myTargets = getUserTargets(session.id);
        if (myTargets.some(t => t.pokemon_name.toLowerCase() === name.toLowerCase())) {
            errorDiv.textContent = `Ya tenés a "${name}" en tu lista.`;
            errorDiv.classList.remove('hidden');
            return;
        }

        const { data, error } = await supabaseClient
            .from('targets')
            .insert({ user_id: session.id, pokemon_name: name, tier, method: 'wild', is_alpha: false, is_secret: false, caught: false })
            .select('id, user_id, pokemon_name, tier, method, is_alpha, is_secret, caught')
            .single();
        if (error) {
            errorDiv.textContent = friendlyError(error);
            errorDiv.classList.remove('hidden');
            return;
        }

        allTargets.push(data);
        input.value = '';
        errorDiv.classList.add('hidden');
        hideAutocomplete();
        renderMyTargets();
        updateStats();
        if (currentView === 'teamRoster') renderTeamRoster();
    }

    async function toggleMyCaught(targetId) {
        const session = getSession();
        const target = allTargets.find(t => t.id === targetId);
        if (!target || !session || target.user_id !== session.id) return;
        const newCaught = !target.caught;
        const { error } = await supabaseClient.from('targets').update({ caught: newCaught }).eq('id', targetId);
        if (error) { alert(friendlyError(error)); return; }
        target.caught = newCaught;
        renderMyTargets();
        updateStats();
        if (currentView === 'teamRoster') renderTeamRoster();
    }

    async function changeMethod(targetId, method) {
        const session = getSession();
        const target = allTargets.find(t => t.id === targetId);
        if (!target || !session || target.user_id !== session.id) return;
        const { error } = await supabaseClient.from('targets').update({ method }).eq('id', targetId);
        if (error) { alert(friendlyError(error)); return; }
        target.method = method;
        renderMyTargets();
        updateStats();
        if (currentView === 'teamRoster') renderTeamRoster();
    }

    async function changeToggle(targetId, field, value) {
        const session = getSession();
        const target = allTargets.find(t => t.id === targetId);
        if (!target || !session || target.user_id !== session.id) return;
        const { error } = await supabaseClient.from('targets').update({ [field]: value }).eq('id', targetId);
        if (error) { alert(friendlyError(error)); return; }
        target[field] = value;
        renderMyTargets();
        updateStats();
        if (currentView === 'teamRoster') renderTeamRoster();
    }

    async function removeMyTarget(targetId) {
        const session = getSession();
        const target = allTargets.find(t => t.id === targetId);
        if (!target || !session || target.user_id !== session.id) return;
        const { error } = await supabaseClient.from('targets').delete().eq('id', targetId);
        if (error) { alert(friendlyError(error)); return; }
        allTargets = allTargets.filter(t => t.id !== targetId);
        renderMyTargets();
        updateStats();
        if (currentView === 'teamRoster') renderTeamRoster();
    }

    // ─── AUTOCOMPLETE ───

    function showAutocomplete(query) {
        const box = document.getElementById('autocompleteList');
        if (!query || query.length < 1) { box.classList.add('hidden'); return; }

        const results = suggestPokemon(query);
        const session = getSession();
        const myTargets = session ? getUserTargets(session.id) : [];

        let html = '';
        if (results.length > 0) {
            html = results.map(r => {
                const tc = r.tier === 'legendary' ? 'legendary' : r.tier === 'alpha' ? 'alpha' : `tier-${r.tier.replace('tier', '')}`;
                const tl = r.tier === 'legendary' ? 'LEG' : r.tier === 'alpha' ? 'ALPHA' : `T${r.tier.replace('tier', '')}`;
                const inMyList = myTargets.some(t => t.pokemon_name.toLowerCase() === r.name.toLowerCase());
                const sprite = getShinySpriteUrl(r.name);
                return `
                    <div class="ac-item ${inMyList ? 'in-list' : ''}" data-name="${esc(r.name)}">
                        ${sprite ? `<img src="${sprite}" class="ac-sprite" onerror="this.style.display='none'">` : ''}
                        <span class="tier-badge ${tc}">${tl}</span>
                        <span class="ac-name">${esc(r.name)}</span>
                        <span class="ac-pts">${r.points} pts</span>
                        ${inMyList ? '<span class="ac-badge">YA LO TENÉS</span>' : ''}
                    </div>
                `;
            }).join('');
        }

        if (!html) { box.classList.add('hidden'); return; }
        box.innerHTML = html;
        box.classList.remove('hidden');
        acIndex = -1;

        box.querySelectorAll('.ac-item:not(.in-list)').forEach(item => {
            item.addEventListener('click', () => {
                document.getElementById('myTargetInput').value = item.dataset.name;
                hideAutocomplete();
                addMyTarget();
            });
        });
    }

    function hideAutocomplete() {
        const box = document.getElementById('autocompleteList');
        if (box) box.classList.add('hidden');
        acIndex = -1;
    }

    function navAC(dir) {
        const items = document.querySelectorAll('#autocompleteList .ac-item:not(.in-list)');
        if (!items.length) return false;
        items.forEach(i => i.classList.remove('selected'));
        acIndex += dir;
        if (acIndex < 0) acIndex = items.length - 1;
        if (acIndex >= items.length) acIndex = 0;
        items[acIndex].classList.add('selected');
        items[acIndex].scrollIntoView({ block: 'nearest' });
        return true;
    }

    function selectAC() {
        const items = document.querySelectorAll('#autocompleteList .ac-item:not(.in-list)');
        if (acIndex >= 0 && acIndex < items.length) { items[acIndex].click(); return true; }
        return false;
    }

    // ─── TEAM ROSTER VIEW ───

    function getFilteredMembers() {
        return allUsers.filter(u => {
            const targets = getUserTargets(u.id);
            if (currentFilter === 'assigned' && targets.length === 0) return false;
            if (currentFilter === 'unassigned' && targets.length > 0) return false;
            if (currentFilter === 'caught' && !targets.some(t => t.caught)) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if ((u.display_name || u.username || '').toLowerCase().includes(q)) return true;
                if (targets.some(t => t.pokemon_name.toLowerCase().includes(q))) return true;
                return false;
            }
            return true;
        });
    }

    function getMemberPoints(user) {
        return calculatePlayerScore(getUserTargets(user.id), allTargets).total;
    }

    function renderTeamRoster() {
        const list = document.getElementById('memberList');
        if (!list) return;
        const session = getSession();
        const filtered = getFilteredMembers();

        list.innerHTML = filtered.map((u, i) => {
            const targets = getUserTargets(u.id);
            const ps = calculatePlayerScore(targets, allTargets);
            const isMe = session && u.id === session.id;
            const displayName = u.display_name || u.username || '???';

            return `
                <div class="member-card ${targets.length > 0 ? 'assigned' : 'unassigned'} ${isMe ? 'is-me' : ''}">
                    <div class="member-number">${i + 1}</div>
                    <div class="member-info">
                        <div class="member-header">
                            <span class="member-name">${esc(displayName)}${isMe ? ' <span class="me-badge">VOS</span>' : ''} ${u.role === 'admin' ? '<span class="admin-badge">ADMIN</span>' : ''}</span>
                            ${ps.caughtCount > 0 ? `
                                <span class="member-count">${ps.caughtCount} shiny${ps.caughtCount > 1 ? 's' : ''}</span>
                                <span class="member-total-pts">${ps.total} pts</span>
                            ` : targets.length > 0 ? `
                                <span class="member-count">${targets.length} target${targets.length > 1 ? 's' : ''}</span>
                            ` : ''}
                        </div>
                        ${targets.length > 0 ? `
                            <div class="member-targets">
                                ${targets.map(t => {
                                    const tc = t.tier === 'legendary' ? 'legendary' : t.tier === 'alpha' ? 'alpha' : `tier-${t.tier.replace('tier', '')}`;
                                    const tl = t.tier === 'legendary' ? 'LEG' : t.tier === 'alpha' ? 'ALPHA' : `T${t.tier.replace('tier', '')}`;
                                    const sprite = getShinySpriteUrl(t.pokemon_name);
                                    const pts2 = calculatePoints(t.tier, t.method || 'wild', t.is_alpha, t.is_secret);
                                    const method = t.method || 'wild';
                                    const methodLabel = method === 'egg' ? '🥚' : method === 'safari' ? '🌴' : '🌿';
                                    return `
                                        <div class="target-row ${t.caught ? 'is-caught' : ''}">
                                            <span class="caught-indicator ${t.caught ? 'is-caught' : ''}">${t.caught ? '✓' : '○'}</span>
                                            ${sprite ? `<img src="${sprite}" class="target-sprite" onerror="this.style.display='none'">` : ''}
                                            <span class="tier-badge ${tc}">${tl}</span>
                                            <span class="target-name">${esc(t.pokemon_name)}</span>
                                            ${t.is_alpha ? '<span class="alpha-dot" title="Alpha">🅰️</span>' : ''}
                                            ${t.is_secret ? '<span class="secret-dot" title="Secret Shiny">⭐</span>' : ''}
                                            <span class="method-pill-ro" title="${method}">${methodLabel}</span>
                                            <span class="target-pts">${pts2} pts</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : `<div class="member-no-pokemon">${isMe ? 'Agregá shinies en "Mis Targets"' : 'Sin targets'}</div>`}
                    </div>
                </div>
            `;
        }).join('');
    }

    // ─── POKEMON LOOKUP ───

    function renderPokemonResults(query) {
        const container = document.getElementById('pokemonResults');
        if (!container) return;
        const tierFilter = document.getElementById('tierFilter').value;
        let results = searchPokemon(query);
        if (tierFilter) results = results.filter(r => r.tier === tierFilter);

        container.innerHTML = results.map(r => {
            const tc = r.tier === 'legendary' ? 'legendary' : r.tier === 'alpha' ? 'alpha' : `tier-${r.tier.replace('tier', '')}`;
            const tl = r.tier === 'legendary' ? 'LEG' : r.tier === 'alpha' ? 'ALPHA' : `T${r.tier.replace('tier', '')}`;
            const sprite = getShinySpriteUrl(r.name);
            const holders = allUsers.filter(u => allTargets.some(t => t.user_id === u.id && t.pokemon_name.toLowerCase() === r.name.toLowerCase()));
            return `
                <div class="pokemon-result-card">
                    ${sprite ? `<img src="${sprite}" class="pokemon-result-sprite" onerror="this.style.display='none'">` : ''}
                    <span class="tier-badge ${tc}">${tl}</span>
                    <span class="pokemon-result-name">${r.name}</span>
                    <span class="pokemon-result-pts">${r.points} pts</span>
                    ${holders.length > 0 ? holders.map(u => `<span class="pokemon-result-who">${esc(u.display_name || u.username)}</span>`).join('') : ''}
                </div>
            `;
        }).join('');

        if (results.length === 0 && query && query.length >= 1) {
            container.innerHTML = '<div style="padding:0.5rem;color:var(--text-muted)">Sin resultados.</div>';
        }
    }

    // ─── VIEW SWITCHING ───

    function switchView(view) {
        currentView = view;
        document.querySelectorAll('.view-tab').forEach(t => t.classList.toggle('active', t.dataset.view === view));
        document.getElementById('myTargetsView').classList.toggle('hidden', view !== 'myTargets');
        document.getElementById('teamRosterView').classList.toggle('hidden', view !== 'teamRoster');
        if (view === 'myTargets') renderMyTargets();
        if (view === 'teamRoster') renderTeamRoster();
    }

    // ─── INIT ───

    function showApp() {
        const session = getSession();
        if (!session) { showAuth(); return; }
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        document.getElementById('userGreeting').textContent = session.display_name || session.username || '???';
        loadAllData()
            .then(() => { switchView('myTargets'); updateStats(); })
            .catch(err => {
                document.getElementById('myTargetList').innerHTML = `
                    <div class="empty-state" style="text-align:center;padding:2rem">
                        <p style="font-size:1.1rem;margin-bottom:0.5rem">⚠️ No se pudieron cargar los datos</p>
                        <p style="color:var(--text-muted);margin-bottom:1rem">${esc(err.message)}</p>
                        <button onclick="location.reload()" class="action-btn primary" style="margin-top:0.5rem">Recargar página</button>
                    </div>
                `;
            });
    }

    function showAuth() {
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('authScreen').classList.remove('hidden');
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (getSession()) { showApp(); } else { showAuth(); }

        // Auth tabs
        document.getElementById('authTabLogin').addEventListener('click', () => {
            document.getElementById('authTabLogin').classList.add('active');
            document.getElementById('authTabRegister').classList.remove('active');
            document.getElementById('authSubmit').textContent = 'Iniciar sesión';
            document.getElementById('authError').classList.add('hidden');
        });
        document.getElementById('authTabRegister').addEventListener('click', () => {
            document.getElementById('authTabRegister').classList.add('active');
            document.getElementById('authTabLogin').classList.remove('active');
            document.getElementById('authSubmit').textContent = 'Registrarse';
            document.getElementById('authError').classList.add('hidden');
        });

        // Auth form submit
        document.getElementById('authForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorDiv = document.getElementById('authError');
            const submitBtn = document.getElementById('authSubmit');
            errorDiv.classList.add('hidden');
            const isRegister = document.getElementById('authTabRegister').classList.contains('active');
            const username = document.getElementById('authUsername').value.trim();
            const password = document.getElementById('authPassword').value;
            if (!username || !password) { errorDiv.textContent = 'Completá todos los campos.'; errorDiv.classList.remove('hidden'); return; }
            if (password.length < 4) { errorDiv.textContent = 'La contraseña debe tener al menos 4 caracteres.'; errorDiv.classList.remove('hidden'); return; }
            submitBtn.disabled = true;
            submitBtn.textContent = isRegister ? 'Registrando...' : 'Ingresando...';
            try {
                if (isRegister) { await Auth.register(username, password); } else { await Auth.login(username, password); }
                showApp();
            } catch (err) {
                errorDiv.textContent = err.message || 'Ocurrió un error inesperado.';
                errorDiv.classList.remove('hidden');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = isRegister ? 'Registrarse' : 'Iniciar sesión';
            }
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => { Auth.logout(); showAuth(); });

        // View tabs
        document.querySelectorAll('.view-tab').forEach(tab => {
            tab.addEventListener('click', () => switchView(tab.dataset.view));
        });

        // My Targets - add
        document.getElementById('myTargetAddBtn').addEventListener('click', addMyTarget);

        // My Targets - autocomplete
        const nameInput = document.getElementById('myTargetInput');
        nameInput.addEventListener('input', e => showAutocomplete(e.target.value));
        nameInput.addEventListener('keydown', e => {
            if (e.key === 'ArrowDown') { e.preventDefault(); navAC(1); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); navAC(-1); }
            else if (e.key === 'Enter') { e.preventDefault(); if (!selectAC()) addMyTarget(); }
            else if (e.key === 'Escape') { hideAutocomplete(); }
        });
        nameInput.addEventListener('blur', () => setTimeout(hideAutocomplete, 200));

        // Team Roster - search & filters
        document.getElementById('searchInput').addEventListener('input', e => { searchQuery = e.target.value; renderTeamRoster(); });
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                renderTeamRoster();
            });
        });

        // Pokemon lookup
        document.getElementById('pokemonLookup')?.addEventListener('input', e => renderPokemonResults(e.target.value));
        document.getElementById('tierFilter')?.addEventListener('change', () => renderPokemonResults(document.getElementById('pokemonLookup').value));
    });
})();

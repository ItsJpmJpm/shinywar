(() => {
    let allUsers = [];
    let allTargets = [];
    let currentFilter = 'all';
    let searchQuery = '';
    let acIndex = -1;
    let refreshInterval = null;

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

    // ─── TOAST ───
    function showToast(message, type = 'success') {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:0.5rem;pointer-events:none;';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        const colors = { success: '#22c55e', error: '#ef4444', info: '#60a5fa' };
        const bg = colors[type] || colors.success;
        toast.style.cssText = `padding:0.6rem 1rem;border-radius:10px;font-size:0.85rem;font-weight:500;color:#fff;background:${bg};box-shadow:0 4px 16px rgba(0,0,0,0.3);opacity:0;transform:translateX(20px);transition:all 0.3s ease;pointer-events:auto;max-width:280px;`;
        toast.textContent = message;
        container.appendChild(toast);
        requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(0)'; });
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // ─── DATA ───
    async function loadAllData() {
        if (!supabaseClient) throw new Error('No se pudo conectar con la base de datos.');
        const { data: users, error: errU } = await supabaseClient
            .from('users').select('id, username, display_name, role').order('created_at');
        if (errU) throw new Error(friendlyError(errU));
        allUsers = users || [];

        // Load season & route overrides from pokemon_data
        const { data: pokeData, error: pokeErr } = await supabaseClient
            .from('pokemon_data').select('name, seasons, routes');
        if (pokeErr) {
            console.warn('Error loading pokemon_data:', pokeErr);
        } else if (pokeData) {
            for (const row of pokeData) {
                const key = row.name.toLowerCase();
                if (!pokemonOverrides[key]) pokemonOverrides[key] = {};
                if (row.seasons) pokemonOverrides[key].seasons = row.seasons;
                if (row.routes) pokemonOverrides[key].routes = row.routes;
            }
        }

        let targets;
        const { data: tFull, error: errFull } = await supabaseClient
            .from('targets').select('id, user_id, pokemon_name, tier, method, is_alpha, is_secret, caught, sort_order').order('sort_order', { ascending: true, nullsFirst: true }).order('created_at');
        if (!errFull && tFull) {
            targets = tFull;
        } else {
            const { data: tBasic, error: errBasic } = await supabaseClient
                .from('targets').select('id, user_id, pokemon_name, tier, caught, sort_order').order('sort_order', { ascending: true, nullsFirst: true }).order('created_at');
            if (errBasic) throw new Error(friendlyError(errBasic));
            targets = tBasic || [];
        }
        allTargets = (targets || []).map(t => {
            if (!t.method) t.method = 'wild';
            if (t.is_alpha == null) t.is_alpha = false;
            if (t.is_secret == null) t.is_secret = false;
            const correctTier = getPokemonTier(t.pokemon_name);
            if (correctTier && correctTier !== t.tier) {
                t.tier = correctTier;
                supabaseClient.from('targets').update({ tier: correctTier }).eq('id', t.id).then(() => {});
            }
            return t;
        });
    }

    async function refreshData() {
        try {
            const oldCaught = allTargets.filter(t => t.caught).length;
            const oldCount = allTargets.length;
            await loadAllData();
            const newCaught = allTargets.filter(t => t.caught).length;
            if (newCaught > oldCaught) showToast(`¡${newCaught - oldCaught} nuevo${newCaught - oldCaught > 1 ? 's' : ''} shiny capturado!`, 'info');
            updateStats();
            renderTeamRoster();
            renderMyTargets();
        } catch (e) { /* silent */ }
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

        const playersWithScore = allUsers.map(u => ({
            user: u,
            score: calculatePlayerScore(getUserTargets(u.id), allTargets)
        })).filter(p => p.score.caughtCount > 0).sort((a, b) => b.score.total - a.score.total);

        let playerHtml = '';
        playersWithScore.forEach((p, idx) => {
            const badge = p.user.role === 'admin' ? ' <span class="admin-badge">Admin</span>' : '';
            const rank = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `<span class="sb-rank-num">${idx + 1}</span>`;
            playerHtml += `
                <div class="sb-player">
                    <span class="sb-rank">${rank}</span>
                    <span class="sb-player-name">${esc(p.user.display_name || p.user.username)}${badge}</span>
                    <span class="sb-player-detail">${p.score.caughtCount} shinies</span>
                    <span class="sb-player-pts">${p.score.total} pts</span>
                </div>
            `;
        });
        perPlayerEl.innerHTML = playerHtml || '<div style="padding:0.5rem;color:var(--text-muted);font-size:0.85rem;text-align:center">Sin capturas todavía</div>';
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
                <div class="my-target-item ${t.caught ? 'is-caught' : ''}" data-tid="${t.id}">
                    <span class="drag-handle" title="Arrastrar para reordenar">⠿</span>
                    <button class="caught-btn ${t.caught ? 'is-caught' : ''}" data-tid="${t.id}" title="${t.caught ? 'Descapturar' : 'Marcar como capturado'}">
                        ${t.caught ? '✓' : '○'}
                    </button>
                    ${sprite ? `<img src="${sprite}" class="my-target-sprite" onerror="this.style.display='none'">` : ''}
                    <span class="tier-badge ${tc}">${tl}</span>
                    ${getSeasonBadgeHTML(t.pokemon_name)}
                    ${getRouteChipsHTML(t.pokemon_name)}
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

        // Sortable drag-and-drop reorder
        if (window.Sortable) {
            if (container._sortable) container._sortable.destroy();
            container._sortable = new Sortable(container, {
                animation: 150,
                onEnd: function(evt) {
                    var session = getSession();
                    if (!session) return;
                    var targets = getUserTargets(session.id);
                    var items = container.querySelectorAll('.my-target-item');
                    items.forEach(function(item, idx) {
                        var tid = item.dataset.tid;
                        var t = targets.find(function(t) { return t.id === tid; });
                        if (t) t.sort_order = idx;
                    });
                    allTargets.sort(function(a, b) { return (a.sort_order || 0) - (b.sort_order || 0); });
                    var updates = targets.map(function(t) {
                        return supabaseClient.from('targets').update({ sort_order: t.sort_order }).eq('id', t.id);
                    });
                    Promise.all(updates).catch(function() {});
                }
            });
        }

        // Season badge click — open season picker
        container.querySelectorAll('.my-target-item .season-badge').forEach(function(badge) {
            badge.addEventListener('click', function(e) {
                e.stopPropagation();
                var item = this.closest('.my-target-item');
                var tid = item.dataset.tid;
                var t = allTargets.find(function(x) { return x.id === tid; });
                if (!t || !session || t.user_id !== session.id) return;
                showSeasonPicker(tid, t.pokemon_name);
            });
        });

        // Sprite or name click — open target card
        container.querySelectorAll('.my-target-sprite, .my-target-name').forEach(function(el) {
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                var item = this.closest('.my-target-item');
                var tid = item.dataset.tid;
                var t = allTargets.find(function(x) { return x.id === tid; });
                if (!t) return;
                showTargetCard(t.pokemon_name);
            });
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

        const maxOrder = myTargets.length > 0 ? Math.max(...myTargets.map(t => t.sort_order || 0)) : 0;
        const { data, error } = await supabaseClient
            .from('targets')
            .insert({ user_id: session.id, pokemon_name: name, tier, method: 'wild', is_alpha: false, is_secret: false, caught: false, sort_order: maxOrder + 1 })
            .select('id, user_id, pokemon_name, tier, method, is_alpha, is_secret, caught, sort_order')
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
        renderTeamRoster();
        updateStats();
        showToast(`${name} agregado a tu lista`);
    }

    async function toggleMyCaught(targetId) {
        const session = getSession();
        const target = allTargets.find(t => t.id === targetId);
        if (!target || !session) return;
        if (target.user_id !== session.id && session.role !== 'admin') return;
        const newCaught = !target.caught;
        const { error } = await supabaseClient.from('targets').update({ caught: newCaught }).eq('id', targetId);
        if (error) { alert(friendlyError(error)); return; }
        target.caught = newCaught;
        renderMyTargets();
        renderTeamRoster();
        updateStats();
        showToast(newCaught ? `¡${target.pokemon_name} capturado!` : `${target.pokemon_name} descapturado`, newCaught ? 'success' : 'info');
    }

    async function changeMethod(targetId, method) {
        const session = getSession();
        const target = allTargets.find(t => t.id === targetId);
        if (!target || !session) return;
        if (target.user_id !== session.id && session.role !== 'admin') return;
        const { error } = await supabaseClient.from('targets').update({ method }).eq('id', targetId);
        if (error) { alert(friendlyError(error)); return; }
        target.method = method;
        renderMyTargets();
        renderTeamRoster();
        updateStats();
    }

    async function changeToggle(targetId, field, value) {
        const session = getSession();
        const target = allTargets.find(t => t.id === targetId);
        if (!target || !session) return;
        if (target.user_id !== session.id && session.role !== 'admin') return;
        const { error } = await supabaseClient.from('targets').update({ [field]: value }).eq('id', targetId);
        if (error) { alert(friendlyError(error)); return; }
        target[field] = value;
        renderMyTargets();
        renderTeamRoster();
        updateStats();
    }

    async function removeMyTarget(targetId) {
        const session = getSession();
        const target = allTargets.find(t => t.id === targetId);
        if (!target || !session || target.user_id !== session.id) return;
        if (!confirm(`¿Quitar ${target.pokemon_name} de tu lista?`)) return;
        const { error } = await supabaseClient.from('targets').delete().eq('id', targetId);
        if (error) { alert(friendlyError(error)); return; }
        allTargets = allTargets.filter(t => t.id !== targetId);
        renderMyTargets();
        renderTeamRoster();
        updateStats();
        showToast(`${target.pokemon_name} eliminado`, 'info');
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
                        ${getSeasonBadgeHTML(r.name)}
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

    let rosterSearch = '';

    function getFilteredMembers() {
        return allUsers.filter(u => {
            const targets = getUserTargets(u.id);
            if (currentFilter === 'assigned' && targets.length === 0) return false;
            if (currentFilter === 'unassigned' && targets.length > 0) return false;
            if (currentFilter === 'caught' && !targets.some(t => t.caught)) return false;
            if (rosterSearch) {
                const q = rosterSearch.toLowerCase();
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

        const membersWithScore = filtered.map(u => ({
            user: u,
            score: calculatePlayerScore(getUserTargets(u.id), allTargets)
        })).sort((a, b) => b.score.total - a.score.total);

        list.innerHTML = membersWithScore.map((item, i) => {
            const u = item.user;
            const ps = item.score;
            const targets = getUserTargets(u.id);
            const isMe = session && u.id === session.id;
            const isAdmin = session && session.role === 'admin';
            const displayName = u.display_name || u.username || '???';
            const rank = i === 0 && ps.total > 0 ? '🥇' : i === 1 && ps.total > 0 ? '🥈' : i === 2 && ps.total > 0 ? '🥉' : '';

            return `
                <div class="member-card ${targets.length > 0 ? 'assigned' : 'unassigned'} ${isMe ? 'is-me' : ''}">
                    <div class="member-number">${rank || i + 1}</div>
                    <div class="member-info">
                        <div class="member-header">
                            <span class="member-name">${esc(displayName)}${isMe ? ' <span class="me-badge">TÚ</span>' : ''} ${u.role === 'admin' ? '<span class="admin-badge">ADMIN</span>' : ''}</span>
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
                                    const canEdit = isMe || isAdmin;
                                    return `
                                        <div class="target-row ${t.caught ? 'is-caught' : ''}">
                                            ${canEdit ? `<button class="caught-btn-sm ${t.caught ? 'is-caught' : ''}" data-tid="${t.id}" title="${t.caught ? 'Descapturar' : 'Marcar como capturado'}">${t.caught ? '✓' : '○'}</button>` : `<span class="caught-indicator ${t.caught ? 'is-caught' : ''}">${t.caught ? '✓' : '○'}</span>`}
                                            ${sprite ? `<img src="${sprite}" class="target-sprite" onerror="this.style.display='none'">` : ''}
                                            <span class="tier-badge ${tc}">${tl}</span>
                                            ${getSeasonBadgeHTML(t.pokemon_name)}
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

        list.querySelectorAll('.caught-btn-sm').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMyCaught(btn.dataset.tid);
            });
        });
    }

    // ─── SEASON PICKER ───

    function showSeasonPicker(targetId, pokemonName) {
        var existing = document.getElementById('seasonPicker');
        if (existing) existing.remove();

        var currentSeasons = getPokemonSeasons(pokemonName);
        var active = {};
        currentSeasons.forEach(function(s) { active[s] = true; });

        var currentRoutes = getPokemonRoutes(pokemonName);

        var picker = document.createElement('div');
        picker.id = 'seasonPicker';
        picker.className = 'season-picker';

        var html = '<div class="season-picker-header">Estaciones</div>';
        html += '<label class="season-picker-opt"><input type="checkbox" ' + (active['all'] ? 'checked' : '') + ' data-s="all"> 🌿 Todas</label>';
        html += '<label class="season-picker-opt"><input type="checkbox" ' + (active['spring'] && !active['all'] ? 'checked' : '') + ' data-s="spring"> 🌸 Primavera</label>';
        html += '<label class="season-picker-opt"><input type="checkbox" ' + (active['summer'] && !active['all'] ? 'checked' : '') + ' data-s="summer"> ☀️ Verano</label>';
        html += '<label class="season-picker-opt"><input type="checkbox" ' + (active['autumn'] && !active['all'] ? 'checked' : '') + ' data-s="autumn"> 🍂 Otoño</label>';
        html += '<label class="season-picker-opt"><input type="checkbox" ' + (active['winter'] && !active['all'] ? 'checked' : '') + ' data-s="winter"> ❄️ Invierno</label>';

        // Routes section
        html += '<div class="picker-divider"></div>';
        html += '<div class="season-picker-header">Rutas</div>';
        html += '<div class="picker-routes-list" id="pickerRoutesList">';
        var seasonNames = {all:"🌿 Todas", spring:"🌸 Primavera", summer:"☀️ Verano", autumn:"🍂 Otoño", winter:"❄️ Invierno"};
        var timeIcons = {day:"☀️", night:"🌙", "day-night":"☀️🌙"};
        for (var s in currentRoutes) {
            var list = currentRoutes[s];
            for (var i = 0; i < list.length; i++) {
                var r = typeof list[i] === 'string' ? { route: list[i], time: 'day-night', chance: 100 } : list[i];
                html += '<div class="picker-route-chip" data-season="' + s + '" data-time="' + (r.time||'day-night') + '" data-chance="' + (r.chance||100) + '"><span class="picker-route-season">' + (seasonNames[s]||s) + '</span> ' + (timeIcons[r.time]||"") + ' ' + esc(r.route) + ' <span class="picker-route-chance">' + (r.chance||100) + '%</span> <button class="picker-route-remove" data-route="' + esc(r.route) + '">✕</button></div>';
            }
        }
        html += '</div>';

        html += '<div class="picker-add-route-row">';
        html += '<input type="text" id="routeInput" class="picker-route-input" placeholder="Escribí una ruta..." autocomplete="off">';
        html += '<select id="routeSeasonSelect" class="picker-route-season-select">';
        html += '<option value="all">🌿 Todas</option>';
        html += '<option value="spring">🌸 Primavera</option>';
        html += '<option value="summer">☀️ Verano</option>';
        html += '<option value="autumn">🍂 Otoño</option>';
        html += '<option value="winter">❄️ Invierno</option>';
        html += '</select>';
        html += '<select id="routeTimeSelect" class="picker-route-season-select" style="width:auto">';
        html += '<option value="day-night">☀️🌙 Ambas</option>';
        html += '<option value="day">☀️ Día</option>';
        html += '<option value="night">🌙 Noche</option>';
        html += '</select>';
        html += '<select id="routeChanceSelect" class="picker-route-season-select" style="width:auto">';
        html += '<option value="100">100%</option>';
        html += '<option value="75">75%</option>';
        html += '<option value="50">50%</option>';
        html += '<option value="25">25%</option>';
        html += '</select>';
        html += '<button id="addRouteBtn" class="picker-add-route-btn">+</button>';
        html += '</div>';
        html += '<div class="route-autocomplete" id="routeAutocomplete"></div>';

        html += '<button class="season-picker-save">Guardar</button>';
        html += '<button class="season-picker-close">✕</button>';
        picker.innerHTML = html;
        document.body.appendChild(picker);

        var allChk = picker.querySelector('[data-s="all"]');
        var seasonChks = picker.querySelectorAll('[data-s]:not([data-s="all"])');

        allChk.addEventListener('change', function() {
            seasonChks.forEach(function(c) { c.checked = false; });
        });
        seasonChks.forEach(function(c) {
            c.addEventListener('change', function() {
                if (this.checked) allChk.checked = false;
                else {
                    var anyOn = Array.from(seasonChks).some(function(x) { return x.checked; });
                    if (!anyOn) allChk.checked = true;
                }
            });
        });

        // Route autocomplete
        var routeInput = picker.querySelector('#routeInput');
        var routeAC = picker.querySelector('#routeAutocomplete');

        function showRouteAC(query) {
            if (!query || query.length < 1) { routeAC.classList.add('hidden'); return; }
            var results = suggestRoutes(query);
            if (!results.length) { routeAC.classList.add('hidden'); return; }
            routeAC.innerHTML = results.map(function(r) {
                return '<div class="route-ac-item" data-route="' + esc(r) + '">' + esc(r) + '</div>';
            }).join('');
            routeAC.classList.remove('hidden');
            routeAC.querySelectorAll('.route-ac-item').forEach(function(item) {
                item.addEventListener('click', function() {
                    routeInput.value = this.dataset.route;
                    routeAC.classList.add('hidden');
                });
            });
        }

        routeInput.addEventListener('input', function() { showRouteAC(this.value); });
        routeInput.addEventListener('blur', function() { setTimeout(function() { routeAC.classList.add('hidden'); }, 200); });
        routeInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('addRouteBtn').click();
            } else if (e.key === 'Escape') {
                routeAC.classList.add('hidden');
            }
        });

        var timeIcons = {day:"☀️", night:"🌙", "day-night":"☀️🌙"};

        // Add route button
        function addRoute() {
            var route = routeInput.value.trim();
            if (!route) return;
            var s = document.getElementById('routeSeasonSelect').value;
            var time = document.getElementById('routeTimeSelect').value;
            var chance = parseInt(document.getElementById('routeChanceSelect').value, 10);
            var routesList = document.getElementById('pickerRoutesList');
            var seasonNames = {all:"🌿 Todas", spring:"🌸 Primavera", summer:"☀️ Verano", autumn:"🍂 Otoño", winter:"❄️ Invierno"};
            var chip = document.createElement('div');
            chip.className = 'picker-route-chip';
            chip.dataset.season = s;
            chip.dataset.time = time;
            chip.dataset.chance = chance;
            chip.innerHTML = '<span class="picker-route-season">' + (seasonNames[s]||s) + '</span> ' + (timeIcons[time]||"") + ' ' + esc(route) + ' <span class="picker-route-chance">' + chance + '%</span> <button class="picker-route-remove" data-route="' + esc(route) + '">✕</button>';
            routesList.appendChild(chip);
            chip.querySelector('.picker-route-remove').addEventListener('click', function() { chip.remove(); });
            routeInput.value = '';
            routeAC.classList.add('hidden');
            routeInput.focus();
        }

        picker.querySelector('#addRouteBtn').addEventListener('click', addRoute);

        // Remove existing route chips
        picker.querySelectorAll('.picker-route-remove').forEach(function(btn) {
            btn.addEventListener('click', function() {
                this.parentElement.remove();
            });
        });

        // Save
        picker.querySelector('.season-picker-save').addEventListener('click', function() {
            var selected;
            if (allChk.checked) selected = 'all';
            else selected = Array.from(seasonChks).filter(function(c) { return c.checked; }).map(function(c) { return c.dataset.s; }).join(',') || 'all';

            // Collect routes
            var routes = {};
            picker.querySelectorAll('.picker-route-chip').forEach(function(chip) {
                var s = chip.dataset.season;
                var route = chip.querySelector('.picker-route-remove').dataset.route;
                var time = chip.dataset.time || 'day-night';
                var chance = parseInt(chip.dataset.chance, 10) || 100;
                if (!routes[s]) routes[s] = [];
                routes[s].push({ route: route, time: time, chance: chance });
            });

            saveTargetSeason(targetId, pokemonName, selected, routes);
            picker.remove();
        });
        picker.querySelector('.season-picker-close').addEventListener('click', function() { picker.remove(); });
    }

    async function saveTargetSeason(targetId, pokemonName, seasons, routes) {
        var lc = pokemonName.toLowerCase();
        if (!pokemonOverrides[lc]) pokemonOverrides[lc] = {};
        pokemonOverrides[lc].seasons = seasons;
        if (routes !== undefined) pokemonOverrides[lc].routes = routes;
        renderMyTargets();
        renderTeamRoster();
        var payload = { name: lc, seasons: seasons };
        if (routes !== undefined) payload.routes = routes;
        var { error } = await supabaseClient.from('pokemon_data').upsert(payload, { onConflict: 'name' });
        if (error) console.warn('Error saving season/routes:', error);
    }

    // ─── REALTIME ───

    var targetsChannel = null;

    function subscribeRealtime() {
        if (targetsChannel) supabaseClient.removeChannel(targetsChannel);
        targetsChannel = supabaseClient.channel('public:targets')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'targets' }, function() { refreshData(); })
            .subscribe();
    }

    // ─── INIT ───

    function showApp() {
        const session = getSession();
        if (!session) { showAuth(); return; }
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        document.getElementById('userGreeting').textContent = session.display_name || session.username || '???';
        document.getElementById('myTargetList').innerHTML = '<div class="skeleton-list"><div class="skeleton-item"></div><div class="skeleton-item"></div><div class="skeleton-item"></div></div>';
        loadAllData()
            .then(() => {
                renderMyTargets();
                renderTeamRoster();
                updateStats();
                if (refreshInterval) clearInterval(refreshInterval);
                refreshInterval = setInterval(refreshData, 30000);
                subscribeRealtime();
            })
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

        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            if (refreshInterval) clearInterval(refreshInterval);
            if (targetsChannel) supabaseClient.removeChannel(targetsChannel);
            Auth.logout(); showAuth();
        });

        document.querySelectorAll('.view-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const view = tab.dataset.view;
                document.getElementById('myTargetsView').classList.toggle('hidden', view !== 'targets');
                document.getElementById('teamRosterView').classList.toggle('hidden', view !== 'roster');
            });
        });

        document.getElementById('myTargetAddBtn').addEventListener('click', addMyTarget);

        const nameInput = document.getElementById('myTargetInput');
        nameInput.addEventListener('input', e => showAutocomplete(e.target.value));
        nameInput.addEventListener('keydown', e => {
            if (e.key === 'ArrowDown') { e.preventDefault(); navAC(1); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); navAC(-1); }
            else if (e.key === 'Enter') { e.preventDefault(); if (!selectAC()) addMyTarget(); }
            else if (e.key === 'Escape') { hideAutocomplete(); }
        });
        nameInput.addEventListener('blur', () => setTimeout(hideAutocomplete, 200));

        document.getElementById('searchInput').addEventListener('input', e => { rosterSearch = e.target.value; renderTeamRoster(); });
        document.querySelectorAll('#teamRosterView .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#teamRosterView .filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                renderTeamRoster();
            });
        });
    });
})();

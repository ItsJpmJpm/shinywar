(() => {
    let allUsers = [];
    let allTargets = [];
    let currentFilter = 'all';
    let searchQuery = '';

    function getSession() { return Auth.getSession(); }

    function friendlySupabaseError(error) {
        if (!error) return 'Error desconocido.';
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('row-level security') || msg.includes('rls'))
            return 'No tenés permiso para esta acción.';
        if (msg.includes('relation') && msg.includes('does not exist'))
            return 'La base de datos no está configurada. Contactá al admin.';
        if (msg.includes('failed to fetch') || msg.includes('network'))
            return 'Sin conexión a internet.';
        return 'Error: ' + (error.message || 'desconocido');
    }

    async function loadAllData() {
        if (!supabaseClient) {
            throw new Error('No se pudo conectar con la base de datos.');
        }
        const { data: users, error: errUsers } = await supabaseClient
            .from('users').select('id, username, display_name, role').order('created_at');
        const { data: targets, error: errTargets } = await supabaseClient
            .from('targets').select('id, user_id, pokemon_name, tier, caught').order('created_at');

        if (errUsers) throw new Error('Error al cargar miembros: ' + friendlySupabaseError(errUsers));
        if (errTargets) throw new Error('Error al cargar targets: ' + friendlySupabaseError(errTargets));

        allUsers = users || [];
        allTargets = targets || [];
    }

    function getUserTargets(userId) {
        return allTargets.filter(t => t.user_id === userId);
    }

    function isPokemonTaken(pokemon, excludeUserId) {
        const lower = pokemon.toLowerCase();
        return allTargets.some(t =>
            t.user_id !== excludeUserId &&
            t.pokemon_name.toLowerCase() === lower
        );
    }

    function getMemberPoints(user) {
        return getUserTargets(user.id).reduce((s, t) => s + calculatePoints(t.tier, 'wild'), 0);
    }

    function updateStats() {
        const el = (id) => document.getElementById(id);
        const totalTargets = allTargets.length;
        const totalCaught = allTargets.filter(t => t.caught).length;
        const totalPoints = allTargets.reduce((s, t) => s + calculatePoints(t.tier, 'wild'), 0);
        if (el('totalAssigned')) el('totalAssigned').textContent = totalTargets;
        if (el('totalCaught')) el('totalCaught').textContent = totalCaught;
        if (el('totalMembers')) el('totalMembers').textContent = allUsers.length;
        if (el('totalPoints')) el('totalPoints').textContent = totalPoints;
    }

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

    function renderRoster() {
        const list = document.getElementById('memberList');
        if (!list) return;
        const session = getSession();
        const filtered = getFilteredMembers();

        list.innerHTML = filtered.map((u, i) => {
            const targets = getUserTargets(u.id);
            const pts = getMemberPoints(u);
            const isMe = session && u.id === session.id;
            const displayName = u.display_name || u.username || '???';

            return `
                <div class="member-card ${targets.length > 0 ? 'assigned' : 'unassigned'} ${isMe ? 'is-me' : ''}" data-uid="${u.id}">
                    <div class="member-number">${i + 1}</div>
                    <div class="member-info">
                        <div class="member-header">
                            <span class="member-name">${esc(displayName)}${isMe ? ' <span class="me-badge">VOS</span>' : ''}</span>
                            ${targets.length > 0 ? `
                                <span class="member-count">${targets.length} shiny${targets.length > 1 ? 's' : ''}</span>
                                <span class="member-total-pts">${pts} pts</span>
                            ` : ''}
                        </div>
                        ${targets.length > 0 ? `
                            <div class="member-targets">
                                ${targets.map((t, idx) => {
                                    const tc = t.tier === 'legendary' ? 'legendary' : t.tier === 'alpha' ? 'alpha' : `tier-${t.tier}`;
                                    const tl = t.tier === 'legendary' ? 'LEG' : t.tier === 'alpha' ? 'ALPHA' : `T${t.tier}`;
                                    const sprite = getShinySpriteUrl(t.pokemon_name);
                                    const pts2 = calculatePoints(t.tier, 'wild');
                                    const canEdit = isMe || Auth.isAdmin();
                                    return `
                                        <div class="target-row ${t.caught ? 'is-caught' : ''}">
                                            ${canEdit ? `<button class="caught-btn-sm ${t.caught ? 'is-caught' : ''}" data-tid="${t.id}" title="${t.caught ? 'Capturado' : 'Marcar capturado'}">${t.caught ? '✓' : '○'}</button>` : `<span class="caught-btn-sm ${t.caught ? 'is-caught' : ''}" style="cursor:default">${t.caught ? '✓' : '○'}</span>`}
                                            ${sprite ? `<img src="${sprite}" class="target-sprite" onerror="this.style.display='none'">` : ''}
                                            <span class="tier-badge ${tc}">${tl}</span>
                                            <span class="target-name">${esc(t.pokemon_name)}</span>
                                            <span class="target-pts">${pts2}</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : `<div class="member-no-pokemon">${isMe ? 'Todavía sin target — click para agregar' : 'Sin targets'}</div>`}
                    </div>
                    ${isMe || Auth.isAdmin() ? `<button class="member-add-btn" data-uid="${u.id}" title="Agregar shiny">+</button>` : ''}
                </div>
            `;
        }).join('');

        list.querySelectorAll('.member-add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(btn.dataset.uid, true);
            });
        });

        list.querySelectorAll('.member-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.caught-btn-sm') || e.target.closest('.member-add-btn')) return;
                openModal(card.dataset.uid);
            });
        });

        list.querySelectorAll('.caught-btn-sm[data-tid]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleCaught(btn.dataset.tid);
            });
        });
    }

    async function toggleCaught(targetId) {
        const target = allTargets.find(t => t.id === targetId);
        if (!target) return;
        const session = getSession();
        if (!session || (target.user_id !== session.id && !Auth.isAdmin())) return;
        const newCaught = !target.caught;
        const { error } = await supabaseClient.from('targets').update({ caught: newCaught }).eq('id', targetId);
        if (error) {
            alert('No se pudo actualizar: ' + friendlySupabaseError(error));
            return;
        }
        target.caught = newCaught;
        renderRoster();
        updateStats();
    }

    function esc(str) {
        if (!str) return '';
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    let modalUserId = null;

    function openModal(userId, focusAdd) {
        const user = allUsers.find(u => u.id === userId);
        if (!user) return;
        const session = getSession();
        if (!Auth.isAdmin() && (!session || user.id !== session.id)) return;

        modalUserId = userId;
        document.getElementById('modalTitle').textContent = `Targets de ${user.display_name || user.username || '???'} `;
        renderModalTargets(user);
        document.getElementById('modal').classList.remove('hidden');
        if (focusAdd) setTimeout(() => {
            const input = document.getElementById('modalPokemonName');
            if (input) input.focus();
        }, 100);
    }

    function renderModalTargets(user) {
        const container = document.getElementById('modalTargetList');
        if (!container) return;
        const targets = getUserTargets(user.id);
        const pts = getMemberPoints(user);
        const caughtCount = targets.filter(t => t.caught).length;

        document.getElementById('modalSummary').textContent =
            targets.length > 0
                ? `${targets.length} shiny${targets.length > 1 ? 's' : ''} • ${caughtCount} capturado${caughtCount !== 1 ? 's' : ''} • ${pts} pts`
                : 'Sin targets aún';

        container.innerHTML = targets.map(t => {
            const tc = t.tier === 'legendary' ? 'legendary' : t.tier === 'alpha' ? 'alpha' : `tier-${t.tier}`;
            const tl = t.tier === 'legendary' ? 'LEG' : t.tier === 'alpha' ? 'ALPHA' : `T${t.tier}`;
            const sprite = getShinySpriteUrl(t.pokemon_name);
            const pts2 = calculatePoints(t.tier, 'wild');
            return `
                <div class="modal-target-item ${t.caught ? 'is-caught' : ''}">
                    <button class="caught-btn-modal ${t.caught ? 'is-caught' : ''}" data-tid="${t.id}">
                        ${t.caught ? '✓' : '○'}
                    </button>
                    ${sprite ? `<img src="${sprite}" class="modal-target-sprite" onerror="this.style.display='none'">` : ''}
                    <span class="tier-badge ${tc}">${tl}</span>
                    <span class="modal-target-name">${esc(t.pokemon_name)}</span>
                    <span class="modal-target-pts">${pts2} pts</span>
                    <button class="modal-remove-btn" data-tid="${t.id}" title="Quitar">✕</button>
                </div>
            `;
        }).join('');

        if (targets.length === 0) {
            container.innerHTML = '<div class="modal-empty">Usá el campo de abajo para agregar shinies</div>';
        }

        container.querySelectorAll('.caught-btn-modal').forEach(btn => {
            btn.addEventListener('click', async () => {
                await toggleCaught(btn.dataset.tid);
                const user = allUsers.find(u => u.id === modalUserId);
                if (user) renderModalTargets(user);
            });
        });

        container.querySelectorAll('.modal-remove-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const session = getSession();
                if (!session) return;
                const target = allTargets.find(t => t.id === btn.dataset.tid);
                if (target && target.user_id !== session.id && !Auth.isAdmin()) return;
                const { error } = await supabaseClient.from('targets').delete().eq('id', btn.dataset.tid);
                if (error) {
                    alert('No se pudo eliminar: ' + friendlySupabaseError(error));
                    return;
                }
                allTargets = allTargets.filter(t => t.id !== btn.dataset.tid);
                const user = allUsers.find(u => u.id === modalUserId);
                if (user) renderModalTargets(user);
                renderRoster();
                updateStats();
            });
        });
    }

    function closeModal() {
        document.getElementById('modal').classList.add('hidden');
        hideAutocomplete();
    }

    async function addPokemon() {
        const user = allUsers.find(u => u.id === modalUserId);
        if (!user) return;
        const session = getSession();
        if (!session || (user.id !== session.id && !Auth.isAdmin())) return;

        const input = document.getElementById('modalPokemonName');
        const name = input.value.trim();
        const tier = document.getElementById('modalTierSelect').value;
        const errorDiv = document.getElementById('modalError');

        if (!name) {
            errorDiv.textContent = 'Escribí el nombre del Pokémon.';
            errorDiv.classList.remove('hidden');
            return;
        }

        const userTargets = getUserTargets(user.id);
        if (userTargets.some(t => t.pokemon_name.toLowerCase() === name.toLowerCase())) {
            errorDiv.textContent = `Ya tenés a "${name}" en tu lista.`;
            errorDiv.classList.remove('hidden');
            return;
        }

        if (isPokemonTaken(name, user.id)) {
            errorDiv.textContent = `"${name}" ya tiene target otro miembro.`;
            errorDiv.classList.remove('hidden');
            return;
        }

        const { data, error } = await supabaseClient
            .from('targets')
            .insert({ user_id: user.id, pokemon_name: name, tier, caught: false })
            .select('id, user_id, pokemon_name, tier, caught')
            .single();
        if (error) {
            errorDiv.textContent = 'Error al agregar: ' + friendlySupabaseError(error);
            errorDiv.classList.remove('hidden');
            return;
        }

        allTargets.push(data);
        input.value = '';
        errorDiv.classList.add('hidden');
        hideAutocomplete();

        const sprite = getShinySpriteUrl(name);
        const preview = document.getElementById('modalSpritePreview');
        if (sprite && preview) {
            preview.innerHTML = `<img src="${sprite}">`;
            preview.classList.remove('hidden');
            setTimeout(() => preview.classList.add('hidden'), 2000);
        } else if (preview) {
            preview.classList.add('hidden');
        }

        renderModalTargets(user);
        renderRoster();
        updateStats();
        input.focus();
    }

    let acIndex = -1;

    function showAutocomplete(query) {
        const box = document.getElementById('autocompleteList');
        if (!query || query.length < 1) { box.classList.add('hidden'); return; }

        const results = suggestPokemon(query);
        const user = allUsers.find(u => u.id === modalUserId);
        const userTargets = user ? getUserTargets(user.id) : [];
        const currentTier = document.getElementById('modalTierSelect').value;
        const currentPts = TIER_POINTS[currentTier] || 0;

        let html = '';
        if (results.length > 0) {
            html = results.map(r => {
                const tc = r.tier === 'legendary' ? 'legendary' : r.tier === 'alpha' ? 'alpha' : `tier-${r.tier}`;
                const tl = r.tier === 'legendary' ? 'LEG' : r.tier === 'alpha' ? 'ALPHA' : `T${r.tier}`;
                const inMyList = userTargets.some(t => t.pokemon_name.toLowerCase() === r.name.toLowerCase());
                const taken = isPokemonTaken(r.name, modalUserId);
                const sprite = getShinySpriteUrl(r.name);
                return `
                    <div class="ac-item ${inMyList ? 'in-list' : ''} ${taken ? 'taken' : ''}" data-name="${esc(r.name)}" data-tier="${r.tier}">
                        ${sprite ? `<img src="${sprite}" class="ac-sprite" onerror="this.style.display='none'">` : ''}
                        <span class="tier-badge ${tc}">${tl}</span>
                        <span class="ac-name">${esc(r.name)}</span>
                        <span class="ac-pts">${r.points} pts</span>
                        ${inMyList ? '<span class="ac-badge">YA LO TENÉS</span>' : ''}
                        ${taken && !inMyList ? '<span class="ac-badge taken">OCUPADO</span>' : ''}
                    </div>
                `;
            }).join('');
        }

        const manualName = query.trim();
        const manualInList = userTargets.some(t => t.pokemon_name.toLowerCase() === manualName.toLowerCase());
        const manualTaken = isPokemonTaken(manualName, modalUserId);
        if (manualName.length > 0 && !manualInList) {
            const manualSprite = getShinySpriteUrl(manualName);
            const tc = currentTier === 'legendary' ? 'legendary' : currentTier === 'alpha' ? 'alpha' : `tier-${currentTier}`;
            const tl = currentTier === 'legendary' ? 'LEG' : currentTier === 'alpha' ? 'ALPHA' : `T${currentTier}`;
            const exactMatch = results.some(r => r.name.toLowerCase() === manualName.toLowerCase());
            html += `
                <div class="ac-item ac-manual ${manualTaken ? 'taken' : ''}" data-name="${esc(manualName)}" data-tier="${currentTier}">
                    ${manualSprite ? `<img src="${manualSprite}" class="ac-sprite" onerror="this.style.display='none'">` : ''}
                    <span class="tier-badge ${tc}">${tl}</span>
                    <span class="ac-name">${esc(manualName)}</span>
                    <span class="ac-pts">${currentPts} pts</span>
                    ${manualTaken ? '<span class="ac-badge taken">OCUPADO</span>' : ''}
                    ${!exactMatch && !manualTaken ? '<span class="ac-badge manual-badge">AGREGAR A MANO</span>' : ''}
                </div>
            `;
        }

        if (!html) { box.classList.add('hidden'); return; }
        box.innerHTML = html;
        box.classList.remove('hidden');
        acIndex = -1;

        box.querySelectorAll('.ac-item:not(.taken):not(.in-list)').forEach(item => {
            item.addEventListener('click', () => {
                document.getElementById('modalPokemonName').value = item.dataset.name;
                document.getElementById('modalTierSelect').value = item.dataset.tier;
                hideAutocomplete();
                addPokemon();
            });
        });
    }

    function hideAutocomplete() {
        const box = document.getElementById('autocompleteList');
        if (box) box.classList.add('hidden');
        acIndex = -1;
    }

    function navAC(dir) {
        const items = document.querySelectorAll('#autocompleteList .ac-item:not(.taken):not(.in-list)');
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
        const items = document.querySelectorAll('#autocompleteList .ac-item:not(.taken):not(.in-list)');
        if (acIndex >= 0 && acIndex < items.length) { items[acIndex].click(); return true; }
        return false;
    }

    function renderPokemonResults(query) {
        const container = document.getElementById('pokemonResults');
        if (!container) return;
        const tierFilter = document.getElementById('tierFilter').value;
        let results = searchPokemon(query);
        if (tierFilter) results = results.filter(r => r.tier === tierFilter);

        container.innerHTML = results.map(r => {
            const tc = r.tier === 'legendary' ? 'legendary' : r.tier === 'alpha' ? 'alpha' : `tier-${r.tier}`;
            const tl = r.tier === 'legendary' ? 'LEG' : r.tier === 'alpha' ? 'ALPHA' : `T${r.tier}`;
            const taken = isPokemonTaken(r.name, null);
            const sprite = getShinySpriteUrl(r.name);
            const who = taken ? allUsers.find(u => allTargets.some(t => t.user_id === u.id && t.pokemon_name.toLowerCase() === r.name.toLowerCase())) : null;
            return `
                <div class="pokemon-result-card ${taken ? 'taken' : ''}">
                    ${sprite ? `<img src="${sprite}" class="pokemon-result-sprite" onerror="this.style.display='none'">` : ''}
                    <span class="tier-badge ${tc}">${tl}</span>
                    <span class="pokemon-result-name">${r.name}</span>
                    <span class="pokemon-result-pts">${r.points} pts</span>
                    ${who ? `<span class="pokemon-result-who">${esc(who.display_name || who.username)}</span>` : ''}
                </div>
            `;
        }).join('');

        if (results.length === 0 && query && query.length >= 1) {
            container.innerHTML = '<div style="padding:0.5rem;color:var(--text-muted)">Sin resultados.</div>';
        }
    }

    function showApp() {
        const session = getSession();
        if (!session) { showAuth(); return; }

        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        document.getElementById('userGreeting').textContent = session.display_name || session.username || '???';

        loadAllData()
            .then(() => { renderRoster(); updateStats(); })
            .catch(err => {
                const list = document.getElementById('memberList');
                if (list) {
                    list.innerHTML = `
                        <div class="pokedex-empty" style="text-align:center;padding:2rem">
                            <p style="font-size:1.2rem;margin-bottom:0.5rem">⚠️ No se pudieron cargar los datos</p>
                            <p style="color:var(--text-muted);margin-bottom:1rem">${esc(err.message)}</p>
                            <p style="color:var(--text-muted)">Si recién creaste tu cuenta, recargá la página.</p>
                            <button onclick="location.reload()" class="action-btn primary" style="margin-top:1rem">Recargar página</button>
                        </div>
                    `;
                }
            });
    }

    function showAuth() {
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('authScreen').classList.remove('hidden');
    }

    document.addEventListener('DOMContentLoaded', () => {
        const session = getSession();
        if (session) { showApp(); } else { showAuth(); }

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
            const usernameEl = document.getElementById('authUsername');
            const passwordEl = document.getElementById('authPassword');

            if (!usernameEl || !passwordEl) {
                errorDiv.textContent = 'Error interno: no se encontraron los campos. Recargá la página.';
                errorDiv.classList.remove('hidden');
                return;
            }

            const username = usernameEl.value.trim();
            const password = passwordEl.value;

            if (!username || !password) {
                errorDiv.textContent = 'Completá todos los campos.';
                errorDiv.classList.remove('hidden');
                return;
            }
            if (password.length < 4) {
                errorDiv.textContent = 'La contraseña debe tener al menos 4 caracteres.';
                errorDiv.classList.remove('hidden');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = isRegister ? 'Registrando...' : 'Ingresando...';

            try {
                if (isRegister) {
                    await Auth.register(username, password);
                } else {
                    await Auth.login(username, password);
                }
                showApp();
            } catch (err) {
                errorDiv.textContent = err.message || 'Ocurrió un error inesperado. Intentá de nuevo.';
                errorDiv.classList.remove('hidden');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = isRegister ? 'Registrarse' : 'Iniciar sesión';
            }
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            Auth.logout();
            showAuth();
        });

        document.getElementById('searchInput').addEventListener('input', e => {
            searchQuery = e.target.value; renderRoster();
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                renderRoster();
            });
        });

        document.getElementById('modalAddBtn').addEventListener('click', addPokemon);
        document.getElementById('modalCancel').addEventListener('click', closeModal);
        document.querySelector('.close-modal').addEventListener('click', closeModal);
        document.getElementById('modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });

        const nameInput = document.getElementById('modalPokemonName');
        nameInput.addEventListener('input', e => showAutocomplete(e.target.value));
        nameInput.addEventListener('keydown', e => {
            if (e.key === 'ArrowDown') { e.preventDefault(); navAC(1); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); navAC(-1); }
            else if (e.key === 'Enter') { e.preventDefault(); if (!selectAC()) addPokemon(); }
            else if (e.key === 'Escape') { hideAutocomplete(); }
        });
        nameInput.addEventListener('blur', () => setTimeout(hideAutocomplete, 200));

        document.getElementById('pokemonLookup')?.addEventListener('input', e => renderPokemonResults(e.target.value));
        document.getElementById('tierFilter')?.addEventListener('change', () => renderPokemonResults(document.getElementById('pokemonLookup').value));

        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
    });
})();

(() => {
    const STORAGE_KEY = "snow-shinywar-2026";
    const TEAM_NAMES = [
        "SliferExodia","ItzTetoXz","Glixch","Zigzaly","Eldaeko","RexitoOT",
        "xRanpox","Schinzii","YoSoyJosei","DanyKyun","SpaxxM","Lightkirax",
        "Jonathanscz","GhostESP","KembaWalbert","Goreem","Gloxxinia",
        "XxWaitfuxX","Bellastra","MarialnsanaMMO","TheJATH","Nixxheim",
        "Daronf","ViMzD","Carexes","PankyyMMO","Kotoman","ErJpm"
    ];
    const TEAM_SIZE = 28;

    let members = loadMembers();
    let currentFilter = "all";
    let searchQuery = "";

    function getDefaultMembers() {
        return TEAM_NAMES.map((name, i) => ({
            id: i + 1,
            name,
            targets: []
        }));
    }

    function loadMembers() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                let data = JSON.parse(saved);
                if (Array.isArray(data)) {
                    // Filter out "Libre" entries from old data
                    data = data.filter(m => m.name && !m.name.toLowerCase().startsWith("libre"));
                    if (data.length === TEAM_SIZE) {
                        return data.map(m => {
                        // Migrate old formats
                        if (m.targets && Array.isArray(m.targets)) {
                            return { id: m.id, name: m.name, targets: m.targets };
                        }
                        if (m.pokemonList && m.pokemonList.length > 0) {
                            return {
                                id: m.id, name: m.name,
                                targets: m.pokemonList.map(p => ({
                                    name: p.name, tier: p.tier || "7", caught: p.caught || false
                                }))
                            };
                        }
                        if (m.pokemon && m.target) {
                            return {
                                id: m.id, name: m.name,
                                targets: [{ name: m.target, tier: m.tier || "7", caught: m.caught || false }]
                            };
                        }
                        if (m.pokemon && !m.target) {
                            return {
                                id: m.id, name: m.name,
                                targets: [{ name: m.pokemon, tier: m.tier || "7", caught: false }]
                            };
                        }
                        return { id: m.id || (m.id = TEAM_NAMES.indexOf(m.name) + 1), name: m.name, targets: [] };
                    });
                    }
                }
            }
        } catch {}
        return getDefaultMembers();
    }

    function saveMembers() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    }

    function isPokemonTaken(pokemon, excludeMemberId) {
        const lower = pokemon.toLowerCase();
        return members.some(m =>
            m.id !== excludeMemberId &&
            m.targets.some(t => t.name.toLowerCase() === lower)
        );
    }

    function getMemberPoints(m) {
        return m.targets.reduce((s, t) => s + calculatePoints(t.tier, "wild"), 0);
    }

    function updateStats() {
        let totalTargets = 0;
        let totalCaught = 0;
        let totalPoints = 0;
        members.forEach(m => {
            m.targets.forEach(t => {
                totalTargets++;
                if (t.caught) totalCaught++;
                totalPoints += calculatePoints(t.tier, "wild");
            });
        });
        document.getElementById("totalAssigned").textContent = totalTargets;
        document.getElementById("totalCaught").textContent = totalCaught;
        document.getElementById("totalMembers").textContent = TEAM_SIZE;
        document.getElementById("totalPoints").textContent = totalPoints;
    }

    function getFilteredMembers() {
        return members.filter(m => {
            if (currentFilter === "assigned" && m.targets.length === 0) return false;
            if (currentFilter === "unassigned" && m.targets.length > 0) return false;
            if (currentFilter === "caught" && !m.targets.some(t => t.caught)) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (m.name.toLowerCase().includes(q)) return true;
                if (m.targets.some(t => t.name.toLowerCase().includes(q))) return true;
                return false;
            }
            return true;
        });
    }

    function renderRoster() {
        const list = document.getElementById("memberList");
        const filtered = getFilteredMembers();

        list.innerHTML = filtered.map(m => {
            const pts = getMemberPoints(m);
            const caughtCount = m.targets.filter(t => t.caught).length;

            return `
                <div class="member-card ${m.targets.length > 0 ? 'assigned' : 'unassigned'}" data-id="${m.id}">
                    <div class="member-number">${m.id}</div>
                    <div class="member-info">
                        <div class="member-header">
                            <span class="member-name">${esc(m.name)}</span>
                            ${m.targets.length > 0 ? `
                                <span class="member-count">${m.targets.length} shiny${m.targets.length > 1 ? 's' : ''}</span>
                                <span class="member-total-pts">${pts} pts</span>
                            ` : ''}
                        </div>
                        ${m.targets.length > 0 ? `
                            <div class="member-targets">
                                ${m.targets.map((t, idx) => {
                                    const tc = t.tier === "legendary" ? "legendary" : t.tier === "alpha" ? "alpha" : `tier-${t.tier}`;
                                    const tl = t.tier === "legendary" ? "LEG" : t.tier === "alpha" ? "ALPHA" : `T${t.tier}`;
                                    const sprite = getShinySpriteUrl(t.name);
                                    const pts2 = calculatePoints(t.tier, "wild");
                                    return `
                                        <div class="target-row ${t.caught ? 'is-caught' : ''}">
                                            <button class="caught-btn-sm ${t.caught ? 'is-caught' : ''}" data-mid="${m.id}" data-idx="${idx}" title="${t.caught ? 'Capturado' : 'Marcar capturado'}">
                                                ${t.caught ? '✓' : '○'}
                                            </button>
                                            ${sprite ? `<img src="${sprite}" class="target-sprite" onerror="this.style.display='none'">` : ''}
                                            <span class="tier-badge ${tc}">${tl}</span>
                                            <span class="target-name">${esc(t.name)}</span>
                                            <span class="target-pts">${pts2}</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : `
                            <div class="member-no-pokemon">Todavía sin target — click para agregar</div>
                        `}
                    </div>
                    <button class="member-add-btn" data-id="${m.id}" title="Agregar shiny">+</button>
                </div>
            `;
        }).join("");

        list.querySelectorAll(".member-card").forEach(card => {
            card.addEventListener("click", (e) => {
                if (e.target.closest(".caught-btn-sm") || e.target.closest(".member-add-btn")) return;
                openModal(parseInt(card.dataset.id));
            });
        });

        list.querySelectorAll(".member-add-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                openModal(parseInt(btn.dataset.id), true);
            });
        });

        list.querySelectorAll(".caught-btn-sm").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                toggleCaught(parseInt(btn.dataset.mid), parseInt(btn.dataset.idx));
            });
        });
    }

    function toggleCaught(memberId, idx) {
        const m = members.find(x => x.id === memberId);
        if (!m || !m.targets[idx]) return;
        m.targets[idx].caught = !m.targets[idx].caught;
        saveMembers();
        renderRoster();
        updateStats();
    }

    function esc(str) {
        const d = document.createElement("div");
        d.textContent = str;
        return d.innerHTML;
    }

    // Modal
    let modalMemberId = null;

    function openModal(memberId, focusAdd) {
        const member = members.find(m => m.id === memberId);
        if (!member) return;
        modalMemberId = memberId;

        document.getElementById("modalTitle").textContent = `Targets de ${member.name}`;
        document.getElementById("modalMemberName").value = member.name;

        renderModalTargets(member);

        const modal = document.getElementById("modal");
        modal.classList.remove("hidden");

        if (focusAdd) {
            setTimeout(() => document.getElementById("modalPokemonName").focus(), 100);
        }
    }

    function renderModalTargets(member) {
        const container = document.getElementById("modalTargetList");
        const pts = getMemberPoints(member);
        const caughtCount = member.targets.filter(t => t.caught).length;

        document.getElementById("modalSummary").textContent =
            member.targets.length > 0
                ? `${member.targets.length} shiny${member.targets.length > 1 ? 's' : ''} • ${caughtCount} capturado${caughtCount !== 1 ? 's' : ''} • ${pts} pts`
                : 'Sin targets aún';

        container.innerHTML = member.targets.map((t, idx) => {
            const tc = t.tier === "legendary" ? "legendary" : t.tier === "alpha" ? "alpha" : `tier-${t.tier}`;
            const tl = t.tier === "legendary" ? "LEG" : t.tier === "alpha" ? "ALPHA" : `T${t.tier}`;
            const sprite = getShinySpriteUrl(t.name);
            const pts2 = calculatePoints(t.tier, "wild");
            return `
                <div class="modal-target-item ${t.caught ? 'is-caught' : ''}">
                    <button class="caught-btn-modal ${t.caught ? 'is-caught' : ''}" data-idx="${idx}">
                        ${t.caught ? '✓' : '○'}
                    </button>
                    ${sprite ? `<img src="${sprite}" class="modal-target-sprite" onerror="this.style.display='none'">` : ''}
                    <span class="tier-badge ${tc}">${tl}</span>
                    <span class="modal-target-name">${esc(t.name)}</span>
                    <span class="modal-target-pts">${pts2} pts</span>
                    <button class="modal-remove-btn" data-idx="${idx}" title="Quitar">✕</button>
                </div>
            `;
        }).join('');

        if (member.targets.length === 0) {
            container.innerHTML = '<div class="modal-empty">Usá el campo de abajo para agregar shinies</div>';
        }

        container.querySelectorAll(".caught-btn-modal").forEach(btn => {
            btn.addEventListener("click", () => {
                const idx = parseInt(btn.dataset.idx);
                member.targets[idx].caught = !member.targets[idx].caught;
                saveMembers();
                renderModalTargets(member);
                renderRoster();
                updateStats();
            });
        });

        container.querySelectorAll(".modal-remove-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const idx = parseInt(btn.dataset.idx);
                member.targets.splice(idx, 1);
                saveMembers();
                renderModalTargets(member);
                renderRoster();
                updateStats();
            });
        });
    }

    function closeModal() {
        document.getElementById("modal").classList.add("hidden");
        hideAutocomplete();
    }

    function addPokemon() {
        const member = members.find(m => m.id === modalMemberId);
        if (!member) return;

        const input = document.getElementById("modalPokemonName");
        const name = input.value.trim();
        const tier = document.getElementById("modalTierSelect").value;
        const errorDiv = document.getElementById("modalError");

        if (!name) {
            errorDiv.textContent = "Escribí el nombre del Pokémon.";
            errorDiv.classList.remove("hidden");
            return;
        }

        if (member.targets.some(t => t.name.toLowerCase() === name.toLowerCase())) {
            errorDiv.textContent = `⚠️ Ya tenés a "${name}" en tu lista.`;
            errorDiv.classList.remove("hidden");
            return;
        }

        if (isPokemonTaken(name, modalMemberId)) {
            errorDiv.textContent = `⚠️ "${name}" ya tiene target otro miembro.`;
            errorDiv.classList.remove("hidden");
            return;
        }

        member.targets.push({ name, tier, caught: false });
        input.value = "";
        errorDiv.classList.add("hidden");
        hideAutocomplete();

        // Update sprite preview
        const sprite = getShinySpriteUrl(name);
        const preview = document.getElementById("modalSpritePreview");
        if (sprite) {
            preview.innerHTML = `<img src="${sprite}">`;
            preview.classList.remove("hidden");
            setTimeout(() => preview.classList.add("hidden"), 2000);
        } else {
            preview.classList.add("hidden");
        }

        saveMembers();
        renderModalTargets(member);
        renderRoster();
        updateStats();
        input.focus();
    }

    // Autocomplete
    let acIndex = -1;

    function showAutocomplete(query) {
        const box = document.getElementById("autocompleteList");
        if (!query || query.length < 1) { box.classList.add("hidden"); return; }

        const results = suggestPokemon(query);
        const member = members.find(m => m.id === modalMemberId);
        const currentTier = document.getElementById("modalTierSelect").value;
        const currentPts = TIER_POINTS[currentTier] || 0;

        let html = '';

        if (results.length > 0) {
            html = results.map((r, i) => {
                const tc = r.tier === "legendary" ? "legendary" : r.tier === "alpha" ? "alpha" : `tier-${r.tier}`;
                const tl = r.tier === "legendary" ? "LEG" : r.tier === "alpha" ? "ALPHA" : `T${r.tier}`;
                const inMyList = member && member.targets.some(t => t.name.toLowerCase() === r.name.toLowerCase());
                const taken = isPokemonTaken(r.name, modalMemberId);
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

        // Always show manual entry option
        const manualName = query.trim();
        const manualInList = member && member.targets.some(t => t.name.toLowerCase() === manualName.toLowerCase());
        const manualTaken = isPokemonTaken(manualName, modalMemberId);
        if (manualName.length > 0 && !manualInList) {
            const manualSprite = getShinySpriteUrl(manualName);
            const tc = currentTier === "legendary" ? "legendary" : currentTier === "alpha" ? "alpha" : `tier-${currentTier}`;
            const tl = currentTier === "legendary" ? "LEG" : currentTier === "alpha" ? "ALPHA" : `T${currentTier}`;
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

        if (!html) { box.classList.add("hidden"); return; }

        box.innerHTML = html;
        box.classList.remove("hidden");
        acIndex = -1;

        box.querySelectorAll(".ac-item:not(.taken):not(.in-list)").forEach(item => {
            item.addEventListener("click", () => {
                document.getElementById("modalPokemonName").value = item.dataset.name;
                document.getElementById("modalTierSelect").value = item.dataset.tier;
                hideAutocomplete();
                addPokemon();
            });
        });
    }

    function hideAutocomplete() {
        document.getElementById("autocompleteList").classList.add("hidden");
        acIndex = -1;
    }

    function navAC(dir) {
        const items = document.querySelectorAll("#autocompleteList .ac-item:not(.taken):not(.in-list)");
        if (!items.length) return false;
        items.forEach(i => i.classList.remove("selected"));
        acIndex += dir;
        if (acIndex < 0) acIndex = items.length - 1;
        if (acIndex >= items.length) acIndex = 0;
        items[acIndex].classList.add("selected");
        items[acIndex].scrollIntoView({ block: "nearest" });
        return true;
    }

    function selectAC() {
        const items = document.querySelectorAll("#autocompleteList .ac-item:not(.taken):not(.in-list)");
        if (acIndex >= 0 && acIndex < items.length) { items[acIndex].click(); return true; }
        return false;
    }

    // Global lookup
    function renderPokemonResults(query) {
        const container = document.getElementById("pokemonResults");
        if (!container) return;
        const tierFilter = document.getElementById("tierFilter").value;
        let results = searchPokemon(query);
        if (tierFilter) results = results.filter(r => r.tier === tierFilter);

        container.innerHTML = results.map(r => {
            const tc = r.tier === "legendary" ? "legendary" : r.tier === "alpha" ? "alpha" : `tier-${r.tier}`;
            const tl = r.tier === "legendary" ? "LEG" : r.tier === "alpha" ? "ALPHA" : `T${r.tier}`;
            const taken = isPokemonTaken(r.name, -1);
            const sprite = getShinySpriteUrl(r.name);
            const who = taken ? members.find(m => m.targets.some(t => t.name.toLowerCase() === r.name.toLowerCase())) : null;
            return `
                <div class="pokemon-result-card ${taken ? 'taken' : ''}">
                    ${sprite ? `<img src="${sprite}" class="pokemon-result-sprite" onerror="this.style.display='none'">` : ''}
                    <span class="tier-badge ${tc}">${tl}</span>
                    <span class="pokemon-result-name">${r.name}</span>
                    <span class="pokemon-result-pts">${r.points} pts</span>
                    ${who ? `<span class="pokemon-result-who">${esc(who.name)}</span>` : ''}
                </div>
            `;
        }).join("");

        if (results.length === 0 && query && query.length >= 1) {
            container.innerHTML = '<div style="padding:0.5rem;color:var(--text-muted)">Sin resultados.</div>';
        }
    }

    // Init
    document.addEventListener("DOMContentLoaded", () => {
        renderRoster();
        updateStats();

        document.getElementById("searchInput").addEventListener("input", e => {
            searchQuery = e.target.value; renderRoster();
        });

        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                currentFilter = btn.dataset.filter;
                renderRoster();
            });
        });

        document.getElementById("modalAddBtn").addEventListener("click", addPokemon);
        document.getElementById("modalCancel").addEventListener("click", closeModal);
        document.querySelector(".close-modal").addEventListener("click", closeModal);
        document.getElementById("modal").addEventListener("click", e => { if (e.target === e.currentTarget) closeModal(); });

        const nameInput = document.getElementById("modalPokemonName");
        nameInput.addEventListener("input", e => showAutocomplete(e.target.value));
        nameInput.addEventListener("keydown", e => {
            if (e.key === "ArrowDown") { e.preventDefault(); navAC(1); }
            else if (e.key === "ArrowUp") { e.preventDefault(); navAC(-1); }
            else if (e.key === "Enter") { e.preventDefault(); if (!selectAC()) addPokemon(); }
            else if (e.key === "Escape") { hideAutocomplete(); }
        });
        nameInput.addEventListener("blur", () => setTimeout(hideAutocomplete, 200));

        document.getElementById("pokemonLookup").addEventListener("input", e => renderPokemonResults(e.target.value));
        document.getElementById("tierFilter").addEventListener("change", () => renderPokemonResults(document.getElementById("pokemonLookup").value));

        document.getElementById("pokemonLookup")?.addEventListener("input", e => renderPokemonResults(e.target.value));
        document.getElementById("tierFilter")?.addEventListener("change", () => renderPokemonResults(document.getElementById("pokemonLookup").value));

        document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
    });
})();

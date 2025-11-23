import { updateRivalsView } from './rivals.js';

let appState = null;

export function initUI(state) {
    appState = state;

    // Theme Toggle
    const header = document.querySelector('.app-header');
    if (!document.getElementById('theme-toggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'theme-toggle';
        toggleBtn.className = 'theme-toggle';
        toggleBtn.innerHTML = '🌙'; // Default to moon
        toggleBtn.title = "Cambiar Tema";

        toggleBtn.addEventListener('click', () => {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.body.removeAttribute('data-theme');
                toggleBtn.innerHTML = '🌙';
            } else {
                document.body.setAttribute('data-theme', 'dark');
                toggleBtn.innerHTML = '☀️';
            }
        });

        header.appendChild(toggleBtn);
    }

    // Navegación
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const viewId = e.target.dataset.view;
            switchView(viewId);
        });
    });

    // Selector de Temporada
    const seasonSelect = document.getElementById('season-select');
    state.seasons.forEach(season => {
        const opt = document.createElement('option');
        opt.value = season;
        opt.textContent = `${season}/${season + 1}`;
        seasonSelect.appendChild(opt);
    });

    seasonSelect.addEventListener('change', (e) => {
        state.currentSeason = parseInt(e.target.value);
        renderSummary(state.currentSeason);
    });

    // Selector de Competición
    const controlsBar = document.querySelector('#view-summary .controls-bar');
    if (!document.getElementById('comp-select')) {
        const compLabel = document.createElement('label');
        compLabel.textContent = "Competición:";
        compLabel.htmlFor = "comp-select";
        compLabel.style.marginLeft = "1rem";

        const compSelect = document.createElement('select');
        compSelect.id = "comp-select";
        compSelect.innerHTML = `
            <option value="all">Todas</option>
            <option value="bundesliga">Bundesliga</option>
            <option value="dfb_pokal">DFB Pokal</option>
            <option value="conference_league">Conference League</option>
        `;

        controlsBar.appendChild(compLabel);
        controlsBar.appendChild(compSelect);

        compSelect.addEventListener('change', () => {
            renderSummary(state.currentSeason);
        });
    }
}

export function switchView(viewId) {
    appState.currentView = viewId;

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.nav-btn[data-view="${viewId}"]`).classList.add('active');

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');

    if (viewId === 'rivals') {
        updateRivalsView();
    } else if (viewId === 'map') {
        setTimeout(() => {
            if (window.mapInstance) {
                window.mapInstance.invalidateSize();
            }
        }, 100);
    }
}

export function renderSummary(season) {
    const compFilter = document.getElementById('comp-select') ? document.getElementById('comp-select').value : 'all';

    let matches = appState.matches.filter(m => m.season === season);

    if (compFilter !== 'all') {
        matches = matches.filter(m => m.competition === compFilter);
    }

    const total = matches.length;
    const wins = matches.filter(m => m.result === 'win').length;
    const draws = matches.filter(m => m.result === 'draw').length;
    const losses = matches.filter(m => m.result === 'loss').length;

    const goalsFor = matches.reduce((acc, m) => acc + (m.isHome ? m.scoreHome : m.scoreAway), 0);
    const goalsAgainst = matches.reduce((acc, m) => acc + (m.isHome ? m.scoreAway : m.scoreHome), 0);

    // Puntos (Solo Bundesliga)
    let pointsDisplay = "-";
    if (compFilter === 'bundesliga' || compFilter === 'all') {
        const leagueMatches = matches.filter(m => m.competition === 'bundesliga');
        if (leagueMatches.length > 0) {
            const leagueWins = leagueMatches.filter(m => m.result === 'win').length;
            const leagueDraws = leagueMatches.filter(m => m.result === 'draw').length;
            const points = (leagueWins * 3) + leagueDraws;
            pointsDisplay = `${points} (BL)`;
        }
    }

    // Ronda DFB Pokal
    let pokalDisplay = "";
    const pokalMatches = appState.matches.filter(m => m.season === season && m.competition === 'dfb_pokal');
    if (pokalMatches.length > 0) {
        const lastMatch = pokalMatches.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        pokalDisplay = `<div style="font-size: 0.8rem; margin-top: 5px; color: #666;">DFB: ${lastMatch.matchday}</div>`;
    }

    // Form Guide (Últimos 5 partidos)
    const sortedMatches = [...matches].sort((a, b) => new Date(a.date) - new Date(b.date));
    const last5 = sortedMatches.slice(-5);

    let formHtml = '<div class="form-guide">';
    last5.forEach(m => {
        let resCode = 'D';
        if (m.result === 'win') resCode = 'W';
        if (m.result === 'loss') resCode = 'L';
        formHtml += `<div class="form-badge ${resCode}" title="${m.opponent} (${m.score})">${resCode}</div>`;
    });
    formHtml += '</div>';

    document.getElementById('stat-matches').textContent = total;
    document.getElementById('stat-record').textContent = `${wins} - ${draws} - ${losses}`;

    // Inject Form Guide safely
    const recordEl = document.getElementById('stat-record');
    if (!recordEl.querySelector('.form-guide')) {
        recordEl.innerHTML += formHtml;
    } else {
        recordEl.querySelector('.form-guide').outerHTML = formHtml;
    }

    document.getElementById('stat-goals').textContent = `${goalsFor} : ${goalsAgainst}`;

    const pointsEl = document.getElementById('stat-points');
    pointsEl.innerHTML = pointsDisplay + pokalDisplay;

    const tbody = document.getElementById('matches-table-body');
    tbody.innerHTML = '';

    // Tabla Inversa (Más reciente arriba)
    const reverseMatches = [...sortedMatches].reverse();

    reverseMatches.forEach(m => {
        const tr = document.createElement('tr');
        const date = new Date(m.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });

        let badgeClass = m.competition;
        let badgeText = 'UNK';
        if (m.competition === 'bundesliga') badgeText = 'BL';
        else if (m.competition === 'dfb_pokal') badgeText = 'DFB';
        else if (m.competition === 'conference_league') badgeText = 'UECL';

        const compBadge = `<span class="comp-badge ${badgeClass}">${badgeText}</span>`;

        tr.innerHTML = `
            <td>${date}</td>
            <td>${compBadge} ${m.matchday}</td>
            <td class="${m.isHome ? 'bold' : ''}">${m.team1}</td>
            <td class="score-cell ${m.result}">${m.score}</td>
            <td class="${!m.isHome ? 'bold' : ''}">${m.team2}</td>
            <td class="muted">${m.stadium || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// import { renderSummary } from './ui.js';

let appState = null;

export function initRivals(state) {
    appState = state;

    // Populate Rival Select
    const rivalSelect = document.getElementById('rival-select');
    // Get unique opponents
    const opponents = new Set();
    state.matches.forEach(m => opponents.add(m.opponent));

    const sortedOpponents = Array.from(opponents).sort();
    sortedOpponents.forEach(op => {
        const opt = document.createElement('option');
        opt.value = op;
        opt.textContent = op;
        rivalSelect.appendChild(opt);
    });

    // Event Listeners
    rivalSelect.addEventListener('change', updateRivalsView);

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const group = e.target.dataset.filter;
            // Toggle active class in group
            document.querySelectorAll(`.filter-btn[data-filter="${group}"]`).forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            updateRivalsView();
        });
    });
}

export function updateRivalsView() {
    if (!appState) return;

    // Get Filter Values
    const rival = document.getElementById('rival-select').value;
    const locBtn = document.querySelector('.filter-btn[data-filter="loc"].active');
    const resBtn = document.querySelector('.filter-btn[data-filter="res"].active');

    const locFilter = locBtn ? locBtn.dataset.val : 'all';
    const resFilter = resBtn ? resBtn.dataset.val : 'all';

    // Filter Matches
    let filtered = appState.matches.filter(m => {
        // Rival
        if (rival !== 'all' && m.opponent !== rival) return false;

        // Location
        if (locFilter === 'home' && !m.isHome) return false;
        if (locFilter === 'away' && m.isHome) return false;

        // Result
        if (resFilter !== 'all' && m.result !== resFilter) return false;

        return true;
    });

    // Update Stats
    const wins = filtered.filter(m => m.result === 'win').length;
    const draws = filtered.filter(m => m.result === 'draw').length;
    const losses = filtered.filter(m => m.result === 'loss').length;

    document.getElementById('h2h-wins').textContent = wins;
    document.getElementById('h2h-draws').textContent = draws;
    document.getElementById('h2h-losses').textContent = losses;

    // Render Table
    const tbody = document.getElementById('rivals-table-body');
    tbody.innerHTML = '';

    // Sort by date desc
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    filtered.forEach(m => {
        const tr = document.createElement('tr');
        const date = new Date(m.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });

        tr.innerHTML = `
            <td>${date}</td>
            <td>${m.season}</td>
            <td class="${m.isHome ? 'bold' : ''}">${m.team1}</td>
            <td class="score-cell ${m.result}">${m.score}</td>
            <td class="${!m.isHome ? 'bold' : ''}">${m.team2}</td>
        `;
        tbody.appendChild(tr);
    });
}

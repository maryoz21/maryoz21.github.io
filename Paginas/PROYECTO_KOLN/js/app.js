import { initUI, renderSummary } from './ui.js';
import { initRivals, updateRivalsView } from './rivals.js';
import { initMap } from './map.js';

// Estado Global
const state = {
    matches: [], // Todos los partidos cargados
    seasons: [], // Lista de temporadas disponibles
    stadiums: {}, // Mapa de estadios
    teamMap: {}, // Mapa equipo -> estadio
    currentSeason: null,
    currentView: 'summary'
};

// Configuración
const DATA_DIR = 'partidos_koln/';

async function loadData() {
    // 1. Cargar metadatos de estadios
    try {
        const [stadiumsRes, teamMapRes] = await Promise.all([
            fetch('data/stadium_locations.json'),
            fetch('data/stadium_to_team.json')
        ]);

        const stadiumsData = await stadiumsRes.json();
        state.stadiums = stadiumsData.reduce((acc, curr) => {
            acc[curr.stadium] = curr;
            return acc;
        }, {});

        state.teamMap = await teamMapRes.json();

    } catch (e) {
        console.error("Error cargando metadatos:", e);
    }

    // 2. Cargar Manifiesto
    try {
        const manifestRes = await fetch('data/manifest.json');
        if (!manifestRes.ok) throw new Error("No se encontró manifest.json");
        const manifest = await manifestRes.json();

        // 3. Cargar archivos listados en el manifiesto
        const matchPromises = manifest.map(entry =>
            fetch(entry.path)
                .then(res => res.json())
                .then(data => ({
                    year: entry.year,
                    competition: entry.competition,
                    data
                }))
                .catch(err => {
                    console.error(`Error cargando ${entry.path}`, err);
                    return { year: entry.year, competition: entry.competition, data: [] };
                })
        );

        const results = await Promise.all(matchPromises);

        // 4. Procesar y normalizar datos
        results.forEach(({ year, competition, data }) => {
            if (data && data.length > 0) {
                if (!state.seasons.includes(year)) state.seasons.push(year);

                // Normalizar cada partido
                const processed = data.map(m => processMatch(m, year, competition));
                state.matches.push(...processed);
            }
        });

        state.seasons.sort((a, b) => b - a); // Descendente
        state.currentSeason = state.seasons[0];

        console.log(`Cargados ${state.matches.length} partidos de ${state.seasons.length} temporadas.`);

    } catch (e) {
        console.error("Error crítico cargando datos:", e);
    }
}

function processMatch(match, season, competition) {
    // Normalizar estructura de OpenLigaDB
    const team1 = match.team1.teamName;
    const team2 = match.team2.teamName;
    const isHome = match.team1.teamId === 65; // 65 es Köln
    const opponent = isHome ? team2 : team1;

    // Resultado
    const endResult = match.matchResults.find(r => r.resultTypeID === 2) || match.matchResults[0];
    const scoreHome = endResult ? endResult.pointsTeam1 : 0;
    const scoreAway = endResult ? endResult.pointsTeam2 : 0;
    const score = `${scoreHome} : ${scoreAway}`;

    // Determinar W/D/L para Köln
    let result = 'draw';
    if (isHome) {
        if (scoreHome > scoreAway) result = 'win';
        else if (scoreHome < scoreAway) result = 'loss';
    } else {
        if (scoreAway > scoreHome) result = 'win';
        else if (scoreAway < scoreHome) result = 'loss';
    }

    // Inferencia de Estadio
    let stadium = match.location ? match.location.locationStadium : null;
    if (!stadium) {
        if (isHome) {
            stadium = "RheinEnergieStadion";
        } else {
            stadium = state.teamMap[opponent] || "Desconocido";
        }
    }

    return {
        id: match.matchID,
        date: match.matchDateTime,
        season: season,
        competition: competition, // Nuevo campo
        matchday: match.group.groupName,
        team1,
        team2,
        score,
        scoreHome,
        scoreAway,
        isHome,
        opponent,
        result, // 'win', 'draw', 'loss'
        stadium
    };
}

async function init() {
    await loadData();

    // Inicializar módulos
    initUI(state);
    initRivals(state);
    initMap(state);

    // Render inicial
    if (state.currentSeason) {
        renderSummary(state.currentSeason);
    }
}

// Exponer estado para debug si es necesario
window.appState = state;

// Arrancar
document.addEventListener('DOMContentLoaded', init);

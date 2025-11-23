import { switchView } from './ui.js';

let map = null;
let appState = null;

export function initMap(state) {
    appState = state;

    // Initialize Leaflet
    // Usar un estilo más visual (Voyager de CartoDB)
    map = L.map('map-container').setView([51.1657, 10.4515], 6);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Expose map instance for resize invalidation
    window.mapInstance = map;

    // Controles de Mapa
    initMapControls();

    addMarkers();
}

function initMapControls() {
    const mapContainer = document.getElementById('map-container');

    // Crear overlay de controles
    const overlay = document.createElement('div');
    overlay.className = 'map-controls-overlay';
    overlay.innerHTML = `
        <div class="map-control-group">
            <label>Rango de Temporadas</label>
            <div class="slider-container">
                <select id="map-season-start"></select>
                <span>-</span>
                <select id="map-season-end"></select>
            </div>
        </div>
        <div class="map-control-group">
            <label>Filtrar por Rival</label>
            <select id="map-rival-filter">
                <option value="all">Todos los rivales</option>
            </select>
        </div>
    `;

    // Insertar antes del mapa (o dentro del contenedor relativo)
    mapContainer.parentElement.style.position = 'relative';
    mapContainer.parentElement.appendChild(overlay);

    // Poblar selectores
    const startSelect = overlay.querySelector('#map-season-start');
    const endSelect = overlay.querySelector('#map-season-end');
    const rivalSelect = overlay.querySelector('#map-rival-filter');

    // Temporadas (ordenadas)
    const seasons = [...appState.seasons].sort((a, b) => a - b);
    seasons.forEach(s => {
        startSelect.add(new Option(`${s}/${s + 1}`, s));
        endSelect.add(new Option(`${s}/${s + 1}`, s));
    });

    // Seleccionar rango completo por defecto
    startSelect.value = seasons[0];
    endSelect.value = seasons[seasons.length - 1];

    // Rivales (únicos y ordenados)
    const rivals = [...new Set(appState.matches.map(m => m.opponent))].sort();
    rivals.forEach(r => {
        rivalSelect.add(new Option(r, r));
    });

    // Event Listeners
    const update = () => {
        const start = parseInt(startSelect.value);
        const end = parseInt(endSelect.value);
        const rival = rivalSelect.value;
        addMarkers(start, end, rival);
    };

    startSelect.addEventListener('change', update);
    endSelect.addEventListener('change', update);
    rivalSelect.addEventListener('change', update);
}

function addMarkers(startSeason = null, endSeason = null, rivalFilter = 'all') {
    // Limpiar marcadores existentes
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    const stadiums = appState.stadiums;

    Object.values(stadiums).forEach(loc => {
        // Filtrar partidos por estadio
        let matchesInStadium = appState.matches.filter(m => m.stadium === loc.stadium);

        // Filtrar por Rango de Temporada
        if (startSeason !== null && endSeason !== null) {
            matchesInStadium = matchesInStadium.filter(m => m.season >= startSeason && m.season <= endSeason);
        }

        // Filtrar por Rival
        if (rivalFilter !== 'all') {
            matchesInStadium = matchesInStadium.filter(m => m.opponent === rivalFilter);
        }

        if (matchesInStadium.length === 0) return;

        const wins = matchesInStadium.filter(m => m.result === 'win').length;
        const draws = matchesInStadium.filter(m => m.result === 'draw').length;
        const losses = matchesInStadium.filter(m => m.result === 'loss').length;

        const isHomeStadium = loc.stadium === "RheinEnergieStadion";

        // Icono "3D" usando CSS
        const markerHtml = `
            <div class="pin-3d ${isHomeStadium ? 'home' : 'away'}">
                <div class="pin-head"></div>
                <div class="pin-base"></div>
            </div>
        `;

        const icon = L.divIcon({
            className: 'custom-marker-3d',
            html: markerHtml,
            iconSize: [30, 40],
            iconAnchor: [15, 40],
            popupAnchor: [0, -40]
        });

        const marker = L.marker([loc.lat, loc.lon], { icon: icon }).addTo(map);

        // Popup Mejorado
        const popupContent = document.createElement('div');
        popupContent.className = 'map-popup';
        popupContent.innerHTML = `
            <h4>${loc.stadium}</h4>
            <div class="popup-stats">
                <div class="stat-pill win">V: ${wins}</div>
                <div class="stat-pill draw">E: ${draws}</div>
                <div class="stat-pill loss">D: ${losses}</div>
            </div>
            <p class="total-matches">${matchesInStadium.length} Partidos</p>
            <button class="view-matches-btn">Ver Partidos</button>
        `;

        // Evento en el botón del popup
        const btn = popupContent.querySelector('.view-matches-btn');
        btn.addEventListener('click', () => {
            const teamName = Object.keys(appState.teamMap).find(key => appState.teamMap[key] === loc.stadium);

            if (teamName) {
                const rivalSelect = document.getElementById('rival-select');
                if (rivalSelect.querySelector(`option[value="${teamName}"]`)) {
                    rivalSelect.value = teamName;
                    rivalSelect.dispatchEvent(new Event('change'));
                }
            }
            switchView('rivals');
        });

        marker.bindPopup(popupContent);
    });
}

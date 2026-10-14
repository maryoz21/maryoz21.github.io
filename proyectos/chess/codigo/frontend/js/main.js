// Chess - Lógica principal del frontend

const API_URL = 'http://localhost:5000';

// ── Elementos DOM ──
const loginScreen   = document.getElementById('loginScreen');
const input         = document.getElementById('playerName');
const button        = document.getElementById('submitBtn');
const message       = document.getElementById('message');

const menuScreen    = document.getElementById('menuScreen');
const displayName   = document.getElementById('displayName');
const logoutBtn     = document.getElementById('logoutBtn');
const playCard      = document.getElementById('playCard');
const matchList     = document.getElementById('matchList');

const modalOverlay  = document.getElementById('modalOverlay');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const userList      = document.getElementById('userList');
const playMessage   = document.getElementById('playMessage');

const boardScreen   = document.getElementById('boardScreen');
const boardBackBtn  = document.getElementById('boardBackBtn');
const boardPlayer1  = document.getElementById('boardPlayer1');
const boardPlayer2  = document.getElementById('boardPlayer2');
const boardTurn     = document.getElementById('boardTurn');
const canvas        = document.getElementById('chessCanvas');
const ctx           = canvas.getContext('2d');

// ── Estado global ──
let currentPlayer   = sessionStorage.getItem('playerName') || '';
let pollingInterval = null;
let boardPolling    = null;
let currentMatchId  = null;
let currentMatch    = null;   // { match_id, player1, player2, turn }

// ── Constantes tablero ──
const CELL = 80;
const COLS = 8;
canvas.width  = CELL * COLS;
canvas.height = CELL * COLS;

const PIECE_SYMBOLS = {
    PAWN:   { WHITE: '♙', BLACK: '♟' },
    ROOK:   { WHITE: '♖', BLACK: '♜' },
    KNIGHT: { WHITE: '♘', BLACK: '♞' },
    BISHOP: { WHITE: '♗', BLACK: '♝' },
    QUEEN:  { WHITE: '♕', BLACK: '♛' },
    KING:   { WHITE: '♔', BLACK: '♚' },
};

// ── Estado de selección de pieza ──
let selectedCell  = null;   // { x, y } en coordenadas de tablero (1-8)
let legalMoves    = [];     // [{ x, y }, ...]
let lastPieces    = [];     // última lista de piezas recibida del servidor

// ════════════════════════════════════════
// LOGIN
// ════════════════════════════════════════

button.addEventListener('click', async () => {
    const name = input.value.trim();
    if (!name) {
        message.textContent = 'Por favor, introduce tu nombre.';
        message.className = 'message error';
        return;
    }
    try {
        const response = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        const data = await response.json();
        if (response.ok) {
            currentPlayer = data.name;
            sessionStorage.setItem('playerName', currentPlayer);
            showMenu();
        } else {
            message.textContent = data.detail;
            message.className = 'message error';
        }
    } catch {
        message.textContent = 'No se pudo conectar con el servidor.';
        message.className = 'message error';
    }
});

// ════════════════════════════════════════
// MENÚ
// ════════════════════════════════════════

function showMenu() {
    loginScreen.classList.add('hidden');
    boardScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
    displayName.textContent = currentPlayer;
    loadMatches();
    startPolling();
}

logoutBtn.addEventListener('click', () => {
    stopPolling();
    sessionStorage.removeItem('playerName');
    currentPlayer = '';
    menuScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    input.value = '';
    message.textContent = '';
});

document.querySelectorAll('.sidebar nav li').forEach(li => {
    li.addEventListener('click', () => {
        document.querySelectorAll('.sidebar nav li').forEach(l => l.classList.remove('active'));
        li.classList.add('active');
    });
});

// ── Cargar lista de partidas ──
async function loadMatches() {
    if (!currentPlayer) return;
    try {
        const response = await fetch(`${API_URL}/api/match?player=${encodeURIComponent(currentPlayer)}`);
        const data = await response.json();
        matchList.innerHTML = '';

        if (data.matches.length === 0) {
            matchList.innerHTML = '<li class="match-item empty">Sin partidas activas.</li>';
            return;
        }

        data.matches.forEach(m => {
            const rival = m.player1 === currentPlayer ? m.player2 : m.player1;
            const li = document.createElement('li');
            li.className = 'match-item';
            li.innerHTML = `
                <span>⚔️ #${m.match_id} — vs ${rival}</span>
                <button class="btn-open-match"
                        data-id="${m.match_id}"
                        data-p1="${m.player1}"
                        data-p2="${m.player2}">Abrir</button>
            `;
            li.querySelector('.btn-open-match').addEventListener('click', (e) => {
                const btn = e.currentTarget;
                openBoard(Number(btn.dataset.id), btn.dataset.p1, btn.dataset.p2);
            });
            matchList.appendChild(li);
        });
    } catch { /* silencioso */ }
}

// ── Polling 5s ──
function startPolling() {
    if (pollingInterval) return;
    pollingInterval = setInterval(() => loadMatches(), 5000);
}

function stopPolling() {
    clearInterval(pollingInterval);
    pollingInterval = null;
}

// ════════════════════════════════════════
// MODAL — SELECCIONAR RIVAL
// ════════════════════════════════════════

playCard.addEventListener('click', async () => {
    playMessage.textContent = '';
    userList.innerHTML = '<li class="modal-user-item empty">Cargando...</li>';
    modalOverlay.classList.remove('hidden');

    try {
        const response = await fetch(`${API_URL}/api/user`);
        const data = await response.json();
        const rivals = data.users.filter(u => u !== currentPlayer);

        userList.innerHTML = '';
        if (rivals.length === 0) {
            userList.innerHTML = '<li class="modal-user-item empty">No hay otros jugadores registrados aún.</li>';
            return;
        }
        rivals.forEach(user => {
            const li = document.createElement('li');
            li.className = 'modal-user-item';
            li.innerHTML = `<span>👤 ${user}</span><button class="btn-challenge">Jugar</button>`;
            li.querySelector('.btn-challenge').addEventListener('click', () => createMatch(user));
            userList.appendChild(li);
        });
    } catch {
        userList.innerHTML = '<li class="modal-user-item empty">Error al cargar jugadores.</li>';
    }
});

modalCloseBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

function closeModal() {
    modalOverlay.classList.add('hidden');
    playMessage.textContent = '';
}

async function createMatch(rival) {
    try {
        const response = await fetch(`${API_URL}/api/match`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ player1: currentPlayer, player2: rival })
        });
        const data = await response.json();
        if (response.ok) {
            playMessage.textContent = `✅ Partida #${data.match_id} creada vs ${rival}`;
            playMessage.className = 'message success';
            await loadMatches();
        } else {
            playMessage.textContent = data.detail;
            playMessage.className = 'message error';
        }
    } catch {
        playMessage.textContent = 'Error al crear la partida.';
        playMessage.className = 'message error';
    }
}

// ════════════════════════════════════════
// TABLERO
// ════════════════════════════════════════

// ── openBoard: punto de entrada desde botón "Abrir" ──
// matchId es el id numérico de la partida creada en el servidor
async function openBoard(matchId, p1, p2) {
    currentMatchId = matchId;
    selectedCell   = null;
    legalMoves     = [];
    lastPieces     = [];
    stopPolling();
    menuScreen.classList.add('hidden');
    boardScreen.classList.remove('hidden');

    boardPlayer1.textContent = `⬜ ${p1}`;
    boardPlayer2.textContent = `⬛ ${p2}`;

    await drawMatch();
    boardPolling = setInterval(drawMatch, 3000);
}

// ── Volver al menú ──
boardBackBtn.addEventListener('click', () => {
    clearInterval(boardPolling);
    boardPolling = null;
    currentMatchId = null;
    currentMatch = null;
    boardScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
    startPolling();
});

// ── drawMatch: orquesta getMatch → getFigures → drawBoard → drawFigures ──
async function drawMatch() {
    const match = await getMatch(currentMatchId);
    if (!match) return;

    currentMatch = match;
    boardTurn.textContent = `Turno: ${match.turn === 'WHITE' ? '⬜ Blancas' : '⬛ Negras'}`;

    const pieces = await getFigures(currentMatchId);
    if (!pieces) return;

    lastPieces = pieces;
    drawBoard();
    drawHighlights();
    drawFigures(pieces);
}

// ── getMatch: GET /api/match/{id} → { match_id, player1, player2, turn } ──
async function getMatch(matchId) {
    try {
        const response = await fetch(`${API_URL}/api/match/${matchId}`);
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

// ── getFigures: GET /api/match/{id}/board → lista de piezas ──
async function getFigures(matchId) {
    try {
        const response = await fetch(`${API_URL}/api/match/${matchId}/board`);
        if (!response.ok) return null;
        const data = await response.json();
        return data.pieces;   // [{ type, color, x, y }, ...]
    } catch {
        return null;
    }
}

// ════════════════════════════════════════
// INTERACCIÓN CON EL TABLERO (clicks)
// ════════════════════════════════════════

// Convierte pixel del canvas → coordenada de tablero { x: 1-8, y: 1-8 }
function canvasPixelToCell(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const col = Math.floor((event.clientX - rect.left) * scaleX / CELL);  // 0-7
    const row = Math.floor((event.clientY - rect.top)  * scaleY / CELL);  // 0-7
    if (col < 0 || col >= COLS || row < 0 || row >= COLS) return null;
    return { x: col + 1, y: 8 - row };   // tablero: x 1-8, y 1 (abajo) – 8 (arriba)
}

// Devuelve la pieza de lastPieces en (x, y), o null
function getPieceAt(x, y) {
    return lastPieces.find(p => p.x === x && p.y === y) ?? null;
}

// Determina si la pieza en (x,y) le pertenece al jugador actual según el turno
function isMyPiece(piece) {
    if (!currentMatch || !piece) return false;
    const myColor = currentMatch.player1 === currentPlayer ? 'WHITE' : 'BLACK';
    return piece.color === myColor;
}

canvas.addEventListener('click', async (event) => {
    if (!currentMatchId || !currentMatch) return;

    const cell = canvasPixelToCell(event);
    if (!cell) return;

    // ── Caso 1: hay pieza seleccionada ──
    if (selectedCell) {
        const isLegal = legalMoves.some(m => m[0] === cell.x && m[1] === cell.y);

        if (isLegal) {
            // Ejecutar movimiento
            await postMove(selectedCell.x, selectedCell.y, cell.x, cell.y);
            selectedCell = null;
            legalMoves   = [];
            return;
        }

        // Click en otra pieza propia → cambiar selección
        const clicked = getPieceAt(cell.x, cell.y);
        if (clicked && isMyPiece(clicked)) {
            await selectCell(cell.x, cell.y);
            return;
        }

        // Click en casilla inválida → deseleccionar
        selectedCell = null;
        legalMoves   = [];
        drawBoard();
        drawFigures(lastPieces);
        return;
    }

    // ── Caso 2: no hay selección → intentar seleccionar ──
    const piece = getPieceAt(cell.x, cell.y);
    if (!piece) return;

    // Solo puede mover el jugador cuyo turno es
    if (!isMyPiece(piece)) return;

    await selectCell(cell.x, cell.y);
});

// Pide los movimientos legales al servidor y repinta
async function selectCell(x, y) {
    try {
        const response = await fetch(`${API_URL}/api/match/${currentMatchId}/moves?x=${x}&y=${y}`);
        if (!response.ok) return;
        const data = await response.json();
        selectedCell = { x, y };
        legalMoves   = data.moves;   // [[x,y], ...]
        drawBoard();
        drawHighlights();
        drawFigures(lastPieces);
    } catch { /* silencioso */ }
}

// Envía el movimiento al servidor y refresca el tablero
async function postMove(fx, fy, tx, ty) {
    try {
        const response = await fetch(`${API_URL}/api/match/${currentMatchId}/move`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from_x: fx, from_y: fy, to_x: tx, to_y: ty })
        });
        if (!response.ok) return;
        await drawMatch();
    } catch { /* silencioso */ }
}

// ── drawHighlights: pinta la casilla seleccionada y los movimientos legales ──
function drawHighlights() {
    if (!selectedCell) return;

    // Casilla seleccionada — amarillo semitransparente
    const selCol = selectedCell.x - 1;
    const selRow = 8 - selectedCell.y;
    ctx.fillStyle = 'rgba(255, 215, 0, 0.55)';
    ctx.fillRect(selCol * CELL, selRow * CELL, CELL, CELL);

    // Movimientos legales — punto verde o marco rojo si hay captura
    legalMoves.forEach(([mx, my]) => {
        const col = mx - 1;
        const row = 8 - my;
        const hasPiece = getPieceAt(mx, my) !== null;

        if (hasPiece) {
            // Captura: marco rojo
            ctx.strokeStyle = 'rgba(200, 30, 30, 0.85)';
            ctx.lineWidth = 4;
            ctx.strokeRect(col * CELL + 2, row * CELL + 2, CELL - 4, CELL - 4);
        } else {
            // Movimiento libre: círculo verde
            ctx.fillStyle = 'rgba(50, 180, 50, 0.55)';
            ctx.beginPath();
            ctx.arc(col * CELL + CELL / 2, row * CELL + CELL / 2, CELL * 0.2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// ── drawBoard: pinta el tablero vacío (casillas + coordenadas) ──
function drawBoard() {
    for (let row = 0; row < COLS; row++) {
        for (let col = 0; col < COLS; col++) {
            const isLight = (row + col) % 2 === 0;
            ctx.fillStyle = isLight ? '#f0d9b5' : '#b58863';
            ctx.fillRect(col * CELL, row * CELL, CELL, CELL);
        }
    }

    ctx.font = `bold ${CELL * 0.18}px Arial`;
    for (let i = 0; i < COLS; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#b58863' : '#f0d9b5';
        ctx.fillText(String.fromCharCode(65 + i), i * CELL + 4, CELL * COLS - 4);
        ctx.fillStyle = i % 2 === 0 ? '#f0d9b5' : '#b58863';
        ctx.fillText(8 - i, 4, i * CELL + 16);
    }
}

// ── drawFigures: pinta las piezas sobre el tablero ──
function drawFigures(pieces) {
    ctx.font = `${CELL * 0.75}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    pieces.forEach(p => {
        const col = p.x - 1;
        const row = 8 - p.y;
        const symbol = PIECE_SYMBOLS[p.type]?.[p.color] ?? '?';

        if (p.color === 'WHITE') {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 3;
            ctx.strokeText(symbol, col * CELL + CELL / 2, row * CELL + CELL / 2);
        }
        ctx.fillStyle = p.color === 'WHITE' ? '#ffffff' : '#1a1a1a';
        ctx.fillText(symbol, col * CELL + CELL / 2, row * CELL + CELL / 2);
    });

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
}

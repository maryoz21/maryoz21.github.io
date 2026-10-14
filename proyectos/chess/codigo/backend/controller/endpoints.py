from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.MatchesService import MatchesService

# ── Requests ──
class PlayerRequest(BaseModel):
    name: str

class MatchRequest(BaseModel):
    player1: str
    player2: str

# ── Responses ──
class PlayerResponse(BaseModel):
    message: str
    name: str

class UserListResponse(BaseModel):
    users: list[str]

class MatchResponse(BaseModel):
    match_id: int
    player1: str
    player2: str

class MatchListResponse(BaseModel):
    matches: list[MatchResponse]

class ActiveMatchResponse(BaseModel):
    in_match: bool
    match_id: int | None
    player1: str | None
    player2: str | None

class PieceInfo(BaseModel):
    type: str
    color: str
    x: int
    y: int

class LegalMovesResponse(BaseModel):
    x: int
    y: int
    moves: list[tuple[int, int]]

class MoveRequest(BaseModel):
    from_x: int
    from_y: int
    to_x: int
    to_y: int

class MoveResponse(BaseModel):
    success: bool
    turn: str

class MatchDetailResponse(BaseModel):
    match_id: int
    player1: str
    player2: str
    turn: str

class BoardStateResponse(BaseModel):
    match_id: int
    turn: str
    pieces: list[PieceInfo]

# ── Estado ──
router = APIRouter()
users: list[str] = []
matches_service = MatchesService()
next_match_id: int = 1


# ── /api/register ──
@router.post("/api/register", response_model=PlayerResponse)
def register(req: PlayerRequest):
    if not req.name.strip():
        raise HTTPException(status_code=400, detail="Nombre no válido")

    name = req.name.strip()
    if name not in users:
        users.append(name)
    return PlayerResponse(message=f"Bienvenido, {name}!", name=name)


# ── /api/user ──
@router.get("/api/user", response_model=UserListResponse)
def get_users():
    return UserListResponse(users=users)


# ── /api/match ──
@router.post("/api/match", response_model=MatchResponse)
def create_match(req: MatchRequest):
    global next_match_id

    if req.player1 not in users:
        raise HTTPException(status_code=404, detail=f"Usuario '{req.player1}' no encontrado")
    if req.player2 not in users:
        raise HTTPException(status_code=404, detail=f"Usuario '{req.player2}' no encontrado")
    if req.player1 == req.player2:
        raise HTTPException(status_code=400, detail="Los dos jugadores deben ser distintos")

    from services.match import Match
    match = Match(next_match_id, req.player1, req.player2)
    matches_service.add_match(match)
    matches_service.start_position(next_match_id)
    match_id = next_match_id
    next_match_id += 1

    return MatchResponse(match_id=match_id, player1=req.player1, player2=req.player2)


# ── GET /api/match?player=nombre ──
@router.get("/api/match", response_model=MatchListResponse)
def get_matches(player: str = None):
    result = []
    for m in matches_service.matches:
        if player is None or m.get_player1() == player or m.get_player2() == player:
            result.append(MatchResponse(
                match_id=m.get_match_id(),
                player1=m.get_player1(),
                player2=m.get_player2()
            ))
    return MatchListResponse(matches=result)


# ── GET /api/match/active?player=nombre (polling) ──
@router.get("/api/match/active", response_model=ActiveMatchResponse)
def get_active_match(player: str):
    for m in matches_service.matches:
        if m.get_player1() == player or m.get_player2() == player:
            return ActiveMatchResponse(
                in_match=True,
                match_id=m.get_match_id(),
                player1=m.get_player1(),
                player2=m.get_player2()
            )
    return ActiveMatchResponse(in_match=False, match_id=None, player1=None, player2=None)


# ── GET /api/match/{match_id} → detalle de una partida ──
@router.get("/api/match/{match_id}", response_model=MatchDetailResponse)
def get_match(match_id: int):
    match = matches_service.get_match_by_id(match_id)
    if match is None:
        raise HTTPException(status_code=404, detail="Partida no encontrada")
    return MatchDetailResponse(
        match_id=match_id,
        player1=match.get_player1(),
        player2=match.get_player2(),
        turn=match.turn.name
    )


# ── GET /api/match/{match_id}/board ──
@router.get("/api/match/{match_id}/board", response_model=BoardStateResponse)
def get_board(match_id: int):
    match = matches_service.get_match_by_id(match_id)
    if match is None:
        raise HTTPException(status_code=404, detail="Partida no encontrada")

    board = match.get_board()
    pieces = []

    for y in range(1, 9):
        for x in range(1, 9):
            piece = board.get_piece_at(x, y)
            if piece is not None:
                pieces.append(PieceInfo(
                    type=piece.get_type_of_piece().name,
                    color=piece.get_color().name,
                    x=x,
                    y=y
                ))

    return BoardStateResponse(
        match_id=match_id,
        turn=match.turn.name,
        pieces=pieces
    )


# ── GET /api/match/{match_id}/moves?x=&y= → movimientos legales de una pieza ──
@router.get("/api/match/{match_id}/moves", response_model=LegalMovesResponse)
def get_legal_moves(match_id: int, x: int, y: int):
    match = matches_service.get_match_by_id(match_id)
    if match is None:
        raise HTTPException(status_code=404, detail="Partida no encontrada")

    board = match.get_board()
    piece = board.get_piece_at(x, y)

    if piece is None:
        return LegalMovesResponse(x=x, y=y, moves=[])

    raw_moves = piece.movimientos_posibles(board)
    legal = [
        (mx, my)
        for mx, my in raw_moves
        if board.is_move_legal(piece, mx, my)
    ]
    return LegalMovesResponse(x=x, y=y, moves=legal)


# ── POST /api/match/{match_id}/move → ejecutar movimiento ──
@router.post("/api/match/{match_id}/move", response_model=MoveResponse)
def make_move(match_id: int, req: MoveRequest):
    match = matches_service.get_match_by_id(match_id)
    if match is None:
        raise HTTPException(status_code=404, detail="Partida no encontrada")

    success = matches_service.move(match_id, req.from_x, req.from_y, req.to_x, req.to_y)
    if not success:
        raise HTTPException(status_code=400, detail="Movimiento no válido")

    return MoveResponse(success=True, turn=match.turn.name)
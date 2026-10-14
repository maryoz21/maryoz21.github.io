from model.board_impl import BoardImpl
from model.pieces import PieceType, Color
# Me he hecho esto para verlo de manera mas visual
def print_square(board: BoardImpl, x: int, y: int):
    simbolos = {
        (PieceType.KING, Color.WHITE): "♔", (PieceType.QUEEN, Color.WHITE): "♕",
        (PieceType.ROOK, Color.WHITE): "♖", (PieceType.BISHOP, Color.WHITE): "♗",
        (PieceType.KNIGHT, Color.WHITE): "♘", (PieceType.PAWN, Color.WHITE): "♙",
        (PieceType.KING, Color.BLACK): "♚", (PieceType.QUEEN, Color.BLACK): "♛",
        (PieceType.ROOK, Color.BLACK): "♜", (PieceType.BISHOP, Color.BLACK): "♝",
        (PieceType.KNIGHT, Color.BLACK): "♞", (PieceType.PAWN, Color.BLACK): "♟",
    }
    piece = board.get_piece_at(x, y)
    emoji = simbolos.get((piece.get_type_of_piece(), piece.get_color()), " ") if piece else "."
    if x == 1:
        print(f"{y} | ", end="")
    print(f"{emoji} ", end="")
    if x == 8:
        print(f"| {y}")
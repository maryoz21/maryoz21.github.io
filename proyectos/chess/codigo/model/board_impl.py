from __future__ import annotations
from typing import *
from model.pieces import *
from model.board import Board

class BoardImpl(Board):
    def __init__(self):
        self.__pieces: dict[tuple[int, int], Piece] = {}
        self.__size: int = 8
        self.last_move: tuple[Piece, int, int, int, int] = None

    
    def get_piece_at(self, x: int, y: int) -> Piece | None:
        return self.__pieces.get((x, y))
    
    def get_size(self) -> int:
        return self.__size
    
    def get_last_move(self) -> tuple[Piece, int, int, int, int] | None:
        return self.last_move
    
    def is_in_bounds(self, x: int, y: int) -> bool:
        if x is None or y is None:
            return False
        size = self.get_size()
        if x <= size and x > 0:
            if y <= size and y > 0:
                return True
        return False
    
    def visit_squares(self, visitor: Callable[[BoardImpl, int, int], None]):
        for y in range(self.get_size(), 0, -1):
            for x in range(1, self.get_size() + 1):
                visitor(self, x, y)


    def add_piece(self, piece: Piece):
        if piece is None:
            return
        
        x = piece.get_x()
        y = piece.get_y()

        if self.is_in_bounds(x, y):
            self.__pieces[(x, y)] = piece

    def delete_piece(self, piece: Piece):
        if piece is None:
            return
        x = piece.get_x()
        y = piece.get_y()

        self.__pieces.pop((x, y), None)

    def __captura(self, piece: Piece, from_x: int, from_y: int, to_x: int, to_y: int):
        target_piece = self.get_piece_at(to_x, to_y)
        al_paso = False
        
        if piece.get_type_of_piece() == PieceType.PAWN and from_x != to_x and target_piece is None:
            al_paso = True

        if target_piece is not None:
            self.delete_piece(target_piece)
        elif al_paso:
            peon = self.get_piece_at(to_x, from_y)
            if peon is not None:
                self.delete_piece(peon)
        
    def __enroque(self, piece: Piece, from_x: int, to_x: int, from_y: int):
        if piece.get_type_of_piece() == PieceType.KING and abs(from_x - to_x) == 2:
            if to_x == 7:
                torre = self.get_piece_at(8, from_y)
                if torre is not None:
                    self.delete_piece(torre)
                    torre.set_x(6)
                    self.add_piece(torre)
                    torre.set_has_moved(True)
            elif to_x == 3:
                torre = self.get_piece_at(1, from_y)
                if torre is not None:
                    self.delete_piece(torre)
                    torre.set_x(4)
                    self.add_piece(torre)
                    torre.set_has_moved(True)

    def __coronar(self, piece: Piece, to_x: int, to_y: int):
        if piece.get_type_of_piece() == PieceType.PAWN:
            if piece.coronar():
                self.delete_piece(piece)
                nueva_reina = Queen(piece.get_color(), to_x, to_y)
                self.add_piece(nueva_reina)

    def move_piece(self, from_x: int, from_y: int, to_x: int, to_y: int) -> bool:
        if not self.is_in_bounds(from_x, from_y):
            return False
        
        piece = self.__pieces.get((from_x, from_y))

        if piece is None:
            return False
        
        if not self.is_in_bounds(to_x, to_y):
            return False
        
        if not piece.can_i_move(to_x, to_y, self):
            return False
        
        if not self.is_move_legal(piece, to_x, to_y):
            return False
        
        self.__captura(piece, from_x, from_y, to_x, to_y)

        self.delete_piece(piece)
        piece.set_x(to_x)
        piece.set_y(to_y)
        self.add_piece(piece)

        self.__enroque(piece, from_x, to_x, from_y)
        self.__coronar(piece, to_x, to_y)
        
        self.last_move = (piece, from_x, from_y, to_x, to_y)
        piece.set_has_moved(True)
                
        return True

    def is_check(self, color: Color) -> bool:
        king_pos = None

        for (x, y), piece in self.__pieces.items():
            if piece.get_type_of_piece() == PieceType.KING and piece.get_color() == color:
                king_pos = (x, y)
                break
        
        if king_pos is None:
            return False
        piezas: list[Piece] = list(self.__pieces.values())
        for piece in piezas:
            if piece.get_color() != color:
                if piece.get_type_of_piece() == PieceType.KING:
                    if abs(piece.get_x() - king_pos[0]) <= 1 and abs(piece.get_y() - king_pos[1]) <= 1:
                        return True
                else:
                    movimientos_rivales = piece.movimientos_posibles(self)
        
                    for mov_x, mov_y in movimientos_rivales:
                        if mov_x == king_pos[0] and mov_y == king_pos[1]:
                            return True
        return False
                
    def is_move_legal(self, piece: Piece, to_x: int, to_y: int) -> bool:
        from_x = piece.get_x()
        from_y = piece.get_y()
        color = piece.get_color()

        target_piece = self.get_piece_at(to_x, to_y)
        self.delete_piece(piece)

        if target_piece is not None:
            self.delete_piece(target_piece)

        piece.set_x(to_x)
        piece.set_y(to_y)
        self.add_piece(piece)
        is_legal = False if self.is_check(color) else True

        self.delete_piece(piece)
        piece.set_x(from_x)
        piece.set_y(from_y)
        self.add_piece(piece)

        if target_piece is not None:
            self.add_piece(target_piece)
        
        return is_legal
     
    def has_any_legal_move(self, color: Color) -> bool:
        for piece in list(self.__pieces.values()):
            if piece.get_color() == color:
                movimientos = piece.movimientos_posibles(self)

                for mov_x, mov_y in movimientos:
                    if self.is_move_legal(piece, mov_x, mov_y):
                        return True
        return False

    def is_checkmate(self, color: Color) -> bool:
        if self.is_check(color) == False:
            return False
        
        tiene_movimientos = self.has_any_legal_move(color)

        if tiene_movimientos:
            return False
        return True



    def is_stalemate(self, color: Color) -> bool:
        if self.is_check(color):
            return False
        
        tiene_movimientos = self.has_any_legal_move(color)
        if tiene_movimientos:
            return False
        return True

    
from __future__ import annotations
from typing import TYPE_CHECKING
from abc import ABC, abstractmethod
from enum import Enum
if TYPE_CHECKING:
    from board import Board

class Color(Enum):
    WHITE = 1
    BLACK = 2

class PieceType(Enum):
    PAWN = 1
    ROOK = 2
    KNIGHT = 3
    BISHOP = 4
    QUEEN = 5
    KING = 6

class Piece(ABC):
    def __init__(self, color: Color, x: int, y: int, piece_type: PieceType):
        self.__color = color
        self.__x = x
        self.__y = y
        self.__piece_type: PieceType = piece_type
        self.__has_moved: bool = False

    def get_has_moved(self) -> bool:
        return self.__has_moved
    
    def set_has_moved(self, moved: bool):
        self.__has_moved = moved

    def get_color(self) -> Color:
        return self.__color
    
    def set_x(self, x: int):
        self.__x = x

    def get_x(self) -> int:
        return self.__x
    
    def set_y(self, y: int):
        self.__y = y

    def get_y(self) -> int:
        return self.__y

    def can_i_move(self, x: int, y: int, board: 'Board'):
        if board.is_in_bounds(x,y):
            posible_moves = self.movimientos_posibles(board)
            for move in posible_moves:
                mov_x, mov_y = move
                if mov_x == x and mov_y == y:
                    return True
        return False    
    


    @abstractmethod
    def movimientos_posibles(self, board: 'Board') -> list[tuple[int, int]]:
        pass

    def get_type_of_piece(self) -> PieceType:
        return self.__piece_type

class Pawn(Piece):
    def __init__(self, color, x, y):
        super().__init__(color, x, y, PieceType.PAWN)    
        
    
    def coronar(self) -> bool:
        if self.get_color() == Color.BLACK:
            return self.get_y() == 1
        return self.get_y() == 8

    def is_pawn_in_start_position(self):
        if self.get_color() == Color.BLACK:
            return self.get_y() == 7
        return self.get_y() == 2

    def movimientos_posibles(self, board: 'Board') -> list[tuple[int, int]]:
        movement_list =[]
        x = self.get_x()
        y = self.get_y()
        color = self.get_color()

        direction = 1
        if color == Color.BLACK:
            direction = -1
        
        next_y = y + direction

        if board.is_in_bounds(x, next_y):
            piece_at_front = board.get_piece_at(x, next_y)
            if piece_at_front is None:
                movement_list.append((x, next_y))

                if self.is_pawn_in_start_position():
                    y_doble = y + (2 * direction)
                    if board.is_in_bounds(x, y_doble):
                        if board.get_piece_at(x, y_doble) is None:
                            movement_list.append((x, y_doble))

        diagonal_x = [x - 1, x + 1]
        for x_diag in diagonal_x:
            if board.is_in_bounds(x_diag, next_y):
                aimed_piece = board.get_piece_at(x_diag, next_y)

                if aimed_piece is not None:
                    if aimed_piece.get_color() != color:
                        movement_list.append((x_diag, next_y))
        
        ultimo_movimiento = board.get_last_move()

        if ultimo_movimiento is not None:
            last_piece, last_from_x, last_from_y, last_to_x, last_to_y = ultimo_movimiento 

            if last_piece.get_type_of_piece() == PieceType.PAWN:
                if abs(last_from_y - last_to_y) == 2:
                    if last_to_y == y and abs(last_to_x - x) == 1:
                        movement_list.append((last_to_x, next_y))

        return movement_list
                         



class Rook(Piece):
    def __init__(self, color, x, y):
        super().__init__(color, x, y, PieceType.ROOK)
    
    def movimientos_posibles(self, board: 'Board') -> list[tuple[int, int]]:
        movement_list =[]

        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]

        for dx, dy in directions:
            x_actual = self.get_x() + dx
            y_actual = self.get_y() + dy

            while board.is_in_bounds(x_actual, y_actual):
                piece_at_square = board.get_piece_at(x_actual, y_actual)
                if piece_at_square is None: 
                    movement_list.append((x_actual, y_actual))
                else:
                    if piece_at_square.get_color() != self.get_color():
                        movement_list.append((x_actual, y_actual))
                    break
                x_actual += dx
                y_actual += dy

        return movement_list


class Knight(Piece):
    def __init__(self, color, x, y):
        super().__init__(color, x, y, PieceType.KNIGHT)
    
    def movimientos_posibles(self, board: 'Board') -> list[tuple[int, int]]:
        movement_list = []

        directions = [(2,1), (2, -1), (-2, 1), (-2, -1),(1, 2),
                      (1, -2), (-1, 2),(-1, -2)]

        for dx, dy in directions:
            x_actual = self.get_x() + dx
            y_actual = self.get_y() + dy

            if board.is_in_bounds(x_actual, y_actual):
                piece_at_square = board.get_piece_at(x_actual, y_actual)
                if piece_at_square is None: 
                    movement_list.append((x_actual, y_actual))
                elif piece_at_square.get_color() != self.get_color():
                    movement_list.append((x_actual, y_actual))

        return movement_list
    
class Bishop(Piece):
    def __init__(self, color, x, y):
        super().__init__(color, x, y, PieceType.BISHOP)
    
    def movimientos_posibles(self, board: 'Board') -> list[tuple[int, int]]:
        movement_list = []

        directions = [(1,1), (1, -1), (-1, 1), (-1, -1)]

        for dx, dy in directions:
            x_actual = self.get_x() + dx
            y_actual = self.get_y() + dy

            while board.is_in_bounds(x_actual, y_actual):
                piece_at_square = board.get_piece_at(x_actual, y_actual)
                if piece_at_square is None: 
                    movement_list.append((x_actual, y_actual))
                else:
                    if piece_at_square.get_color() != self.get_color():
                        movement_list.append((x_actual, y_actual))
                    break
                x_actual += dx
                y_actual += dy

        return movement_list
    

class Queen(Piece):
    def __init__(self, color, x, y):
        super().__init__(color, x, y, PieceType.QUEEN)
    
    def movimientos_posibles(self, board: 'Board') -> list[tuple[int, int]]:
        movement_list = []

        directions = [(1, 0), (0, 1), (1, 1), (1, -1), (-1, 1), (-1, 0), (0, -1), (-1, -1)]

        for dx, dy in directions:
            x_actual = self.get_x() + dx
            y_actual = self.get_y() + dy

            while board.is_in_bounds(x_actual, y_actual):
                piece_at_square = board.get_piece_at(x_actual, y_actual)
                if piece_at_square is None: 
                    movement_list.append((x_actual, y_actual))
                else:
                    if piece_at_square.get_color() != self.get_color():
                        movement_list.append((x_actual, y_actual))
                    break
                x_actual += dx
                y_actual += dy

        return movement_list
    
class King(Piece):
    def __init__(self, color, x, y):
        super().__init__(color, x, y, PieceType.KING)
    
    def movimientos_posibles(self, board: 'Board') -> list[tuple[int, int]]:
        movement_list = []

        directions = [(1, 0), (0, 1), (1, 1), (1, -1), (-1, 1), (-1, 0), (0, -1), (-1, -1)]

        for dx, dy in directions:
            x_target = self.get_x() + dx
            y_target = self.get_y() + dy

            if board.is_in_bounds(x_target, y_target):
                piece_at_square = board.get_piece_at(x_target, y_target)
                
                if piece_at_square is None: 
                    movement_list.append((x_target, y_target))

                elif piece_at_square.get_color() != self.get_color():
                        movement_list.append((x_target, y_target))

        if self.get_has_moved() == False and board.is_check(self.get_color()) == False:
            y = self.get_y()
            torre_der = board.get_piece_at(8, y)
            if torre_der is not None and torre_der.get_type_of_piece() == PieceType.ROOK and torre_der.get_has_moved() == False:
                if board.get_piece_at(6, y) is None and board.get_piece_at(7, y) is None:
                    if board.is_move_legal(self, 6, y):
                        movement_list.append((7, y))
            torre_izq = board.get_piece_at(1, y)
            if torre_izq is not None and torre_izq.get_type_of_piece() == PieceType.ROOK and torre_izq.get_has_moved() == False:
                if board.get_piece_at(2, y) is None and board.get_piece_at(3, y) is None and board.get_piece_at(4, y) is None:
                    if board.is_move_legal(self, 4, y):
                        movement_list.append((3, y))

        return movement_list
    

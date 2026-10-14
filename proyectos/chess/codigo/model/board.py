from __future__ import annotations
from typing import *
from abc import ABC, abstractmethod
from model.pieces import *

class Board(ABC):

    @abstractmethod
    def get_piece_at(self, x: int, y: int) -> Piece | None:
        pass

    @abstractmethod
    def get_size(self) -> int:
        pass

    @abstractmethod
    def is_in_bounds(self, x: int, y: int) -> bool:
        pass

    @abstractmethod
    def get_last_move(self) -> tuple[Piece, int, int, int, int] | None:
        pass

    @abstractmethod
    def is_check(self, color: Color) -> bool:
        pass

    @abstractmethod
    def is_move_legal(self, piece: Piece, to_x: int, to_y: int) -> bool:
        pass
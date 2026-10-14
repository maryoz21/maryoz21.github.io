from __future__ import annotations
from model.board_impl import BoardImpl
from model.pieces import Color

class Match:
    def __init__(self, match_id: int, player1: str, player2: str):
        self.__id: int = match_id
        self.__player1: str = player1
        self.__player2: str = player2
        self.__board: BoardImpl = BoardImpl()
        self.turn: Color = Color.WHITE
        
    def get_board(self) -> BoardImpl:
        return self.__board

    def get_match_id(self) -> int:
        return self.__id
    
    def get_player1(self) -> str:
        return self.__player1
    
    def get_player2(self) -> str:
        return self.__player2

    def switch_turn(self):
        if self.turn == Color.WHITE:
            self.turn = Color.BLACK
        else:
            self.turn = Color.WHITE

    
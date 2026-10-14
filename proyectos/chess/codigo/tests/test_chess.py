import unittest

from model.pieces import Pawn, Rook, Knight, Bishop, Queen, King, Color, PieceType
from model.board_impl import BoardImpl
from services.match import Match
from services.MatchesService import MatchesService

class Test1Creacion(unittest.TestCase):
    def test_creacion_servicio(self):
        servicio = MatchesService()
        self.assertEqual(len(servicio.matches), 0)

    def test_creacion_piezas(self):
        peon = Pawn(Color.WHITE, 1, 2)
        self.assertEqual(peon.get_type_of_piece(), PieceType.PAWN)
        self.assertEqual(peon.get_color(), Color.WHITE)

        torre = Rook(Color.BLACK, 1, 8)
        self.assertEqual(torre.get_type_of_piece(), PieceType.ROOK)
        
        caballo = Knight(Color.WHITE, 2, 1)
        self.assertEqual(caballo.get_type_of_piece(), PieceType.KNIGHT)
        
        alfil = Bishop(Color.BLACK, 3, 8)
        self.assertEqual(alfil.get_type_of_piece(), PieceType.BISHOP)
        
        reina = Queen(Color.WHITE, 4, 1)
        self.assertEqual(reina.get_type_of_piece(), PieceType.QUEEN)
        
        rey = King(Color.BLACK, 5, 8)
        self.assertEqual(rey.get_type_of_piece(), PieceType.KING)


    def test_creacion_match(self):
        match = Match(1, "Jugador 1", "Jugador 2")
        self.assertEqual(match.get_match_id(), 1)
        self.assertEqual(match.turn, Color.WHITE)
        self.assertIsNotNone(match.get_board())

    def test_match_y_add_pieces(self):
        match = Match(1, "Jugador 1", "Jugador 2")
        board = match.get_board()
        
        peon = Pawn(Color.WHITE, 4, 4)
        board.add_piece(peon)
        
        pieza_en_tablero = board.get_piece_at(4, 4)
        self.assertIsNotNone(pieza_en_tablero)
        self.assertEqual(pieza_en_tablero.get_type_of_piece(), PieceType.PAWN)

class Test2MovimientosPosibles(unittest.TestCase):
    def setUp(self):
        self.board = BoardImpl()

    def test_movimientos_torre(self):
        torre = Rook(Color.WHITE, 4, 4)
        self.board.add_piece(torre)
        movs = torre.movimientos_posibles(self.board)
        self.assertEqual(len(movs), 14)

    def test_movimientos_alfil(self):
        alfil = Bishop(Color.WHITE, 4, 4)
        self.board.add_piece(alfil)
        movs = alfil.movimientos_posibles(self.board)
        self.assertEqual(len(movs), 13)

    def test_movimientos_reina(self):
        reina = Queen(Color.WHITE, 4, 4)
        self.board.add_piece(reina)
        movs = reina.movimientos_posibles(self.board)
        self.assertEqual(len(movs), 27)

    def test_movimientos_caballo(self):
        caballo = Knight(Color.WHITE, 4, 4)
        self.board.add_piece(caballo)
        movs = caballo.movimientos_posibles(self.board)
        self.assertEqual(len(movs), 8)

    def test_movimientos_rey(self):
        rey = King(Color.WHITE, 4, 4)
        self.board.add_piece(rey)
        movs = rey.movimientos_posibles(self.board)
        self.assertEqual(len(movs), 8)

    def test_movimientos_peon(self):
        peon = Pawn(Color.WHITE, 4, 2)
        self.board.add_piece(peon)
        movs = peon.movimientos_posibles(self.board)
        self.assertEqual(len(movs), 2)
        self.assertIn((4, 3), movs)
        self.assertIn((4, 4), movs)

class Test3MovimientosEspeciales(unittest.TestCase):
    def setUp(self):
        self.board = BoardImpl()

    def test_enroque_corto(self):
        rey = King(Color.WHITE, 5, 1)
        torre = Rook(Color.WHITE, 8, 1)
        self.board.add_piece(rey)
        self.board.add_piece(torre)
        
        exito = self.board.move_piece(5, 1, 7, 1)
        self.assertTrue(exito)
        
        self.assertEqual(self.board.get_piece_at(7, 1).get_type_of_piece(), PieceType.KING)
        self.assertEqual(self.board.get_piece_at(6, 1).get_type_of_piece(), PieceType.ROOK)

    def test_coronar(self):
        peon = Pawn(Color.WHITE, 1, 7)
        self.board.add_piece(peon)
        
        self.board.move_piece(1, 7, 1, 8)
        
        pieza_coronada = self.board.get_piece_at(1, 8)
        self.assertEqual(pieza_coronada.get_type_of_piece(), PieceType.QUEEN)

    def test_comer_al_paso(self):
        peon_b = Pawn(Color.WHITE, 5, 5)
        peon_n = Pawn(Color.BLACK, 4, 7)
        self.board.add_piece(peon_b)
        self.board.add_piece(peon_n)
        
        self.board.move_piece(4, 7, 4, 5)
        
        exito = self.board.move_piece(5, 5, 4, 6)
        
        self.assertTrue(exito)
        self.assertIsNone(self.board.get_piece_at(4, 5))
        self.assertEqual(self.board.get_piece_at(4, 6).get_color(), Color.WHITE)

class Test4EstadosDeJuego(unittest.TestCase):
    def setUp(self):
        self.board = BoardImpl()

    def test_jaque(self):
        rey = King(Color.WHITE, 1, 1)
        torre_n = Rook(Color.BLACK, 1, 8)
        self.board.add_piece(rey)
        self.board.add_piece(torre_n)
        
        self.assertTrue(self.board.is_check(Color.WHITE))

    def test_jaque_mate(self):
        rey = King(Color.WHITE, 1, 1)
        torre_n1 = Rook(Color.BLACK, 1, 8)
        torre_n2 = Rook(Color.BLACK, 2, 8)
        self.board.add_piece(rey)
        self.board.add_piece(torre_n1)
        self.board.add_piece(torre_n2)
        
        # Está en jaque y no tiene movimientos legales
        self.assertTrue(self.board.is_checkmate(Color.WHITE))

    def test_ahogado(self):
        rey = King(Color.WHITE, 1, 1)
        reina_n = Queen(Color.BLACK, 3, 2) 
        # La reina en 3,2 ataca las casillas de escape (1,2), (2,1) y (2,2) 
        # pero NO ataca al rey directamente en (1,1).
        self.board.add_piece(rey)
        self.board.add_piece(reina_n)
        
        # Comprobamos que no es jaque, pero el rey no puede moverse (ahogado)
        self.assertFalse(self.board.is_check(Color.WHITE))
        self.assertTrue(self.board.is_stalemate(Color.WHITE))

if __name__ == '__main__':
    unittest.main()
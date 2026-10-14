from services.MatchesService import MatchesService
from model.utils import print_square




print("Creamos el servicio de partidas y una nueva partida con ID 1")
servicio = MatchesService()
servicio.create_match(1)
match1 = servicio.get_match_by_id(1)

print("Estado inicial del tablero:")
print("\n   a b c d e f g h\n  +----------------+")
servicio.visit_board(1, lambda board, x, y: print_square(board, x, y))
print("  +----------------+\n   a b c d e f g h\n")

servicio.move(1, 5, 2, 5, 4)
servicio.move(1, 5, 7, 5, 5)
servicio.move(1, 7, 1, 6, 3)
servicio.move(1, 4, 7, 4, 6)
servicio.move(1, 4, 2, 4, 4)
servicio.move(1, 3, 8, 7, 4)
servicio.move(1, 4, 4, 5, 5)
servicio.move(1, 7, 4, 6, 3)
servicio.move(1, 4, 1, 6, 3)
servicio.move(1, 4, 6, 5, 5)
servicio.move(1, 6, 1, 3, 4)
servicio.move(1, 7, 8, 6, 6)
servicio.move(1, 6, 3, 2, 3)
servicio.move(1, 4, 8, 5, 7)
servicio.move(1, 2, 1, 3, 3)
servicio.move(1, 3, 7, 3, 6)
servicio.move(1, 3, 1, 7, 5)
servicio.move(1, 2, 7, 2, 5)
servicio.move(1, 3, 3, 2, 5)
servicio.move(1, 3, 6, 2, 5)
servicio.move(1, 3, 4, 2, 5)
servicio.move(1, 2, 8, 4, 7)
servicio.move(1, 5, 1, 3, 1)
servicio.move(1, 1, 8, 4, 8)
servicio.move(1, 4, 1, 4, 7)
servicio.move(1, 4, 8, 4, 7)
servicio.move(1, 8, 1, 4, 1)
servicio.move(1, 5, 7, 5, 6)
servicio.move(1, 2, 5, 4, 7)
servicio.move(1, 6, 6, 4, 7)
servicio.move(1, 2, 3, 2, 8)
servicio.move(1, 4, 7, 2, 8)
servicio.move(1, 4, 1, 4, 8)


print("\n   a b c d e f g h\n  +----------------+")
servicio.visit_board(1, lambda board, x, y: print_square(board, x, y))
print("  +----------------+\n   a b c d e f g h\n")
servicio.move(1, 4, 1, 4, 8) # Blancas: Td8# (¡JAQUE MATE DE TORRE!)



print("Estado final del tablero:")
print("\n   a b c d e f g h\n  +----------------+")
servicio.visit_board(1, lambda board, x, y: print_square(board, x, y))
print("  +----------------+\n   a b c d e f g h\n")









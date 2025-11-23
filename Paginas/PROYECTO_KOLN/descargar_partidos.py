import requests
import json
import os
import time

# Configuración
TEAM_ID_KOLN = 65
START_YEAR = 2010
END_YEAR = 2024
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "partidos_koln")

# Mapeo de ligas en OpenLigaDB
COMPETITIONS = {
    "bundesliga": ["bl1", "bl2"], # Intentar BL1, si no BL2
    "dfb_pokal": ["dfb"]
}

def ensure_dir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

def get_matches(league_shortcut, year):
    url = f"https://api.openligadb.de/getmatchdata/{league_shortcut}/{year}"
    try:
        print(f"  Descargando {league_shortcut} {year}...")
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        data = response.json()
        
        # Filtrar Köln
        matches = [
            m for m in data 
            if m['team1']['teamId'] == TEAM_ID_KOLN or m['team2']['teamId'] == TEAM_ID_KOLN
        ]
        return matches
    except Exception as e:
        print(f"    Error: {e}")
        return []

def main():
    ensure_dir(OUTPUT_DIR)
    
    # 1. Descargar datos nuevos (Bundesliga, DFB)
    for year in range(START_YEAR, END_YEAR + 1):
        print(f"Procesando año {year}...")
        
        for comp_name, shortcuts in COMPETITIONS.items():
            comp_dir = os.path.join(OUTPUT_DIR, comp_name)
            ensure_dir(comp_dir)
            
            # Verificar si ya existe para no machacar innecesariamente, 
            # pero mejor sobrescribir para asegurar datos frescos.
            
            found_matches = []
            for shortcut in shortcuts:
                matches = get_matches(shortcut, year)
                if matches:
                    found_matches = matches
                    break 
            
            if found_matches:
                filename = f"koln_{year}.json"
                filepath = os.path.join(comp_dir, filename)
                with open(filepath, "w", encoding="utf-8") as f:
                    json.dump(found_matches, f, ensure_ascii=False, indent=2)
                print(f"    -> Guardado {comp_name}/{filename}")
            
            time.sleep(0.2)

    # 2. Generar Manifiesto escaneando TODO el directorio
    print("Generando manifiesto...")
    manifest = []
    
    # Recorrer todas las carpetas dentro de partidos_koln
    for root, dirs, files in os.walk(OUTPUT_DIR):
        for file in files:
            if file.endswith(".json"):
                # Inferir datos del nombre y ruta
                # Estructura: partidos_koln/{competicion}/koln_{year}.json
                try:
                    path_parts = os.path.normpath(os.path.join(root, file)).split(os.sep)
                    # Buscar 'partidos_koln' y tomar lo siguiente
                    idx = path_parts.index("partidos_koln")
                    if idx + 2 < len(path_parts): # Debe tener carpeta y archivo
                        competition = path_parts[idx+1]
                        filename = path_parts[idx+2]
                        
                        # Extraer año del nombre koln_2022.json
                        year_str = filename.replace("koln_", "").replace(".json", "")
                        year = int(year_str)
                        
                        # Ruta relativa para el frontend (usar / siempre)
                        rel_path = f"partidos_koln/{competition}/{filename}"
                        
                        manifest.append({
                            "year": year,
                            "competition": competition,
                            "path": rel_path
                        })
                except Exception as e:
                    print(f"Saltando archivo {file}: {e}")

    # Guardar manifiesto
    manifest_path = os.path.join(BASE_DIR, "data", "manifest.json")
    ensure_dir(os.path.join(BASE_DIR, "data"))
    
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    
    print(f"Manifiesto generado con {len(manifest)} archivos.")

if __name__ == "__main__":
    main()

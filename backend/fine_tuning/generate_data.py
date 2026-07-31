import csv
import json
import random
import os

random.seed(42)

TEMPLATES = [
    "película sobre {desc_low}",
    "busco algo que hable de {desc_low}",
    "quiero ver una película donde {desc_low}",
    "alguna película que trate sobre {desc_low}",
    "qué película trata de {desc_low}",
    "película donde {desc_low}",
    "necesito una película sobre {desc_low}",
    "existe alguna película donde {desc_low}",
    "película del género {categoria} como {titulo}",
    "algo parecido a {titulo}",
    "recomiéndame algo como {titulo}",
    "películas similares a {titulo}",
]

def extraer_frase_descripcion(desc: str) -> str:
    desc = desc.strip().rstrip(".")
    if desc.startswith('"'):
        desc = desc[1:]
    if desc.endswith('"'):
        desc = desc[:-1]
    oraciones = desc.split(". ")
    if len(oraciones) > 1:
        return oraciones[0].lower()
    return desc.lower()

def generar_queries(pelicula: dict) -> list[str]:
    titulo = pelicula["titulo"]
    categoria = pelicula["categoria"]
    desc = pelicula["descripcion"]
    desc_low = extraer_frase_descripcion(desc)

    queries = []
    for tpl in TEMPLATES:
        q = tpl.format(
            desc_low=desc_low,
            titulo=titulo,
            categoria=categoria
        )
        queries.append(q)

    queries.append(f"quiero ver {titulo.lower()}")
    queries.append(f"algo de {categoria.lower()}")
    return queries

def cargar_peliculas(csv_path: str) -> list[dict]:
    peliculas = []
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            peliculas.append({
                "id": int(row["id"]),
                "titulo": row["titulo"],
                "categoria": row["categoria"],
                "descripcion": row["descripcion"]
            })
    return peliculas

def generar_triplets(peliculas: list[dict]) -> list[dict]:
    triplets = []
    for peli in peliculas:
        queries = generar_queries(peli)
        for query in queries:
            negatives = [p for p in peliculas if p["id"] != peli["id"]]
            neg = random.choice(negatives)
            triplets.append({
                "anchor": query,
                "positive": peli["descripcion"],
                "negative": neg["descripcion"]
            })
    return triplets

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(script_dir, "..", "peliculas_200.csv")
    output_dir = os.path.join(script_dir, "data")
    os.makedirs(output_dir, exist_ok=True)

    print(f"Leyendo películas desde: {csv_path}")
    peliculas = cargar_peliculas(csv_path)
    print(f"Películas cargadas: {len(peliculas)}")

    print("Generando triplets...")
    triplets = generar_triplets(peliculas)
    print(f"Triplets generados: {len(triplets)}")

    random.shuffle(triplets)

    split = int(len(triplets) * 0.8)
    train_data = triplets[:split]
    valid_data = triplets[split:]

    train_path = os.path.join(output_dir, "train.json")
    valid_path = os.path.join(output_dir, "valid.json")

    with open(train_path, "w", encoding="utf-8") as f:
        json.dump(train_data, f, ensure_ascii=False, indent=2)

    with open(valid_path, "w", encoding="utf-8") as f:
        json.dump(valid_data, f, ensure_ascii=False, indent=2)

    print(f"Train: {len(train_data)} triplets -> {train_path}")
    print(f"Valid: {len(valid_data)} triplets -> {valid_path}")

    print("\nEjemplo de triplet:")
    print(f"  anchor:     {train_data[0]['anchor']}")
    print(f"  positive:   {train_data[0]['positive'][:80]}...")
    print(f"  negative:   {train_data[0]['negative'][:80]}...")

if __name__ == "__main__":
    main()

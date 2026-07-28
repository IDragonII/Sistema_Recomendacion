import pandas as pd
import chromadb
import os
import shutil
from tqdm import tqdm
from embeddings import obtener_embedding

DB_PATH = "./chroma_db"

df = pd.read_csv("peliculas_200.csv")

if os.path.exists(DB_PATH):
    print("Eliminando base anterior...")
    shutil.rmtree(DB_PATH)

print("Creando nueva base...")

chroma_client = chromadb.PersistentClient(
    path=DB_PATH
)

collection = chroma_client.get_or_create_collection(
    name="peliculas"
)

for _, fila in tqdm(df.iterrows(), total=len(df)):

    texto = f"""
Título: {fila['titulo']}

Categoría:
{fila['categoria']}

Descripción:
{fila['descripcion']}
"""

    embedding = obtener_embedding(texto)

    collection.add(
        ids=[str(fila["id"])],
        documents=[texto],
        embeddings=[embedding],
        metadatas=[{
            "titulo": str(fila["titulo"]),
            "categoria": str(fila["categoria"]),
            "descripcion": "" if pd.isna(fila["descripcion"]) else str(fila["descripcion"])
        }]
    )

print("Base vectorial creada correctamente.")

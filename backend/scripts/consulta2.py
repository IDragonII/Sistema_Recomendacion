import chromadb
from sentence_transformers import SentenceTransformer

# Modelo local
model = SentenceTransformer("BAAI/bge-m3")
# Base vectorial
chroma_client = chromadb.PersistentClient(
    path="./chroma_db"
)

collection = chroma_client.get_collection("peliculas")

# Consulta
consulta = "películas sobre viajes en el tiempo"

embedding = model.encode(
    consulta,
    normalize_embeddings=True
).tolist()

resultado = collection.query(
    query_embeddings=[embedding],
    n_results=5
)

for meta in resultado["metadatas"][0]:
    print("Título:", meta["titulo"])
    print("Categoría:", meta["categoria"])
    print("-" * 40)
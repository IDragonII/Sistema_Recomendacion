import chromadb
from sentence_transformers import SentenceTransformer

MODEL = "BAAI/bge-m3"

print("Cargando modelo...")
model = SentenceTransformer(MODEL)
print("Modelo cargado.")

# abrir base persistente
chroma_client = chromadb.PersistentClient(
    path="./chroma_db"
)

collection = chroma_client.get_collection(
    "peliculas"
)

consulta = "películas sobre viajes en el tiempo"

embedding = model.encode(consulta, normalize_embeddings=True).tolist()

resultado = collection.query(
    query_embeddings=[embedding],
    n_results=5
)

# print(resultado)

for meta in resultado["metadatas"][0]:
    print(meta["titulo"])
    print(meta["categoria"])
    print("-"*40)
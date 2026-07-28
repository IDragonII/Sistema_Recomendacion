from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chromadb
from embeddings import obtener_embedding

app = FastAPI(
    title="API Recomendador de Películas",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

chroma_client = chromadb.PersistentClient(
    path="./chroma_db"
)

collection = chroma_client.get_collection(
    "peliculas"
)


class ConsultaRequest(BaseModel):
    consulta: str
    n_resultados: int = 5


@app.post("/buscar")
def buscar_peliculas(data: ConsultaRequest):
    try:
        embedding = obtener_embedding(data.consulta)

        resultado = collection.query(
            query_embeddings=[embedding],
            n_results=data.n_resultados
        )

        peliculas = []
        for meta in resultado["metadatas"][0]:
            peliculas.append({
                "titulo": meta["titulo"],
                "categoria": meta["categoria"],
                "descripcion": meta["descripcion"]
            })

        return {
            "consulta": data.consulta,
            "cantidad": len(peliculas),
            "resultados": peliculas
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chromadb
from embeddings import obtener_embedding
from groq_client import generar_respuesta, get_llm_status

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
    mode: str = None


@app.post("/buscar")
def buscar_peliculas(data: ConsultaRequest):
    try:
        embedding = obtener_embedding(data.consulta, data.mode)

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


class ChatRequest(BaseModel):
    consulta: str
    n_resultados: int = 5
    mode: str = None
    historial: list = None
    modo_llm: str = "auto"


@app.get("/status")
def status():
    """Retorna el estado de los servicios"""
    return {
        "llm_status": get_llm_status()
    }


@app.post("/chat")
def chat(data: ChatRequest):
    try:
        embedding = obtener_embedding(data.consulta, data.mode)

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

        respuesta, llm_status = generar_respuesta(
            peliculas, 
            data.consulta, 
            data.historial,
            data.modo_llm
        )

        return {
            "consulta": data.consulta,
            "respuesta": respuesta,
            "peliculas": peliculas,
            "llm_status": llm_status
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

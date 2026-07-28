import os
import requests
from typing import List
from dotenv import load_dotenv

load_dotenv()

MODE = os.getenv("EMBEDDING_MODE", "auto")
HF_TOKEN = os.getenv("HF_TOKEN", "")
MODEL_API = "sentence-transformers/all-MiniLM-L6-v2"
MODEL_LOCAL = "BAAI/bge-m3"

_local_model = None


def _get_local_model():
    global _local_model
    if _local_model is None:
        print(f"Cargando modelo local {MODEL_LOCAL}...")
        from sentence_transformers import SentenceTransformer
        _local_model = SentenceTransformer(MODEL_LOCAL)
        print("Modelo local cargado.")
    return _local_model


def _embed_api(texto: str) -> List[float]:
    url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{MODEL_API}"
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {"inputs": texto, "options": {"wait_for_model": True}}
    resp = requests.post(url, headers=headers, json=payload, timeout=30)
    resp.raise_for_status()
    embedding = resp.json()
    if isinstance(embedding[0], list):
        return embedding[0]
    return embedding


def _embed_local(texto: str) -> List[float]:
    model = _get_local_model()
    return model.encode(texto, normalize_embeddings=True).tolist()


def obtener_embedding(texto: str) -> List[float]:
    if MODE == "local":
        print("[LOCAL] Generando embedding...")
        return _embed_local(texto)

    if MODE == "api":
        print("[API] Generando embedding...")
        return _embed_api(texto)

    # auto: intenta API, fallback a local
    try:
        print("[AUTO] Intentando API...")
        return _embed_api(texto)
    except Exception as e:
        print(f"[AUTO] API falló ({e}), usando local...")
        return _embed_local(texto)


def obtener_embeddings_batch(textos: List[str]) -> List[List[float]]:
    if MODE == "local":
        print("[LOCAL] Generando embeddings (batch)...")
        model = _get_local_model()
        return model.encode(textos, normalize_embeddings=True).tolist()

    if MODE == "api":
        print("[API] Generando embeddings (batch)...")
        return [_embed_api(t) for t in textos]

    # auto: intenta API, fallback a local
    try:
        print("[AUTO] Intentando API (batch)...")
        return [_embed_api(t) for t in textos]
    except Exception as e:
        print(f"[AUTO] API falló ({e}), usando local...")
        model = _get_local_model()
        return model.encode(textos, normalize_embeddings=True).tolist()

import os
import requests
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")

SYSTEM_PROMPT = """Eres FilmBot, un asistente amigable de recomendaciones de películas.
Tu nombre es FilmBot y eres un experto en cine.

Cuando el usuario te pida recomendaciones:
1. Analiza qué tipo de película busca
2. Usa las películas de la lista proporcionada
3. Recomienda máximo 2-3 películas de forma conversacional
4. Explica POR QUÉ cada película es recomendada
5. Sé breve y directo

Estilo:
- Lenguaje natural y amigable
- Sé concreto y específico
- No listes solo títulos, explica los motivos
- Si no hay resultados, sugiere alternativas"""

SYSTEM_PROMPT_CORTO = """Eres FilmBot, asistente de películas. Recomienda 2-3 películas de la lista de forma conversacional. Explica por qué."""

def is_ollama_available() -> bool:
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        return response.status_code == 200
    except:
        return False


def generar_respuesta_ollama(peliculas: list, consulta: str, historial: list = None) -> str:
    if not peliculas:
        return "No encontré películas que coincidan con tu búsqueda. ¿Podrías decirme qué tipo de película te gusta? Por ejemplo: acción, comedia, terror, drama, etc."

    peliculas_formateadas = "\n".join([
        f"- {p.get('titulo', 'Sin título')} ({p.get('categoria', 'Sin categoría')}): {p.get('descripcion', 'Sin descripción')[:150]}..."
        for p in peliculas
    ])

    user_prompt = f"""El usuario buscó: "{consulta}"

Películas disponibles:
{peliculas_formateadas}

Responde de forma conversacional recommendando estas películas."""

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT_CORTO},
        {"role": "user", "content": user_prompt}
    ]

    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json={
                "model": OLLAMA_MODEL,
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": 300,
                }
            },
            timeout=60
        )
        response.raise_for_status()
        return response.json()["message"]["content"]
    except requests.exceptions.RequestException as e:
        raise Exception(f"Ollama no disponible: {str(e)}")

import os
import requests
from typing import Optional
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

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


def is_groq_available() -> bool:
    try:
        client.chat.completions.create(
            messages=[{"role": "user", "content": "test"}],
            model="llama-3.3-70b-versatile",
            max_tokens=1
        )
        return True
    except:
        return False


def is_ollama_available() -> bool:
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        return response.status_code == 200
    except:
        return False


def get_llm_status() -> str:
    """Retorna el estado de los LLM disponibles"""
    if is_groq_available():
        return "groq"
    elif is_ollama_available():
        return "ollama"
    else:
        return "offline"


def generar_respuesta_groq(peliculas: list, consulta: str, historial: list = None) -> str:
    if not peliculas:
        return "No encontré películas que coincidan con tu búsqueda. ¿Podrías decirme qué tipo de película te gusta? Por ejemplo: acción, comedia, terror, drama, etc."

    peliculas_formateadas = "\n".join([
        f"- {p.get('titulo', 'Sin título')} ({p.get('categoria', 'Sin categoría')}): {p.get('descripcion', 'Sin descripción')[:200]}..."
        for p in peliculas
    ])

    user_prompt = f"""El usuario buscó: "{consulta}"

Películas encontradas:
{peliculas_formateadas}

Genera una respuesta amigable."""

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if historial:
        for msg in historial[-5:]:
            messages.append(msg)

    messages.append({"role": "user", "content": user_prompt})

    chat_completion = client.chat.completions.create(
        messages=messages,
        model="llama-3.3-70b-versatile",
        temperature=0.7,
        max_tokens=500,
        top_p=0.9,
    )
    return chat_completion.choices[0].message.content


def generar_respuesta_ollama(peliculas: list, consulta: str) -> str:
    if not peliculas:
        return "No encontré películas que coincidan con tu búsqueda. ¿Podrías decirme qué tipo de película te gusta? Por ejemplo: acción, comedia, terror, drama, etc."

    peliculas_formateadas = "\n".join([
        f"- {p.get('titulo', 'Sin título')} ({p.get('categoria', 'Sin categoría')}): {p.get('descripcion', 'Sin descripción')[:150]}..."
        for p in peliculas
    ])

    user_prompt = f"""El usuario buscó: "{consulta}"

Películas disponibles:
{peliculas_formateadas}

Responde de forma conversacional."""

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT_CORTO},
        {"role": "user", "content": user_prompt}
    ]

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


def generar_respuesta(peliculas: list, consulta: str, historial: list = None, modo: str = "auto") -> tuple[str, str]:
    """
    Genera respuesta usando Groq u Ollama.
    Retorna: (respuesta, estado)
    estados: 'groq', 'ollama', 'offline', 'error'
    """
    
    # Si el usuario eligió un modo específico
    if modo == "groq":
        try:
            return generar_respuesta_groq(peliculas, consulta, historial), "groq"
        except Exception as e:
            print(f"Groq falló: {e}")
            return f"Error con Groq: {str(e)}", "error"
    
    if modo == "ollama":
        try:
            return generar_respuesta_ollama(peliculas, consulta), "ollama"
        except Exception as e:
            print(f"Ollama falló: {e}")
            return f"Error con Ollama: {str(e)}", "error"
    
    # Auto: intentar Groq primero, luego Ollama, luego fallback
    # Intentar Groq
    try:
        respuesta = generar_respuesta_groq(peliculas, consulta, historial)
        if respuesta and not respuesta.startswith("Error"):
            return respuesta, "groq"
    except Exception as e:
        print(f"Groq no disponible: {e}")
    
    # Intentar Ollama
    try:
        respuesta = generar_respuesta_ollama(peliculas, consulta)
        if respuesta and not respuesta.startswith("Error"):
            return respuesta, "ollama"
    except Exception as e:
        print(f"Ollama no disponible: {e}")
    
    # Fallback: respuesta simple sin LLM
    if peliculas:
        peliculas_texto = ", ".join([p.get('titulo', 'Sin título') for p in peliculas[:3]])
        return f"Te recomiendo: {peliculas_texto}. ¿Quieres más información?", "offline"
    
    return "No encontré películas. ¿Podrías describir qué tipo buscas?", "offline"

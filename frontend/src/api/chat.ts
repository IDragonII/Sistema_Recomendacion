import type { ModoEmbedding } from '../types'

const API_URL = import.meta.env.VITE_API_URL || ''

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  consulta: string
  n_resultados?: number
  mode?: ModoEmbedding
  historial?: ChatMessage[]
  modo_llm?: 'auto' | 'groq' | 'ollama'
}

export interface ChatResponse {
  consulta: string
  respuesta: string
  peliculas: Array<{
    titulo: string
    categoria: string
    descripcion: string
  }>
  llm_status: 'groq' | 'ollama' | 'offline' | 'error'
}

export async function chat(
  consulta: string,
  mode?: ModoEmbedding,
  nResultados: number = 5,
  historial: ChatMessage[] = [],
  modo_llm: 'auto' | 'groq' | 'ollama' = 'auto'
): Promise<ChatResponse> {
  const body: ChatRequest = {
    consulta,
    n_resultados: nResultados,
    mode,
    historial,
    modo_llm
  }

  const respuesta = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!respuesta.ok) {
    let detalle = respuesta.statusText
    try {
      const cuerpo = await respuesta.json()
      detalle = cuerpo.detail || detalle
    } catch {
      /* respuesta sin JSON */
    }
    throw new Error(`Error ${respuesta.status}: ${detalle}`)
  }

  return respuesta.json()
}

export async function getStatus(): Promise<{ llm_status: string }> {
  const respuesta = await fetch(`${API_URL}/status`)
  return respuesta.json()
}

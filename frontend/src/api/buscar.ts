import type { RespuestaBusqueda, ModoEmbedding } from '../types'

const API_URL = import.meta.env.VITE_API_URL || ''

export async function buscarPeliculas(
  consulta: string,
  nResultados: number,
  mode?: ModoEmbedding
): Promise<RespuestaBusqueda> {
  const body: Record<string, unknown> = {
    consulta,
    n_resultados: nResultados,
  }

  if (mode) {
    body.mode = mode
  }

  const respuesta = await fetch(`${API_URL}/buscar`, {
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

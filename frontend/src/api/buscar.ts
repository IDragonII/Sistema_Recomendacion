import type { RespuestaBusqueda } from '../types'

const API_URL = import.meta.env.VITE_API_URL || ''

export async function buscarPeliculas(
  consulta: string,
  nResultados: number
): Promise<RespuestaBusqueda> {
  const respuesta = await fetch(`${API_URL}/buscar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      consulta,
      n_resultados: nResultados,
    }),
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

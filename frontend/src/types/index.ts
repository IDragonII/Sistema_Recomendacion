export interface Pelicula {
  titulo: string
  categoria: string
  descripcion: string
}

export interface RespuestaBusqueda {
  consulta: string
  cantidad: number
  resultados: Pelicula[]
}

export type ModoEmbedding = "local" | "cohere"

import { useState } from 'react'
import { motion } from 'framer-motion'

interface SearchFormProps {
  onBuscar: (consulta: string, nResultados: number) => void
  cargando: boolean
}

export function SearchForm({ onBuscar, cargando }: SearchFormProps) {
  const [consulta, setConsulta] = useState('')
  const [nResultados, setNResultados] = useState(5)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (consulta.trim()) {
      onBuscar(consulta.trim(), nResultados)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="relative group">
        <textarea
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Ej: películas de ciencia ficción con viajes en el tiempo..."
          autoComplete="off"
          required
          rows={3}
          className="w-full bg-bg-input/50 border border-border text-text px-5 py-4 rounded-2xl outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-300 text-sm resize-none group-hover:border-border/80"
        />
        <div className="absolute bottom-4 right-4 text-text-dim/40 group-hover:text-accent/40 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-bg-input/30 rounded-xl px-4 py-2.5 border border-border/50">
          <span className="text-text-dim text-sm">Mostrar</span>
          <select
            value={nResultados}
            onChange={(e) => setNResultados(parseInt(e.target.value))}
            className="bg-transparent border-none text-accent font-semibold text-sm focus:outline-none cursor-pointer"
          >
            <option value="3" className="bg-bg-input text-text">3</option>
            <option value="5" className="bg-bg-input text-text">5</option>
            <option value="10" className="bg-bg-input text-text">10</option>
            <option value="20" className="bg-bg-input text-text">20</option>
          </select>
          <span className="text-text-dim text-sm">resultados</span>
        </div>

        <motion.button
          type="submit"
          disabled={cargando || !consulta.trim()}
          whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)' }}
          whileTap={{ scale: 0.98 }}
          className="relative overflow-hidden bg-gradient-to-r from-accent to-blue-500 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-lg shadow-accent/20"
        >
          <span className="relative z-10 flex items-center gap-2">
            {cargando ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                <span>Buscando</span>
              </>
            ) : (
              <>
                <span>Buscar</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </span>
        </motion.button>
      </div>
    </form>
  )
}

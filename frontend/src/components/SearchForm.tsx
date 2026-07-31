import { useState, KeyboardEvent } from 'react'
import { motion } from 'framer-motion'

interface SearchFormProps {
  onBuscar: (consulta: string, nResultados: number) => void
  cargando: boolean
}

const QUICK_REPLIES = [
  { label: '🎬 Acción', query: 'películas de acción' },
  { label: '😂 Comedia', query: 'películas cómicas graciosas' },
  { label: '😱 Terror', query: 'películas de terror' },
  { label: '💕 Romántica', query: 'películas románticas' },
  { label: '🎭 Drama', query: 'dramas intensos' },
  { label: '🚀 Sci-Fi', query: 'ciencia ficción' },
]

export function SearchForm({ onBuscar, cargando }: SearchFormProps) {
  const [consulta, setConsulta] = useState('')
  const [nResultados, setNResultados] = useState(5)

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (consulta.trim()) {
      onBuscar(consulta.trim(), nResultados)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleQuickReply = (query: string) => {
    setConsulta(query)
    onBuscar(query, nResultados)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <p className="text-xs text-text-dim mb-3">Sugerencias:</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_REPLIES.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleQuickReply(item.query)}
              disabled={cargando}
              className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border p-3 bg-white">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe qué tipo de película buscas..."
              autoComplete="off"
              rows={1}
              className="w-full bg-bg-input border border-border text-text px-4 py-3 rounded-2xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 text-sm resize-none"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>

          <motion.button
            type="submit"
            disabled={cargando || !consulta.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {cargando ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </form>
  )
}

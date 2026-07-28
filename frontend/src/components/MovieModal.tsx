import { motion, AnimatePresence } from 'framer-motion'
import type { Pelicula } from '../types'

interface MovieModalProps {
  pelicula: Pelicula | null
  indice: number
  onClose: () => void
}

export function MovieModal({ pelicula, indice, onClose }: MovieModalProps) {
  if (!pelicula) return null

  const colors = [
    'from-violet-500/20 to-purple-500/20',
    'from-blue-500/20 to-cyan-500/20',
    'from-emerald-500/20 to-teal-500/20',
    'from-amber-500/20 to-orange-500/20',
    'from-rose-500/20 to-pink-500/20',
  ]

  const colorClass = colors[indice % colors.length]

  return (
    <AnimatePresence>
      {pelicula && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-3xl w-full max-w-lg overflow-hidden"
            >
              {/* Header con gradiente */}
              <div className={`relative bg-gradient-to-br ${colorClass} px-8 py-10`}>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-text/70 hover:text-text transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                    <span className="text-text font-mono text-2xl font-bold">
                      {String(indice).padStart(2, '0')}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-text text-2xl font-bold">{pelicula.titulo}</h2>
                    <p className="text-text-dim text-sm font-mono uppercase tracking-wider mt-1">
                      {pelicula.categoria}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contenido */}
              <div className="px-8 py-6">
                <div className="flex items-center gap-2 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-text-dim text-xs font-mono uppercase tracking-wider">Sinopsis</span>
                </div>
                <p className="text-text text-sm leading-relaxed">
                  {pelicula.descripcion || 'Sin descripción disponible.'}
                </p>
              </div>

              {/* Footer */}
              <div className="px-8 py-4 border-t border-border/50 flex justify-end">
                <button
                  onClick={onClose}
                  className="text-text-dim hover:text-text text-sm font-medium transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

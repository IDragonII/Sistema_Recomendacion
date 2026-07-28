import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Pelicula } from '../types'

interface MovieCardProps {
  pelicula: Pelicula
  indice: number
  onClick: () => void
}

export function MovieCard({ pelicula, indice, onClick }: MovieCardProps) {
  const [hovered, setHovered] = useState(false)

  const colors = [
    'from-violet-500/20 to-purple-500/20',
    'from-blue-500/20 to-cyan-500/20',
    'from-emerald-500/20 to-teal-500/20',
    'from-amber-500/20 to-orange-500/20',
    'from-rose-500/20 to-pink-500/20',
  ]

  const colorClass = colors[indice % colors.length]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: indice * 0.05 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className="relative group cursor-pointer"
    >
      <motion.div
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.99 }}
        className="relative overflow-hidden bg-bg-input/30 border border-border/50 rounded-2xl px-5 py-4 transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
      >
        {/* Gradient background on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          className={`absolute inset-0 bg-gradient-to-r ${colorClass} pointer-events-none`}
        />

        <div className="relative flex items-center gap-4">
          {/* Indicador numérico */}
          <div className="relative">
            <div className={`w-12 h-12 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center`}>
              <span className="text-text font-mono text-sm font-bold">
                {String(indice).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <h3 className="text-text font-semibold text-base truncate group-hover:text-white transition-colors">
              {pelicula.titulo || 'Sin título'}
            </h3>
            <p className="text-text-dim text-xs font-mono uppercase tracking-wider mt-1 group-hover:text-text-dim/80 transition-colors">
              {pelicula.categoria || 'Sin categoría'}
            </p>
          </div>

          {/* Icono */}
          <motion.div
            animate={{ x: hovered ? 0 : -5, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-accent"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

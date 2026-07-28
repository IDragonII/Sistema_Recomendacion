import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchForm } from './components/SearchForm'
import { MovieCard } from './components/MovieCard'
import { MovieModal } from './components/MovieModal'
import { buscarPeliculas } from './api/buscar'
import type { Pelicula } from './types'
import './index.css'

function App() {
  const [resultados, setResultados] = useState<Pelicula[]>([])
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [modalPelicula, setModalPelicula] = useState<Pelicula | null>(null)
  const [modalIndice, setModalIndice] = useState(0)

  const handleBuscar = async (q: string, nResultados: number) => {
    setCargando(true)
    setResultados([])
    setMensaje('')
    setError('')

    try {
      const data = await buscarPeliculas(q, nResultados)
      setMensaje(`${data.cantidad} resultado(s)`)
      setResultados(data.resultados || [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(
        msg.includes('Failed to fetch')
          ? 'No se pudo conectar con la API. ¿Está corriendo uvicorn?'
          : msg
      )
    } finally {
      setCargando(false)
    }
  }

  const abrirModal = (pelicula: Pelicula, indice: number) => {
    setModalPelicula(pelicula)
    setModalIndice(indice)
  }

  const cerrarModal = () => {
    setModalPelicula(null)
  }

  return (
    <div className="h-screen bg-bg bg-grid relative overflow-hidden flex flex-col">
      <div className="bg-glow" />
      <div className="bg-glow-2" />

      <div className="relative z-10 flex flex-col h-full max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-6 shrink-0"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              className="w-10 h-10 bg-gradient-to-br from-accent to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-accent/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-text via-text to-text-dim bg-clip-text text-transparent">
                Buscador de Películas
              </span>
            </h1>
          </div>
          <p className="text-text-dim text-sm">Búsqueda semántica con IA</p>
        </motion.header>

        {/* Cards iguales lado a lado */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          {/* Card Izquierda: Búsqueda */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong rounded-3xl flex flex-col min-h-0 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border/50 shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-text font-semibold">Consulta</h2>
                <p className="text-text-dim text-xs">Describe la película</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
              <SearchForm onBuscar={handleBuscar} cargando={cargando} />

              <AnimatePresence mode="wait">
                {mensaje && (
                  <motion.div
                    key="mensaje"
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="mt-5 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 text-accent-light text-sm bg-accent/10 rounded-xl px-4 py-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong>{mensaje}</strong></span>
                    </div>
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="mt-5 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 text-error text-sm bg-error/10 rounded-xl px-4 py-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Card Derecha: Resultados */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong rounded-3xl flex flex-col min-h-0 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-success/20 to-emerald-500/20 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-text font-semibold">Resultados</h2>
                  <p className="text-text-dim text-xs">
                    {resultados.length > 0 ? `${resultados.length} encontradas` : 'Esperando...'}
                  </p>
                </div>
              </div>

              {resultados.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-success/10 text-success text-xs font-bold px-3 py-1.5 rounded-full"
                >
                  {resultados.length}
                </motion.div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
              <div className="flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                  {resultados.length > 0 ? (
                    resultados.map((p, i) => (
                      <MovieCard
                        key={`${p.titulo}-${i}`}
                        pelicula={p}
                        indice={i + 1}
                        onClick={() => abrirModal(p, i + 1)}
                      />
                    ))
                  ) : (
                    !cargando && (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-16"
                      >
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                          className="w-16 h-16 bg-gradient-to-br from-accent/10 to-blue-500/10 rounded-2xl flex items-center justify-center mb-4"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                          </svg>
                        </motion.div>
                        <p className="text-text-dim text-sm font-medium mb-1">Sin resultados</p>
                        <p className="text-text-dim/50 text-xs text-center">Escribe una consulta para buscar</p>
                      </motion.div>
                    )
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {cargando && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-16"
                    >
                      <div className="relative">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full"
                        />
                        <motion.div
                          animate={{ rotate: -360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          className="absolute inset-1.5 border-2 border-blue-500/20 border-b-blue-500 rounded-full"
                        />
                      </div>
                      <p className="text-text-dim text-xs mt-4">Analizando...</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-4 pb-2 shrink-0"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2">
            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
            <span className="text-text-dim text-[11px] font-mono">
              sentence-transformers + ChromaDB
            </span>
          </div>
        </motion.footer>
      </div>

      {/* Modal */}
      <MovieModal
        pelicula={modalPelicula}
        indice={modalIndice}
        onClose={cerrarModal}
      />
    </div>
  )
}

export default App

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SearchForm } from './components/SearchForm'
import { MovieModal } from './components/MovieModal'
import { ChatBot } from './components/ChatBot'
import { chat, getStatus } from './api/chat'
import type { Pelicula, ModoEmbedding } from './types'
import type { ChatMessage } from './api/chat'
import './index.css'

type LLMStatus = 'groq' | 'ollama' | 'offline' | 'error'

function App() {
  const [resultados, setResultados] = useState<Pelicula[]>([])
  const [modalPelicula, setModalPelicula] = useState<Pelicula | null>(null)
  const [modalIndice, setModalIndice] = useState(0)
  const [modo, setModo] = useState<ModoEmbedding>('local')
  const [modoLlm, setModoLlm] = useState<'auto' | 'groq' | 'ollama'>('auto')
  const [llmStatus, setLlmStatus] = useState<LLMStatus>('groq')

  const [mensajes, setMensajes] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    getStatus()
      .then(data => setLlmStatus(data.llm_status as LLMStatus))
      .catch(() => setLlmStatus('offline'))
  }, [])

  const handleBuscar = async (q: string, nResultados: number) => {
    setIsTyping(true)

    const mensajeUsuario: ChatMessage = { role: 'user', content: q }
    setMensajes(prev => [...prev, mensajeUsuario])

    try {
      const data = await chat(q, modo, nResultados, [], modoLlm)

      const mensajeBot: ChatMessage = { role: 'assistant', content: data.respuesta }
      setMensajes(prev => [...prev, mensajeBot])

      setResultados(data.peliculas || [])
      setLlmStatus(data.llm_status as LLMStatus)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      const errorMsg = msg.includes('Failed to fetch')
        ? 'No se pudo conectar. Verifica tu conexión a internet.'
        : msg

      const mensajeError: ChatMessage = { role: 'assistant', content: `😕 ${errorMsg}` }
      setMensajes(prev => [...prev, mensajeError])
      setLlmStatus('offline')
    } finally {
      setIsTyping(false)
    }
  }

  const handleRestart = () => {
    setMensajes([])
    setResultados([])
  }

  const abrirModal = (pelicula: Pelicula, indice: number) => {
    setModalPelicula(pelicula)
    setModalIndice(indice)
  }

  const cerrarModal = () => {
    setModalPelicula(null)
  }

  return (
    <div className="h-screen bg-bg relative overflow-hidden">
      <div className="bg-glow" />

      <div className="relative z-10 h-full max-w-4xl mx-auto px-4 py-4">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
            >
              <span className="text-xl">🎬</span>
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-text">FilmBot</h1>
              <p className="text-xs text-text-dim">Tu asistente de películas</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-border shadow-sm">
              <button
                onClick={() => setModo('local')}
                className={`text-xs px-2 py-1 rounded-full transition-colors ${modo === 'local' ? 'bg-green-100 text-green-700' : 'text-text-dim hover:text-text'}`}
              >
                Local
              </button>
              <button
                onClick={() => setModo('cohere')}
                className={`text-xs px-2 py-1 rounded-full transition-colors ${modo === 'cohere' ? 'bg-blue-100 text-blue-700' : 'text-text-dim hover:text-text'}`}
              >
                API
              </button>
            </div>

            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-border shadow-sm">
              <button
                onClick={() => setModoLlm('auto')}
                className={`text-xs px-2 py-1 rounded-full transition-colors ${modoLlm === 'auto' ? 'bg-indigo-100 text-indigo-700' : 'text-text-dim hover:text-text'}`}
              >
                Auto
              </button>
              <button
                onClick={() => setModoLlm('groq')}
                className={`text-xs px-2 py-1 rounded-full transition-colors ${modoLlm === 'groq' ? 'bg-green-100 text-green-700' : 'text-text-dim hover:text-text'}`}
              >
                Groq
              </button>
              <button
                onClick={() => setModoLlm('ollama')}
                className={`text-xs px-2 py-1 rounded-full transition-colors ${modoLlm === 'ollama' ? 'bg-orange-100 text-orange-700' : 'text-text-dim hover:text-text'}`}
              >
                Ollama
              </button>
            </div>
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-[calc(100%-80px)] glass-strong rounded-3xl overflow-hidden shadow-xl"
        >
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden">
              <ChatBot
                messages={mensajes}
                isTyping={isTyping}
                onRestart={handleRestart}
                llmStatus={llmStatus}
              />
            </div>

            <div className="border-t border-border bg-white">
              <SearchForm onBuscar={handleBuscar} cargando={isTyping} />
            </div>
          </div>
        </motion.div>

        {resultados.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-20 left-4 right-4"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-border p-4">
              <p className="text-xs text-text-dim mb-3 font-medium">Películas mencionadas:</p>
              <div className="flex flex-wrap gap-2">
                {resultados.map((p, i) => (
                  <button
                    key={`${p.titulo}-${i}`}
                    onClick={() => abrirModal(p, i + 1)}
                    className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full transition-colors"
                  >
                    🎬 {p.titulo}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <MovieModal
        pelicula={modalPelicula}
        indice={modalIndice}
        onClose={cerrarModal}
      />
    </div>
  )
}

export default App

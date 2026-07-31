import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ChatMessage } from '../api/chat'

interface ChatBotProps {
  messages: ChatMessage[]
  isTyping: boolean
  onRestart: () => void
  llmStatus: 'groq' | 'ollama' | 'offline' | 'error'
}

export function ChatBot({ messages, isTyping, onRestart, llmStatus }: ChatBotProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const getStatusColor = () => {
    switch (llmStatus) {
      case 'groq': return 'bg-green-500'
      case 'ollama': return 'bg-orange-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusText = () => {
    switch (llmStatus) {
      case 'groq': return 'Groq'
      case 'ollama': return 'Ollama'
      default: return 'Offline'
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-lg">🎬</span>
            </div>
            {isTyping && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
              />
            )}
          </motion.div>
          <div>
            <h3 className="font-semibold text-sm text-text">FilmBot</h3>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${getStatusColor()} ${llmStatus !== 'offline' ? 'animate-pulse' : ''}`} />
              <span className="text-xs text-text-dim">{getStatusText()}</span>
            </div>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onRestart}
            className="text-xs text-text-dim hover:text-accent transition-colors"
          >
            Nueva conversación
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-md'
                    : 'bg-white border border-border text-text rounded-bl-md shadow-sm'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{msg.role === 'user' ? '👤' : '🤖'}</span>
                  <p className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'text-white' : 'text-text'}`}>
                    {msg.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-border px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
              <div className="flex items-center gap-1">
                <motion.span
                  animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 bg-indigo-500 rounded-full"
                />
                <motion.span
                  animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-indigo-500 rounded-full"
                />
                <motion.span
                  animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-indigo-500 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}

        {messages.length === 0 && !isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center py-8"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg"
            >
              <span className="text-3xl">🎬</span>
            </motion.div>
            <h3 className="font-semibold text-text mb-1">¡Hola! Soy FilmBot</h3>
            <p className="text-sm text-text-dim max-w-xs">
              Cuéntame qué tipo de películas te gustan y te haré recomendaciones personalizadas
            </p>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

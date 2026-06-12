'use client'
import { useState, useRef, useEffect } from 'react'
import { API_BASE_URL } from '../../shared/config/api'
import { getAuthHeaders, getAuthToken } from '../../shared/lib/auth'
import './ChatWidget.css'

const INITIAL_MESSAGE = { role: 'ai', text: 'Hola! Soy tu asistente de AICart. Puedo ayudarte a encontrar productos. Preguntame lo que quieras!' }

function getStorageKey() {
  try {
    const token = getAuthToken()
    if (!token) return null
    // Decode JWT payload (base64) to get user id — no signature verification needed here
    const payload = JSON.parse(atob(token.split('.')[1]))
    return `ai_chat:${payload.sub || 'anon'}`
  } catch {
    return null
  }
}

function loadHistory() {
  try {
    const key = getStorageKey()
    if (!key) return [INITIAL_MESSAGE]
    const raw = localStorage.getItem(key)
    if (!raw) return [INITIAL_MESSAGE]
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [INITIAL_MESSAGE]
  } catch {
    return [INITIAL_MESSAGE]
  }
}

function saveHistory(messages) {
  try {
    const key = getStorageKey()
    if (!key) return
    localStorage.setItem(key, JSON.stringify(messages))
  } catch {
    // localStorage may be unavailable (private mode, storage full)
  }
}

function clearHistory() {
  try {
    const key = getStorageKey()
    if (key) localStorage.removeItem(key)
  } catch {}
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(loadHistory)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    saveHistory(messages)
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', text }])
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/ai/chat/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      const reply = typeof data.response === 'string' ? data.response : 'No pude procesar tu consulta.'
      setMessages(prev => [...prev, { role: 'ai', text: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Error al conectar con el asistente.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleClear = async () => {
    setLoading(true)
    try {
      await fetch(`${API_BASE_URL}/ai/chat/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: '', clear_history: true }),
      })
    } catch {
      // Silent — still clear locally
    } finally {
      clearHistory()
      setMessages([INITIAL_MESSAGE])
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-box">
          <div className="chat-header">
            🤖 Asistente AICart
            <button
              className="chat-clear-btn"
              onClick={handleClear}
              disabled={loading}
              title="Limpiar conversación"
            >
              🗑
            </button>
          </div>
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role}`}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="chat-msg loading">Escribiendo...</div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-row">
            <input
              className="chat-input"
              type="text"
              placeholder="Escribe tu pregunta..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      )}
      <button className="chat-toggle-btn" onClick={() => setOpen(o => !o)}>
        {open ? '✕' : '🤖'}
      </button>
    </div>
  )
}

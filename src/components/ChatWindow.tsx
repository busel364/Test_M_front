import { useEffect, useRef, useState, type FormEvent } from 'react'
import { sendMessage } from '../api/greenApi'
import { useAuth } from '../context/AuthContext'
import './ChatWindow.css'

interface ChatWindowProps {
  onBack?: () => void
}

function formatMessageTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ChatWindow({ onBack }: ChatWindowProps) {
  const {
    credentials,
    chats,
    messages,
    activeChatId,
    addMessage,
  } = useAuth()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const chat = chats.find((item) => item.chatId === activeChatId)
  const chatMessages = activeChatId ? messages[activeChatId] ?? [] : []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages.length, activeChatId])

  if (!activeChatId || !chat) {
    return (
      <section className="chat-window empty">
        <div className="chat-placeholder">
          <div className="placeholder-icon">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12a.43.43 0 01.14.27c.01.06.02.18 0 .28z" />
            </svg>
          </div>
          <h2>Выберите чат</h2>
          <p>Создайте новый чат или выберите существующий, чтобы начать переписку</p>
        </div>
      </section>
    )
  }

  const handleSend = async (event: FormEvent) => {
    event.preventDefault()
    if (!credentials || !text.trim() || sending) return

    const messageText = text.trim()
    setSending(true)
    setError('')

    try {
      const result = await sendMessage(credentials, activeChatId, messageText)
      addMessage({
        id: result.idMessage,
        chatId: activeChatId,
        text: messageText,
        timestamp: Date.now(),
        type: 'outgoing',
      })
      setText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="chat-window">
      <header className="chat-header">
        {onBack ? (
          <button type="button" className="back-btn" onClick={onBack} aria-label="Назад">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
        ) : null}
        <div className="avatar small">
          {(chat.name || '?').replace('@', '').charAt(0).toUpperCase()}
        </div>
        <div className="chat-header-meta">
          <strong>{chat.name}</strong>
          <span>{chat.phone}</span>
        </div>
      </header>

      <div className="messages">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`bubble-row ${message.type}`}
          >
            <div className={`bubble ${message.type}`}>
              <p>{message.text}</p>
              <time>{formatMessageTime(message.timestamp)}</time>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error ? <div className="send-error">{error}</div> : null}

      <form className="composer" onSubmit={handleSend}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Сообщение"
          maxLength={4096}
          disabled={sending}
        />
        <button type="submit" disabled={sending || !text.trim()} aria-label="Отправить">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </section>
  )
}

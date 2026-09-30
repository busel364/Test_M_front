import { useState, type FormEvent } from 'react'
import { checkAccount, normalizePhone, phoneToChatId } from '../api/greenApi'
import { useAuth } from '../context/AuthContext'
import './NewChatModal.css'

interface NewChatModalProps {
  onClose: () => void
}

export function NewChatModal({ onClose }: NewChatModalProps) {
  const { credentials, upsertChat, setActiveChatId } = useAuth()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!credentials) return

    setError('')
    setLoading(true)

    const digits = normalizePhone(phone)
    if (digits.length < 10) {
      setError('Введите номер телефона в международном формате, например 79991234567')
      setLoading(false)
      return
    }

    try {
      let chatId = phoneToChatId(digits)
      let name = digits

      try {
        const account = await checkAccount(credentials, Number(digits))
        if (account.exist === false) {
          throw new Error('Аккаунт Telegram с таким номером не найден')
        }
        if (account.chatId) {
          chatId = String(account.chatId)
          if (account.username) {
            const username = account.username.replace(/^@+/, '')
            name = username ? `@${username}` : digits
          } else {
            name = digits
          }
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes('не найден')) {
          throw err
        }
        // CheckAccount может быть недоступен — создаём чат по номеру
      }

      upsertChat({
        chatId,
        phone: digits,
        name,
      })
      setActiveChatId(chatId)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать чат')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-chat-title"
      >
        <h2 id="new-chat-title">Новый чат</h2>
        <p className="modal-desc">
          Введите номер получателя в международном формате без «+» и пробелов
        </p>

        <form onSubmit={handleSubmit}>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="79991234567"
            autoFocus
            inputMode="tel"
          />

          {error ? <div className="modal-error">{error}</div> : null}

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Создание…' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState, type FormEvent } from 'react'
import { getStateInstance, setSettings } from '../api/greenApi'
import { useAuth } from '../context/AuthContext'
import './LoginForm.css'

export function LoginForm() {
  const { login } = useAuth()
  const [apiUrl, setApiUrl] = useState('https://api.green-api.com')
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const credentials = {
      apiUrl: apiUrl.trim().replace(/\/$/, ''),
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    }

    try {
      const state = await getStateInstance(credentials)

      if (state.stateInstance !== 'authorized') {
        throw new Error(
          `Инстанс не авторизован (статус: ${state.stateInstance}). Авторизуйте Telegram в кабинете GREEN-API.`,
        )
      }

      try {
        await setSettings(credentials)
      } catch {
        // Настройки можно выставить вручную в кабинете — не блокируем вход
      }

      login(credentials)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось войти')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo" aria-hidden>
            <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12a.43.43 0 01.14.27c.01.06.02.18 0 .28z" />
            </svg>
          </div>
          <h1>Telegram Chat</h1>
          <p>GREEN-API · тестовое задание</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>apiUrl</span>
            <input
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.green-api.com"
              required
              autoComplete="off"
            />
          </label>

          <label>
            <span>idInstance</span>
            <input
              value={idInstance}
              onChange={(e) => setIdInstance(e.target.value)}
              placeholder="Из личного кабинета GREEN-API"
              required
              autoComplete="off"
            />
          </label>

          <label>
            <span>apiTokenInstance</span>
            <input
              value={apiTokenInstance}
              onChange={(e) => setApiTokenInstance(e.target.value)}
              placeholder="Токен инстанса"
              required
              autoComplete="off"
              type="password"
            />
          </label>

          {error ? <div className="login-error">{error}</div> : null}

          <button type="submit" disabled={loading}>
            {loading ? 'Проверка…' : 'Войти'}
          </button>
        </form>

        <p className="login-hint">
          Создайте Telegram-инстанс на{' '}
          <a
            href="https://green-api.com/telegram/"
            target="_blank"
            rel="noreferrer"
          >
            green-api.com/telegram
          </a>
          , авторизуйте его и скопируйте параметры доступа.
        </p>
      </div>
    </div>
  )
}

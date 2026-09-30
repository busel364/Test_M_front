import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Chat, Credentials, Message } from '../types'

const CREDENTIALS_KEY = 'green-api-telegram-credentials'

interface SessionData {
  chats: Chat[]
  messages: Record<string, Message[]>
  activeChatId: string | null
}

interface AuthContextValue {
  credentials: Credentials | null
  chats: Chat[]
  messages: Record<string, Message[]>
  activeChatId: string | null
  login: (credentials: Credentials) => void
  logout: () => void
  setActiveChatId: (chatId: string | null) => void
  upsertChat: (chat: Chat) => void
  addMessage: (message: Message) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function sessionKey(idInstance: string): string {
  return `green-api-telegram-session:${idInstance}`
}

function loadCredentials(): Credentials | null {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Credentials
  } catch {
    return null
  }
}

function loadSession(idInstance: string): SessionData {
  try {
    const raw = localStorage.getItem(sessionKey(idInstance))
    if (!raw) {
      return { chats: [], messages: {}, activeChatId: null }
    }
    const parsed = JSON.parse(raw) as SessionData
    return {
      chats: parsed.chats ?? [],
      messages: parsed.messages ?? {},
      activeChatId: parsed.activeChatId ?? null,
    }
  } catch {
    return { chats: [], messages: {}, activeChatId: null }
  }
}

function saveSession(idInstance: string, data: SessionData): void {
  localStorage.setItem(sessionKey(idInstance), JSON.stringify(data))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialCredentials = loadCredentials()
  const initialSession = initialCredentials
    ? loadSession(initialCredentials.idInstance)
    : { chats: [], messages: {}, activeChatId: null }

  const [credentials, setCredentials] = useState<Credentials | null>(
    initialCredentials,
  )
  const [chats, setChats] = useState<Chat[]>(initialSession.chats)
  const [messages, setMessages] = useState<Record<string, Message[]>>(
    initialSession.messages,
  )
  const [activeChatId, setActiveChatId] = useState<string | null>(
    initialSession.activeChatId,
  )

  useEffect(() => {
    if (!credentials) return
    saveSession(credentials.idInstance, { chats, messages, activeChatId })
  }, [credentials, chats, messages, activeChatId])

  const login = useCallback((next: Credentials) => {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(next))
    const session = loadSession(next.idInstance)
    setCredentials(next)
    setChats(session.chats)
    setMessages(session.messages)
    setActiveChatId(session.activeChatId)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(CREDENTIALS_KEY)
    setCredentials(null)
    setChats([])
    setMessages({})
    setActiveChatId(null)
  }, [])

  const upsertChat = useCallback((chat: Chat) => {
    setChats((prev) => {
      const index = prev.findIndex((item) => item.chatId === chat.chatId)
      if (index === -1) {
        return [chat, ...prev]
      }

      const next = [...prev]
      next[index] = { ...next[index], ...chat }
      return next.sort(
        (a, b) => (b.lastTimestamp ?? 0) - (a.lastTimestamp ?? 0),
      )
    })
  }, [])

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      const list = prev[message.chatId] ?? []
      if (list.some((item) => item.id === message.id)) {
        return prev
      }

      return {
        ...prev,
        [message.chatId]: [...list, message],
      }
    })

    setChats((prev) => {
      const index = prev.findIndex((item) => item.chatId === message.chatId)
      const patch: Chat = {
        chatId: message.chatId,
        phone: message.chatId.replace('@c.us', ''),
        name:
          message.senderName ||
          (index >= 0 ? prev[index].name : message.chatId.replace('@c.us', '')),
        lastMessage: message.text,
        lastTimestamp: message.timestamp,
      }

      if (index === -1) {
        return [patch, ...prev]
      }

      const next = [...prev]
      next[index] = {
        ...next[index],
        lastMessage: message.text,
        lastTimestamp: message.timestamp,
        name: message.senderName || next[index].name,
      }
      return next.sort(
        (a, b) => (b.lastTimestamp ?? 0) - (a.lastTimestamp ?? 0),
      )
    })
  }, [])

  const value = useMemo(
    () => ({
      credentials,
      chats,
      messages,
      activeChatId,
      login,
      logout,
      setActiveChatId,
      upsertChat,
      addMessage,
    }),
    [
      credentials,
      chats,
      messages,
      activeChatId,
      login,
      logout,
      upsertChat,
      addMessage,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

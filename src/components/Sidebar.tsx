import { useAuth } from '../context/AuthContext'
import './Sidebar.css'

interface SidebarProps {
  onNewChat: () => void
}

function formatTime(timestamp?: number): string {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function avatarLetter(name: string): string {
  return (name || '?').replace('@', '').charAt(0).toUpperCase()
}

export function Sidebar({ onNewChat }: SidebarProps) {
  const { chats, activeChatId, setActiveChatId, logout, credentials } = useAuth()

  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <div className="sidebar-user">
          <div className="avatar avatar-self">TG</div>
          <div className="sidebar-user-meta">
            <strong>Telegram</strong>
            <span>id: {credentials?.idInstance}</span>
          </div>
        </div>
        <div className="sidebar-actions">
          <button type="button" className="icon-btn" onClick={onNewChat} title="Новый чат">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </button>
          <button type="button" className="icon-btn" onClick={logout} title="Выйти">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="chat-list">
        {chats.length === 0 ? (
          <div className="chat-list-empty">
            <p>Нет чатов</p>
            <button type="button" onClick={onNewChat}>
              Создать чат
            </button>
          </div>
        ) : (
          chats.map((chat) => (
            <button
              key={chat.chatId}
              type="button"
              className={`chat-item${activeChatId === chat.chatId ? ' active' : ''}`}
              onClick={() => setActiveChatId(chat.chatId)}
            >
              <div className="avatar">{avatarLetter(chat.name)}</div>
              <div className="chat-item-body">
                <div className="chat-item-top">
                  <span className="chat-item-name">{chat.name}</span>
                  <span className="chat-item-time">{formatTime(chat.lastTimestamp)}</span>
                </div>
                <div className="chat-item-preview">
                  {chat.lastMessage || chat.phone}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  )
}

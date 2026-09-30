import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../hooks/useNotifications'
import { ChatWindow } from './ChatWindow'
import { NewChatModal } from './NewChatModal'
import { Sidebar } from './Sidebar'
import './ChatApp.css'

export function ChatApp() {
  useNotifications()
  const { activeChatId, setActiveChatId } = useAuth()
  const [showNewChat, setShowNewChat] = useState(false)
  const [mobileShowChat, setMobileShowChat] = useState(false)

  useEffect(() => {
    if (activeChatId) {
      setMobileShowChat(true)
    }
  }, [activeChatId])

  const handleSelectChatIntent = () => {
    setShowNewChat(true)
  }

  return (
    <div className="chat-app">
      <div className="chat-shell">
        <div className={`panel-sidebar${mobileShowChat ? ' hide-on-mobile' : ''}`}>
          <Sidebar onNewChat={handleSelectChatIntent} />
        </div>

        <div className={`panel-chat${!mobileShowChat ? ' hide-on-mobile' : ''}`}>
          <ChatWindow
            onBack={() => {
              setMobileShowChat(false)
              setActiveChatId(null)
            }}
          />
        </div>
      </div>

      {showNewChat ? (
        <NewChatModal onClose={() => setShowNewChat(false)} />
      ) : null}
    </div>
  )
}

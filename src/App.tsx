import { AuthProvider, useAuth } from './context/AuthContext'
import { ChatApp } from './components/ChatApp'
import { LoginForm } from './components/LoginForm'

function AppContent() {
  const { credentials } = useAuth()
  return credentials ? <ChatApp /> : <LoginForm />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/hooks/useAuth'
import Router from './router'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/hooks/useAuth'
import { ToastProvider } from '@/shared/components/ui/Toast'
import Router from './router'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Router />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

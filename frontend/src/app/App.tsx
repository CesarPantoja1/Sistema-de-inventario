import { BrowserRouter } from 'react-router-dom'
import Router from './router'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Router />
      </div>
    </BrowserRouter>
  )
}

export default App

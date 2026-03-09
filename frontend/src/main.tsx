import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { WorkerProvider } from './contexts/WorkerContext'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <WorkerProvider>
        <App />
      </WorkerProvider>
    </BrowserRouter>
  </StrictMode>,
)

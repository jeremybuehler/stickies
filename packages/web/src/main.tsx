import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from './providers/ClerkProvider'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider>
      <App />
    </ClerkProvider>
  </StrictMode>
)

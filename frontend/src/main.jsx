import React from 'react'
import ReactDOM from 'react-dom/client'
import { NextUIProvider } from '@nextui-org/react'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NextUIProvider>
      <div className="min-h-screen bg-background text-foreground">
        <App />
      </div>
    </NextUIProvider>
  </React.StrictMode>,
)
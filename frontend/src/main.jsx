import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthContextProvider } from './context/AuthContext.jsx'
import { SocketContextProvider } from './context/SocketContext.jsx'
import { PollingContextProvider } from './context/PollingContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <SocketContextProvider>
          <PollingContextProvider>
            <App />
          </PollingContextProvider>
        </SocketContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </React.StrictMode>,
)


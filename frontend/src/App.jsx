import Home from './pages/home/home.jsx'
import Login from './pages/login/login.jsx'
import Home from './pages/home/home.jsx'
import Login from './pages/login/login.jsx'
import Signup from './pages/signup/signup.jsx'
import "./App.css"
import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from "react-hot-toast"
import { useAuthContext } from './context/AuthContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'

function App() {

  const { authUser } = useAuthContext();

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <div className='p-4 h-screen flex items-center justify-center'>
          <Routes>
            <Route path='/' element={authUser ? <Home /> : <Navigate to="/login" />} />
            <Route path='/signup' element={authUser ? <Navigate to="/" /> : <Signup />} />
            <Route path='/login' element={authUser ? <Navigate to="/" /> : <Login />} />
          </Routes>
          <Toaster />

        </div>
      </NotificationProvider>
    </ErrorBoundary>
  )
}

export default App

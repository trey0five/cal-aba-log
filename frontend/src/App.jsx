import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AnimatedBackground from './components/AnimatedBackground'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Setup from './pages/Setup'
import Dashboard from './pages/Dashboard'
import Children from './pages/Children'
import AddChild from './pages/AddChild'
import ChildProfile from './pages/ChildProfile'
import Logs from './pages/Logs'
import Staff from './pages/Staff'
import ChangePin from './pages/ChangePin'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      {user && <Navbar />}
      <main className="max-w-2xl mx-auto px-4 py-6 relative z-10 page-enter">
        <Routes>
          <Route path="/setup" element={<Setup />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/children" element={<ProtectedRoute><Children /></ProtectedRoute>} />
          <Route path="/children/add" element={<ProtectedRoute><AddChild /></ProtectedRoute>} />
          <Route path="/child/:childId" element={<ProtectedRoute><ChildProfile /></ProtectedRoute>} />
          <Route path="/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
          <Route path="/staff" element={<ProtectedRoute><Staff /></ProtectedRoute>} />
          <Route path="/change-pin" element={<ProtectedRoute><ChangePin /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}

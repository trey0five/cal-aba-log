import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const links = [
    { to: '/', label: 'Home', icon: '🏕️' },
    { to: '/children', label: 'Campers', icon: '👧' },
    { to: '/scan', label: 'Scan', icon: '📷' },
    { to: '/logs', label: 'Logs', icon: '📋' },
  ]

  if (user?.role === 'admin') {
    links.push({ to: '/staff', label: 'Staff', icon: '👥' })
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="camp-nav relative z-20">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-heading text-xl text-white drop-shadow-lg wiggle">
          <img src={`${import.meta.env.BASE_URL}logo.jpeg`} alt="Camp CAL" className="h-14 w-14 rounded-full border-2 border-yellow-400 shadow-lg" />
          <span className="hidden sm:inline">Camp CAL</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-3">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full text-sm font-bold transition-all duration-200 ${
                isActive(l.to)
                  ? 'bg-yellow-400 text-yellow-900 shadow-md scale-105'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <span>{l.icon}</span>
              <span className="hidden sm:inline">{l.label}</span>
            </Link>
          ))}
          <button
            onClick={logout}
            className="ml-1 text-sm bg-red-500/80 text-white px-3 py-1.5 rounded-full hover:bg-red-600 transition-all font-bold"
          >
            ✌️ <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

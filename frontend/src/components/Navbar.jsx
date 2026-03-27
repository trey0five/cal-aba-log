import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const links = [
    { to: '/', label: 'Home' },
    { to: '/children', label: 'Campers' },
    { to: '/logs', label: 'Logs' },
  ]

  if (user?.role === 'admin') {
    links.push({ to: '/staff', label: 'Staff' })
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="camp-nav relative z-20">
      <div className="max-w-3xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo + name */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img
            src={`${import.meta.env.BASE_URL}logo.jpeg`}
            alt="Camp CAL"
            className="h-12 w-12 rounded-full border-2 border-yellow-400 shadow-lg"
          />
          <span className="font-heading text-white text-lg leading-tight drop-shadow-md hidden sm:block">
            Camp CAL
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
                isActive(l.to)
                  ? 'bg-yellow-400 text-yellow-900 shadow-md'
                  : 'text-white/90 hover:bg-white/20'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="ml-2 text-sm bg-red-500/80 text-white px-3 py-1.5 rounded-full hover:bg-red-600 transition-all font-bold"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

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
      <div className="max-w-3xl mx-auto px-2 sm:px-4 py-2 flex items-center justify-between gap-1">
        {/* Logo + name */}
        <Link to="/" className="flex items-center gap-2 sm:gap-4 shrink-0">
          <img
            src={`${import.meta.env.BASE_URL}logo.jpeg`}
            alt="Camp CAL"
            className="h-10 w-10 sm:h-14 sm:w-14 rounded-full border-2 border-yellow-400 shadow-lg sm:mr-1"
          />
          <span className="font-heading text-white text-lg leading-tight drop-shadow-md hidden sm:block">
            CAMP CAL
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                isActive(l.to)
                  ? 'bg-yellow-400 text-yellow-900 shadow-md'
                  : 'text-white/90 hover:bg-white/20'
              }`}
            >
              {l.label}
            </Link>
          ))}

          {/* User menu */}
          <div className="relative ml-0.5 sm:ml-2 shrink-0">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1 text-xs sm:text-sm bg-white/20 text-white px-2 sm:px-3 py-1.5 rounded-full hover:bg-white/30 transition-all font-bold"
            >
              <span className="max-w-[60px] sm:max-w-none truncate">{user?.name}</span>
              <span aria-hidden="true">▾</span>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50">
                  <Link
                    to="/change-pin"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Change Password
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); logout() }}
                    className="block w-full text-left px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

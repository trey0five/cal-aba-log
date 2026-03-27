import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const links = [
    { to: '/', label: 'Home' },
    { to: '/children', label: 'Children' },
    { to: '/scan', label: 'Scan' },
    { to: '/logs', label: 'Logs' },
  ]

  if (user?.role === 'admin') {
    links.push({ to: '/staff', label: 'Staff' })
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <img src={`${import.meta.env.BASE_URL}logo.jpeg`} alt="Camp CAL" className="h-8 w-8 rounded-full" />
          Camp CAL
        </Link>
        <div className="flex items-center gap-4">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm hover:text-blue-200 ${isActive(l.to) ? 'underline underline-offset-4' : ''}`}
            >
              {l.label}
            </Link>
          ))}
          <button onClick={logout} className="text-sm bg-blue-700 px-3 py-1 rounded hover:bg-blue-800">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

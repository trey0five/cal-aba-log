import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Dashboard() {
  const { user } = useAuth()
  const [todayLogs, setTodayLogs] = useState([])
  const [children, setChildren] = useState([])

  useEffect(() => {
    api.get('/logs').then((res) => setTodayLogs(res.data)).catch(() => {})
    api.get('/children').then((res) => setChildren(res.data)).catch(() => {})
  }, [])

  const checkedIn = children.filter((child) => {
    const childLogs = todayLogs.filter((l) => l.child_id === child.id)
    if (childLogs.length === 0) return false
    return childLogs[childLogs.length - 1].action === 'in'
  })

  return (
    <div className="page-enter">
      <div className="camp-card-wood text-center mb-6">
        <h1 className="font-heading text-2xl sm:text-3xl drop-shadow-lg relative z-10">
          Welcome, {user.name}!
        </h1>
        <p className="text-white/80 mt-1 relative z-10 font-semibold">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link to="/checked-in" className="stat-card stat-card-green block hover:scale-[1.03] transition-transform">
          <p className="text-5xl font-heading drop-shadow-md">{checkedIn.length}</p>
          <p className="text-white/90 font-bold mt-1">Checked In</p>
        </Link>
        <Link to="/children" className="stat-card stat-card-blue block hover:scale-[1.03] transition-transform">
          <p className="text-5xl font-heading drop-shadow-md">{children.length}</p>
          <p className="text-white/90 font-bold mt-1">Total Campers</p>
        </Link>
      </div>

      {user?.role === 'admin' && (
        <Link to="/children/add" className="btn-camp btn-camp-green text-center block wiggle mb-6">
          + Add Camper
        </Link>
      )}

      {checkedIn.length > 0 && (
        <div className="camp-card">
          <h2 className="font-heading text-xl mb-3 text-green-700">Currently at Camp</h2>
          <ul className="space-y-2">
            {checkedIn.map((child) => (
              <li key={child.id} className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-xl border border-green-100">
                <span className="font-bold text-gray-700">{child.name}</span>
                <Link to={`/child/${child.id}`} className="badge-out text-xs hover:scale-105 transition-transform cursor-pointer">
                  Check Out →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {checkedIn.length === 0 && children.length > 0 && (
        <div className="camp-card text-center">
          <p className="font-heading text-lg text-gray-500">No campers checked in yet today</p>
          <p className="text-gray-400 text-sm mt-1">Open a camper's profile to check them in</p>
        </div>
      )}

      {children.length === 0 && (
        <div className="camp-card text-center">
          <p className="font-heading text-lg text-gray-500">No campers added yet</p>
          <Link to="/children/add" className="text-blue-500 font-bold hover:underline mt-1 inline-block">
            Add your first camper →
          </Link>
        </div>
      )}
    </div>
  )
}

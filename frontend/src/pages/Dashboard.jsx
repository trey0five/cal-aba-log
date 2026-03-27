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
    <div>
      <h1 className="text-2xl font-bold mb-1">Welcome, {user.name}</h1>
      <p className="text-gray-500 mb-6">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-3xl font-bold text-green-600">{checkedIn.length}</p>
          <p className="text-gray-500 text-sm">Checked In</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-3xl font-bold text-blue-600">{children.length}</p>
          <p className="text-gray-500 text-sm">Total Children</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link to="/scan" className="bg-blue-600 text-white p-4 rounded-lg shadow text-center hover:bg-blue-700">
          Scan QR Code
        </Link>
        <Link to="/children/add" className="bg-green-600 text-white p-4 rounded-lg shadow text-center hover:bg-green-700">
          Add Child
        </Link>
      </div>

      {checkedIn.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">Currently Checked In</h2>
          <ul className="space-y-2">
            {checkedIn.map((child) => (
              <li key={child.id} className="flex items-center justify-between py-1 border-b last:border-0">
                <span>{child.name}</span>
                <Link to={`/scan/${child.id}`} className="text-blue-600 text-sm hover:underline">
                  Check Out
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

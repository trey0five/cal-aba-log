import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'

function ElapsedTimer({ since }) {
  const [elapsed, setElapsed] = useState('')
  useEffect(() => {
    const calc = () => {
      const diff = Math.floor((Date.now() - new Date(since).getTime()) / 1000)
      const h = Math.floor(diff / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60
      setElapsed(`${h}h ${m}m ${s}s`)
    }
    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [since])
  return <span>{elapsed}</span>
}

export default function CheckedIn() {
  const navigate = useNavigate()
  const [children, setChildren] = useState([])
  const [todayLogs, setTodayLogs] = useState([])

  useEffect(() => {
    Promise.all([
      api.get('/children'),
      api.get('/logs'),
    ]).then(([childRes, logsRes]) => {
      setChildren(childRes.data)
      setTodayLogs(logsRes.data)
    }).catch(() => {})
  }, [])

  const checkedInKids = children
    .map((child) => {
      const childLogs = todayLogs.filter((l) => l.child_id === child.id)
      if (childLogs.length === 0) return null
      const last = childLogs[childLogs.length - 1]
      if (last.action !== 'in') return null
      return { ...child, checkinTime: last.timestamp, checkinBy: last.staff_name, caregiver: last.caregiver }
    })
    .filter(Boolean)

  return (
    <div className="page-enter">
      <div className="page-header flex items-center justify-between mb-4">
        <h1 className="font-heading text-2xl text-white drop-shadow-lg">Currently Checked In</h1>
        <button onClick={() => navigate('/')} className="back-btn">← Back</button>
      </div>

      {checkedInKids.length === 0 ? (
        <div className="camp-card text-center py-8">
          <p className="font-heading text-lg text-gray-500">No campers checked in right now</p>
        </div>
      ) : (
        <>
          <div className="camp-card mb-4 text-center">
            <p className="font-heading text-4xl text-green-600">{checkedInKids.length}</p>
            <p className="text-sm font-bold text-gray-500">Camper{checkedInKids.length !== 1 ? 's' : ''} at camp</p>
          </div>

          <ul className="space-y-3">
            {checkedInKids.map((child) => (
              <li key={child.id}>
                <Link to={`/child/${child.id}`} className="camp-card block hover:scale-[1.01] transition-transform">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-heading text-lg">{child.name}</p>
                      <p className="text-xs text-gray-500 font-semibold">
                        Dropped off by: {child.caregiver} &middot; Staff: {child.checkinBy}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading text-lg text-green-600">
                        <ElapsedTimer since={child.checkinTime} />
                      </p>
                      <p className="text-xs font-bold text-gray-400">elapsed</p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

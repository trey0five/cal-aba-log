import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Logs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    loadLogs()
  }, [date])

  const loadLogs = () => {
    api.get(`/logs?date=${date}`).then((res) => setLogs(res.data)).catch(() => {})
  }

  const handleDeleteLog = async (logId) => {
    if (!confirm('Remove this log entry? It can be recovered later.')) return
    try {
      await api.post('/logs/delete', { log_id: logId, date })
      loadLogs()
    } catch {
      alert('Failed to delete log')
    }
  }

  return (
    <div className="page-enter">
      <h1 className="font-heading text-2xl text-white drop-shadow-lg mb-4">Activity Logs</h1>

      <div className="camp-card mb-4">
        <label className="block text-sm font-bold text-gray-600 mb-1">Select Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="camp-input"
        />
      </div>

      {logs.length === 0 ? (
        <div className="camp-card text-center py-8">
          <p className="font-heading text-lg text-gray-500">No activity for this date</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {[...logs].reverse().map((log) => (
            <li key={log.id} className="camp-card !p-3">
              <div className="flex items-center justify-between">
                <div>
                  <Link to={`/child/${log.child_id}`} className="font-heading text-base hover:text-blue-600">
                    {log.child_name}
                  </Link>
                  <p className="text-gray-500 text-xs font-semibold">
                    Staff: {log.staff_name}
                    {log.caregiver && <> &middot; Caregiver: {log.caregiver}</>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className={log.action === 'in' ? 'badge-in' : 'badge-out'}>
                      {log.action === 'in' ? 'IN' : 'OUT'}
                    </span>
                    <p className="text-gray-400 text-xs mt-1 font-semibold">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="text-red-400 hover:text-red-600 text-xs font-bold ml-1"
                      title="Remove log entry"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

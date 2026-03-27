import { useState, useEffect } from 'react'
import api from '../api/client'

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    api.get(`/logs?date=${date}`).then((res) => setLogs(res.data)).catch(() => {})
  }, [date])

  return (
    <div className="page-enter">
      <h1 className="font-heading text-2xl text-white drop-shadow-lg mb-4">📋 Activity Logs</h1>

      <div className="camp-card mb-4">
        <label className="block text-sm font-bold text-gray-600 mb-1">📅 Select Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="camp-input"
        />
      </div>

      {logs.length === 0 ? (
        <div className="camp-card text-center py-8">
          <p className="text-4xl mb-2">📭</p>
          <p className="font-heading text-lg text-gray-500">No activity for this date</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {[...logs].reverse().map((log) => (
            <li key={log.id} className="camp-card !p-3 flex items-center justify-between">
              <div>
                <p className="font-heading text-base">🧒 {log.child_name}</p>
                <p className="text-gray-500 text-sm font-semibold">by {log.staff_name}</p>
              </div>
              <div className="text-right">
                <span className={log.action === 'in' ? 'badge-in' : 'badge-out'}>
                  {log.action === 'in' ? '✅ IN' : '👋 OUT'}
                </span>
                <p className="text-gray-400 text-xs mt-1 font-semibold">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

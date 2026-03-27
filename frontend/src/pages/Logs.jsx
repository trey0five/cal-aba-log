import { useState, useEffect } from 'react'
import api from '../api/client'

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    api.get(`/logs?date=${date}`).then((res) => setLogs(res.data)).catch(() => {})
  }, [date])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Activity Logs</h1>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border rounded px-3 py-2 mb-4 w-full"
      />

      {logs.length === 0 ? (
        <p className="text-gray-500 text-center mt-6">No activity for this date.</p>
      ) : (
        <ul className="space-y-2">
          {[...logs].reverse().map((log) => (
            <li key={log.id} className="bg-white rounded-lg shadow p-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{log.child_name}</p>
                <p className="text-gray-500 text-sm">by {log.staff_name}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  log.action === 'in' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {log.action === 'in' ? 'IN' : 'OUT'}
                </span>
                <p className="text-gray-400 text-xs mt-1">
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

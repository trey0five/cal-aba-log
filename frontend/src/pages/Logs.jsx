import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Logs() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [allChildLogs, setAllChildLogs] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [dayLogs, setDayLogs] = useState([])

  useEffect(() => {
    api.get('/children').then((res) => setChildren(res.data)).catch(() => {})
  }, [])

  const selectChild = async (child) => {
    setSelectedChild(child)
    setSelectedDate(null)
    try {
      const res = await api.get(`/children/${child.id}/logs`)
      setAllChildLogs(res.data)
    } catch {
      setAllChildLogs([])
    }
  }

  const getGroupedByDate = () => {
    const groups = {}
    allChildLogs.forEach((log) => {
      const date = log.date || new Date(log.timestamp).toISOString().split('T')[0]
      if (!groups[date]) groups[date] = []
      groups[date].push(log)
    })
    // Sort dates descending
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }

  const selectDate = (date, logs) => {
    setSelectedDate(date)
    setDayLogs(logs)
  }

  const getDaySummary = (logs) => {
    const checkIns = logs.filter((l) => l.action === 'in')
    const checkOuts = logs.filter((l) => l.action === 'out')
    const totalElapsed = checkOuts.reduce((sum, l) => sum + (l.elapsed_seconds || 0), 0)
    const hours = Math.floor(totalElapsed / 3600)
    const minutes = Math.floor((totalElapsed % 3600) / 60)
    return {
      checkIns: checkIns.length,
      checkOuts: checkOuts.length,
      totalTime: totalElapsed > 0 ? `${hours}h ${minutes}m` : null,
    }
  }

  const handleDeleteLog = async (logId) => {
    if (!confirm('Remove this log entry? It can be recovered later.')) return
    try {
      await api.post('/logs/delete', { log_id: logId, date: selectedDate })
      // Reload child logs
      const res = await api.get(`/children/${selectedChild.id}/logs`)
      setAllChildLogs(res.data)
      // Update day view
      const updatedDay = res.data.filter((l) => {
        const d = l.date || new Date(l.timestamp).toISOString().split('T')[0]
        return d === selectedDate
      })
      setDayLogs(updatedDay)
    } catch {
      alert('Failed to delete log')
    }
  }

  const formatDate = (dateStr) =>
    new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    })

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  // ── View 1: Child selection ──
  if (!selectedChild) {
    return (
      <div className="page-enter">
        <h1 className="font-heading text-2xl text-white drop-shadow-lg mb-4">Activity Logs</h1>

        {children.length === 0 ? (
          <div className="camp-card text-center py-8">
            <p className="font-heading text-lg text-gray-500">No campers yet</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {children.map((child) => (
              <li key={child.id}>
                <button
                  onClick={() => selectChild(child)}
                  className="camp-card block w-full text-left hover:scale-[1.01] transition-transform"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-heading text-lg">{child.name}</p>
                      {child.age && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                          Age {child.age}
                        </span>
                      )}
                    </div>
                    <span className="text-blue-500 text-sm font-bold">View Logs →</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        <button onClick={() => navigate('/')} className="text-white font-bold hover:underline text-sm block text-center w-full mt-4 pb-4">
          ← Back
        </button>
      </div>
    )
  }

  // ── View 3: Day detail ──
  if (selectedDate) {
    // Pair up check-ins and check-outs
    const sortedLogs = [...dayLogs].sort((a, b) => a.timestamp.localeCompare(b.timestamp))

    return (
      <div className="page-enter">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-heading text-xl text-white drop-shadow-lg">{selectedChild.name}</h1>
            <p className="text-white/80 text-sm font-bold">{formatDate(selectedDate)}</p>
          </div>
          <button
            onClick={() => setSelectedDate(null)}
            className="btn-camp text-sm !py-2 !px-4 !bg-white/20 text-white"
          >
            ← Back
          </button>
        </div>

        {/* Day summary card */}
        {(() => {
          const summary = getDaySummary(sortedLogs)
          return (
            <div className="camp-card mb-4">
              <h2 className="font-heading text-lg mb-3 border-b-2 border-yellow-400 pb-1">Day Summary</h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                  <p className="font-heading text-2xl text-green-700">{summary.checkIns}</p>
                  <p className="text-xs font-bold text-green-600">Check-ins</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 border border-orange-200">
                  <p className="font-heading text-2xl text-orange-700">{summary.checkOuts}</p>
                  <p className="text-xs font-bold text-orange-600">Check-outs</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                  <p className="font-heading text-2xl text-blue-700">{summary.totalTime || '--'}</p>
                  <p className="text-xs font-bold text-blue-600">Total Time</p>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Individual log entries */}
        <ul className="space-y-3">
          {sortedLogs.map((log) => (
            <li key={log.id} className="camp-card !p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={log.action === 'in' ? 'badge-in' : 'badge-out'}>
                      {log.action === 'in' ? 'CHECK IN' : 'CHECK OUT'}
                    </span>
                    <span className="text-sm font-bold text-gray-600">
                      {formatTime(log.timestamp)}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      <span className="font-bold">Caregiver:</span> {log.caregiver}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-bold">Staff:</span> {log.staff_name}
                    </p>
                    {log.elapsed_display && (
                      <p className="text-gray-600">
                        <span className="font-bold">Time at camp:</span>{' '}
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                          {log.elapsed_display}
                        </span>
                      </p>
                    )}
                    {log.action === 'out' && log.checked_in_by && (
                      <p className="text-gray-500 text-xs">
                        Checked in by: {log.checked_in_by} (Caregiver: {log.checked_in_caregiver})
                      </p>
                    )}
                  </div>
                </div>

                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="text-red-400 hover:text-red-600 text-sm font-bold ml-2"
                    title="Remove log entry"
                  >
                    ✕
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // ── View 2: Date list for selected child ──
  const grouped = getGroupedByDate()

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-2xl text-white drop-shadow-lg">{selectedChild.name}</h1>
        <button
          onClick={() => { setSelectedChild(null); setAllChildLogs([]) }}
          className="btn-camp text-sm !py-2 !px-4 !bg-white/20 text-white"
        >
          ← All Campers
        </button>
      </div>

      {grouped.length === 0 ? (
        <div className="camp-card text-center py-8">
          <p className="font-heading text-lg text-gray-500">No activity logs for {selectedChild.name}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {grouped.map(([date, logs]) => {
            const summary = getDaySummary(logs)
            return (
              <li key={date}>
                <button
                  onClick={() => selectDate(date, logs)}
                  className="camp-card block w-full text-left hover:scale-[1.01] transition-transform"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-heading text-base">{formatDate(date)}</p>
                      <div className="flex gap-3 mt-1 text-xs font-semibold">
                        <span className="text-green-600">{summary.checkIns} in</span>
                        <span className="text-orange-600">{summary.checkOuts} out</span>
                        {summary.totalTime && (
                          <span className="text-blue-600">{summary.totalTime} total</span>
                        )}
                      </div>
                    </div>
                    <span className="text-blue-500 text-sm font-bold">Details →</span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

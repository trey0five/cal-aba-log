import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
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

function Confetti() {
  const colors = ['#FF6B35', '#FFD700', '#4CAF50', '#1a9fff', '#7B1FA2', '#E53935']
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    x: `${(Math.random() - 0.5) * 700}px`,
    y: `${(Math.random() - 0.5) * 700}px`,
    delay: `${Math.random() * 0.4}s`,
    size: Math.random() * 10 + 6,
  }))
  return (
    <div className="confetti-burst">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{ '--x': p.x, '--y': p.y, backgroundColor: p.color, width: p.size, height: p.size, borderRadius: Math.random() > 0.5 ? '50%' : '2px', animationDelay: p.delay }}
        />
      ))}
    </div>
  )
}

export default function ChildProfile() {
  const { childId } = useParams()
  const navigate = useNavigate()
  const [child, setChild] = useState(null)
  const [status, setStatus] = useState(null) // 'in', 'out', or null
  const [checkinTime, setCheckinTime] = useState(null)
  const [selectedCaregiver, setSelectedCaregiver] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [todayLogs, setTodayLogs] = useState([])
  const [allLogs, setAllLogs] = useState([])
  const [historyPage, setHistoryPage] = useState(1)
  const HISTORY_PER_PAGE = 5

  useEffect(() => {
    loadData()
  }, [childId])

  const loadData = async () => {
    try {
      const [childRes, logsRes, allLogsRes] = await Promise.all([
        api.get(`/children/${childId}`),
        api.get('/logs'),
        api.get(`/children/${childId}/logs`),
      ])
      setChild(childRes.data)
      setAllLogs(allLogsRes.data)
      const childLogs = logsRes.data.filter((l) => l.child_id === childId)
      setTodayLogs(childLogs)
      if (childLogs.length > 0) {
        const last = childLogs[childLogs.length - 1]
        setStatus(last.action)
        if (last.action === 'in') {
          setCheckinTime(last.timestamp)
        } else {
          setCheckinTime(null)
        }
      } else {
        setStatus(null)
        setCheckinTime(null)
      }
    } catch {
      setError('Could not load camper information')
    }
  }

  const getQRUrl = () => {
    const base = window.location.origin + window.location.pathname
    return `${base}#/child/${childId}`
  }

  const printQR = () => {
    const svg = document.getElementById('child-qr')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
      <head><title>QR Code - ${child.name}</title>
      <style>
        body { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; margin:0; }
        h2 { color:#8B6914; font-size:28px; margin-bottom:4px; }
        h3 { color:#333; font-size:22px; margin-top:0; }
        p { color:#FF6B35; font-weight:bold; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
      </head>
      <body>
        <h2>Camp CAL</h2>
        <h3>${child.name}</h3>
        ${svgData}
        <p style="margin-top:12px;">Scan to Check In / Check Out</p>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
    }
  }

  const triggerConfetti = () => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 2000)
  }

  const handleCheckin = async (action) => {
    setMessage('')
    setError('')
    if (!selectedCaregiver) {
      setError('You must select a caregiver')
      return
    }
    try {
      const res = await api.post('/checkin', { child_id: child.id, action, caregiver: selectedCaregiver })
      setStatus(action)
      if (action === 'in') {
        setMessage(`${child.name} checked IN by ${selectedCaregiver}!`)
        setCheckinTime(res.data.timestamp)
      } else {
        const elapsed = res.data.elapsed_display || ''
        setMessage(`${child.name} checked OUT by ${selectedCaregiver}! Time at camp: ${elapsed}`)
        setCheckinTime(null)
      }
      setSelectedCaregiver('')
      triggerConfetti()
      loadData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed')
    }
  }

  if (!child && !error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="camp-card text-center p-8">
          <p className="font-heading text-gray-500">Loading camper...</p>
        </div>
      </div>
    )
  }

  if (error && !child) {
    return (
      <div className="camp-card text-center max-w-sm mx-auto mt-10">
        <p className="font-heading text-red-500">{error}</p>
        <button onClick={() => navigate('/children')} className="btn-camp btn-camp-blue mt-4 text-sm">
          Back to Campers
        </button>
      </div>
    )
  }

  const nextAction = status === 'in' ? 'out' : 'in'

  return (
    <div className="page-enter max-w-lg mx-auto space-y-4">
      {showConfetti && <Confetti />}

      {/* Header with QR */}
      <div className="camp-card">
        <h1 className="font-heading text-3xl text-center mb-1">{child.name}</h1>

        <div className="flex justify-center mb-2">
          <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${
            status === 'in' ? 'badge-in' : 'badge-out'
          }`}>
            {status === 'in' ? 'Checked In' : 'Not Checked In'}
          </div>
        </div>

        {/* Live elapsed timer when checked in */}
        {status === 'in' && checkinTime && (
          <div className="text-center mb-3">
            <p className="text-sm font-bold text-gray-500">Time at camp</p>
            <p className="font-heading text-2xl text-green-600">
              <ElapsedTimer since={checkinTime} />
            </p>
          </div>
        )}

        <div className="flex justify-center">
          <div className="bg-white rounded-xl p-4 border-2 border-dashed border-yellow-400 inline-block">
            <QRCodeSVG id="child-qr" value={getQRUrl()} size={180} />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">Scan this QR code to access this camper's profile</p>
        <div className="flex justify-center mt-2">
          <button onClick={printQR} className="btn-camp text-sm !py-2 !px-6">
            Print QR Code
          </button>
        </div>
      </div>

      {/* Check In / Out */}
      <div className="camp-card">
        <h2 className="font-heading text-lg mb-3">
          {nextAction === 'in' ? 'Check In' : 'Check Out'}
        </h2>

        {/* Show elapsed on checkout */}
        {nextAction === 'out' && checkinTime && (
          <div className="bg-green-50 border-2 border-green-200 p-3 rounded-xl mb-3 text-center">
            <p className="text-sm font-bold text-green-700">Currently checked in — Elapsed time:</p>
            <p className="font-heading text-xl text-green-600">
              <ElapsedTimer since={checkinTime} />
            </p>
          </div>
        )}

        <p className="text-sm font-bold text-gray-600 mb-2">
          Select caregiver for {nextAction === 'in' ? 'drop-off' : 'pick-up'} *
        </p>
        <div className="space-y-2 mb-4">
          {(child.caregivers || []).map((cg, i) => (
            <label
              key={i}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                selectedCaregiver === cg.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="caregiver"
                value={cg.name}
                checked={selectedCaregiver === cg.name}
                onChange={(e) => setSelectedCaregiver(e.target.value)}
                className="w-5 h-5 accent-blue-500"
              />
              <div>
                <p className="font-bold text-sm">{cg.name}</p>
                {cg.relationship && <p className="text-xs text-gray-500">{cg.relationship}</p>}
              </div>
            </label>
          ))}
        </div>

        {message && (
          <div className="bg-green-50 border-2 border-green-200 text-green-700 p-3 rounded-xl mb-3 font-bold text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-600 p-3 rounded-xl mb-3 font-semibold text-sm">
            {error}
          </div>
        )}

        <button
          onClick={() => handleCheckin(nextAction)}
          className={`w-full py-4 rounded-2xl text-white text-xl font-heading shadow-lg transition-all hover:scale-[1.02] active:scale-100 ${
            nextAction === 'in'
              ? 'bg-gradient-to-r from-green-500 to-green-600'
              : 'bg-gradient-to-r from-orange-500 to-orange-600'
          }`}
        >
          {nextAction === 'in' ? 'Check In' : 'Check Out'}
        </button>
      </div>

      {/* Child Info */}
      <div className="camp-card">
        <h2 className="font-heading text-lg mb-3 border-b-2 border-yellow-400 pb-1">Camper Information</h2>
        <div className="space-y-3 text-sm">
          {child.age && (
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200 flex items-center justify-between">
              <span className="font-bold text-blue-700">Age</span>
              <span className="font-heading text-2xl text-blue-700">{child.age}</span>
            </div>
          )}

          {child.elopement_risk && (
            <div className="bg-red-100 text-red-800 p-3 rounded-xl border-2 border-red-300 font-bold text-center">
              ELOPEMENT RISK
            </div>
          )}

          {child.allergies && (Array.isArray(child.allergies) ? child.allergies.length > 0 : child.allergies) && (
            <div>
              <p className="font-bold text-gray-600 mb-2">Allergies</p>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(child.allergies) ? child.allergies : [child.allergies]).map((a, i) => (
                  <span key={i} className="bg-red-50 text-red-700 px-3 py-1.5 rounded-full border border-red-200 text-xs font-bold">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {child.behaviors && (Array.isArray(child.behaviors) ? child.behaviors.length > 0 : child.behaviors) && (
            <div>
              <p className="font-bold text-gray-600 mb-2">Behaviors</p>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(child.behaviors) ? child.behaviors : [child.behaviors]).map((b, i) => (
                  <span key={i} className="bg-yellow-50 text-yellow-800 px-3 py-1.5 rounded-full border border-yellow-200 text-xs font-bold">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {child.notes && (
            <div>
              <p className="font-bold text-gray-600 mb-2">Notes</p>
              <p className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-gray-700">{child.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Caregivers */}
      <div className="camp-card">
        <h2 className="font-heading text-lg mb-3 border-b-2 border-yellow-400 pb-1">Authorized Caregivers</h2>
        <ul className="space-y-2">
          {(child.caregivers || []).map((cg, i) => (
            <li key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="font-bold text-sm">{cg.name}</p>
                {cg.relationship && <p className="text-xs text-gray-500">{cg.relationship}</p>}
              </div>
              {cg.phone && <a href={`tel:${cg.phone}`} className="text-blue-500 text-sm font-bold">{cg.phone}</a>}
            </li>
          ))}
        </ul>
      </div>

      {/* Activity history grouped by date - paginated */}
      {allLogs.length > 0 && (() => {
        const grouped = Object.entries(
          allLogs.reduce((groups, log) => {
            const date = log.date || new Date(log.timestamp).toISOString().split('T')[0]
            if (!groups[date]) groups[date] = []
            groups[date].push(log)
            return groups
          }, {})
        ).sort(([a], [b]) => b.localeCompare(a))

        const totalPages = Math.ceil(grouped.length / HISTORY_PER_PAGE)
        const paged = grouped.slice((historyPage - 1) * HISTORY_PER_PAGE, historyPage * HISTORY_PER_PAGE)

        return (
          <div className="camp-card">
            <h2 className="font-heading text-lg mb-3 border-b-2 border-yellow-400 pb-1">Activity History</h2>
            {paged.map(([date, logs]) => (
              <div key={date} className="mb-4 last:mb-0">
                <p className="text-sm font-bold text-gray-600 mb-2 border-b border-gray-200 pb-1">
                  {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <ul className="space-y-2">
                  {logs.map((log) => (
                    <li key={log.id} className="py-2 px-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={log.action === 'in' ? 'badge-in' : 'badge-out'}>
                            {log.action === 'in' ? 'IN' : 'OUT'}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {log.elapsed_display && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                            {log.elapsed_display}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Staff: {log.staff_name} &middot; Caregiver: {log.caregiver}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  disabled={historyPage === 1}
                  className="text-sm font-bold text-blue-500 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                  ← Newer
                </button>
                <span className="text-xs font-bold text-gray-400">
                  Page {historyPage} of {totalPages}
                </span>
                <button
                  onClick={() => setHistoryPage((p) => Math.min(totalPages, p + 1))}
                  disabled={historyPage === totalPages}
                  className="text-sm font-bold text-blue-500 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                  Older →
                </button>
              </div>
            )}
          </div>
        )
      })()}

      {/* Delete child */}
      <div className="camp-card text-center">
        <button
          onClick={async () => {
            if (!confirm(`Are you sure you want to remove ${child.name}? This cannot be undone. Activity logs will be preserved.`)) return
            try {
              await api.delete(`/children/${child.id}`)
              navigate('/children')
            } catch {
              setError('Failed to delete camper')
            }
          }}
          className="btn-camp btn-camp-red text-sm"
        >
          Remove Camper
        </button>
      </div>

      <button onClick={() => navigate('/children')} className="text-white font-bold hover:underline text-sm block text-center w-full pb-4">
        ← Back to Campers
      </button>
    </div>
  )
}

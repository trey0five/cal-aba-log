import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import api from '../api/client'

export default function ChildProfile() {
  const { childId } = useParams()
  const navigate = useNavigate()
  const [child, setChild] = useState(null)
  const [status, setStatus] = useState(null)
  const [selectedCaregiver, setSelectedCaregiver] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [todayLogs, setTodayLogs] = useState([])

  useEffect(() => {
    loadData()
  }, [childId])

  const loadData = async () => {
    try {
      const [childRes, logsRes] = await Promise.all([
        api.get(`/children/${childId}`),
        api.get('/logs'),
      ])
      setChild(childRes.data)
      const childLogs = logsRes.data.filter((l) => l.child_id === childId)
      setTodayLogs(childLogs)
      if (childLogs.length > 0) {
        setStatus(childLogs[childLogs.length - 1].action)
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
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>QR - ${child.name}</title>
      <style>
        body{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;}
        h2{color:#8B6914;font-size:28px;margin-bottom:4px;}
        h3{color:#333;font-size:22px;margin-top:0;}
        p{color:#FF6B35;font-weight:bold;}
      </style>
      </head><body>
      <h2>Camp CAL</h2>
      <h3>${child.name}</h3>
      ${svgData}
      <p style="margin-top:12px;">Scan to Check In / Check Out</p>
      <script>window.print();window.close();</script>
      </body></html>
    `)
    win.document.close()
  }

  const handleCheckin = async (action) => {
    setMessage('')
    setError('')
    if (!selectedCaregiver) {
      setError('You must select a caregiver before checking in or out')
      return
    }
    try {
      await api.post('/checkin', { child_id: child.id, action, caregiver: selectedCaregiver })
      setStatus(action)
      setMessage(`${child.name} checked ${action === 'in' ? 'IN' : 'OUT'} by ${selectedCaregiver}!`)
      setSelectedCaregiver('')
      if (action === 'in') {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 2000)
      }
      loadData()
    } catch (err) {
      setError(err.response?.data?.error || 'Check-in failed')
    }
  }

  const Confetti = () => {
    const colors = ['#FF6B35', '#FFD700', '#4CAF50', '#1a9fff', '#7B1FA2', '#E53935']
    const pieces = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      x: `${(Math.random() - 0.5) * 600}px`,
      y: `${(Math.random() - 0.5) * 600}px`,
      delay: `${Math.random() * 0.3}s`,
      size: Math.random() * 8 + 6,
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
      <div className="camp-card text-center">
        <h1 className="font-heading text-3xl mb-1">{child.name}</h1>
        <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-4 ${
          status === 'in' ? 'badge-in' : 'badge-out'
        }`}>
          {status === 'in' ? 'Checked In' : 'Not Checked In'}
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-dashed border-yellow-400 inline-block">
          <QRCodeSVG id="child-qr" value={getQRUrl()} size={180} />
        </div>
        <p className="text-xs text-gray-400 mt-2">Scan this QR code to access this camper's profile</p>
        <button onClick={printQR} className="btn-camp text-sm !py-2 !px-4 mt-2">
          Print QR Code
        </button>
      </div>

      {/* Check In / Out */}
      <div className="camp-card">
        <h2 className="font-heading text-lg mb-3">
          {nextAction === 'in' ? 'Check In' : 'Check Out'}
        </h2>

        {/* Caregiver selection — required */}
        <p className="text-sm font-bold text-gray-600 mb-2">Select caregiver for {nextAction === 'in' ? 'drop-off' : 'pick-up'} *</p>
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
            <div className="flex justify-between">
              <span className="font-bold text-gray-600">Age</span>
              <span>{child.age}</span>
            </div>
          )}
          {child.allergies && (
            <div>
              <p className="font-bold text-gray-600 mb-1">Allergies</p>
              <p className="bg-red-50 text-red-700 p-2 rounded-lg border border-red-200">{child.allergies}</p>
            </div>
          )}
          {child.behaviors && (
            <div>
              <p className="font-bold text-gray-600 mb-1">Behaviors</p>
              <p className="bg-yellow-50 text-yellow-800 p-2 rounded-lg border border-yellow-200">{child.behaviors}</p>
            </div>
          )}
          {child.elopement_risk && (
            <div className="bg-red-100 text-red-800 p-3 rounded-xl border-2 border-red-300 font-bold text-center">
              ELOPEMENT RISK
            </div>
          )}
          {child.notes && (
            <div>
              <p className="font-bold text-gray-600 mb-1">Notes</p>
              <p className="bg-gray-50 p-2 rounded-lg border border-gray-200">{child.notes}</p>
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

      {/* Today's log for this child */}
      {todayLogs.length > 0 && (
        <div className="camp-card">
          <h2 className="font-heading text-lg mb-3 border-b-2 border-yellow-400 pb-1">Today's Activity</h2>
          <ul className="space-y-2">
            {[...todayLogs].reverse().map((log) => (
              <li key={log.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
                <div>
                  <span className={log.action === 'in' ? 'badge-in' : 'badge-out'}>
                    {log.action === 'in' ? 'IN' : 'OUT'}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">by {log.staff_name}</span>
                  {log.caregiver && <span className="text-sm text-gray-500"> — {log.caregiver}</span>}
                </div>
                <span className="text-xs text-gray-400 font-semibold">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

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

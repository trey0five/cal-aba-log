import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import api from '../api/client'

export default function Scan() {
  const { childId } = useParams()
  const navigate = useNavigate()
  const [child, setChild] = useState(null)
  const [status, setStatus] = useState(null)
  const [message, setMessage] = useState('')
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const html5QrRef = useRef(null)

  useEffect(() => {
    if (childId) loadChild(childId)
  }, [childId])

  const loadChild = async (id) => {
    try {
      const [childrenRes, logsRes] = await Promise.all([
        api.get('/children'),
        api.get('/logs'),
      ])
      const found = childrenRes.data.find((c) => c.id === id)
      if (!found) { setError('Camper not found'); return }
      setChild(found)
      const childLogs = logsRes.data.filter((l) => l.child_id === id)
      if (childLogs.length > 0) {
        setStatus(childLogs[childLogs.length - 1].action)
      } else {
        setStatus(null)
      }
    } catch {
      setError('Failed to load camper info')
    }
  }

  const startScanner = async () => {
    setScanning(true)
    setError('')
    try {
      const html5Qr = new Html5Qrcode('qr-reader')
      html5QrRef.current = html5Qr
      await html5Qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          html5Qr.stop().catch(() => {})
          setScanning(false)
          const match = decodedText.match(/scan\/([a-f0-9]+)/)
          if (match) navigate(`/scan/${match[1]}`)
          else setError('Invalid QR code')
        },
        () => {}
      )
    } catch {
      setError('Could not access camera. Please allow camera permissions.')
      setScanning(false)
    }
  }

  const stopScanner = () => {
    if (html5QrRef.current) {
      html5QrRef.current.stop().catch(() => {})
      setScanning(false)
    }
  }

  const triggerConfetti = () => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 2000)
  }

  const handleCheckin = async (action) => {
    setMessage('')
    setError('')
    try {
      await api.post('/checkin', { child_id: child.id, action })
      setStatus(action)
      setMessage(`${child.name} checked ${action === 'in' ? 'IN' : 'OUT'} successfully!`)
      if (action === 'in') triggerConfetti()
    } catch (err) {
      setError(err.response?.data?.error || 'Check-in failed')
    }
  }

  // Confetti component
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
            style={{
              '--x': p.x,
              '--y': p.y,
              backgroundColor: p.color,
              width: p.size,
              height: p.size,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>
    )
  }

  // Scanner view
  if (!childId) {
    return (
      <div className="page-enter">
        <h1 className="font-heading text-2xl text-white drop-shadow-lg mb-4">📷 Scan QR Code</h1>
        <div className="camp-card">
          <div id="qr-reader" className="mb-4 rounded-xl overflow-hidden" />
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-600 p-3 rounded-xl mb-4 font-semibold text-sm">
              {error}
            </div>
          )}
          {!scanning ? (
            <button onClick={startScanner} className="btn-camp btn-camp-blue w-full text-lg">
              📸 Start Camera Scanner
            </button>
          ) : (
            <button onClick={stopScanner} className="btn-camp btn-camp-red w-full text-lg">
              ⏹️ Stop Scanner
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!child && !error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="camp-card text-center p-8">
          <p className="text-4xl bounce-icon">🏕️</p>
          <p className="mt-2 font-heading text-gray-500">Loading camper...</p>
        </div>
      </div>
    )
  }

  if (error && !child) {
    return (
      <div className="camp-card text-center max-w-sm mx-auto mt-10">
        <p className="text-4xl mb-2">😕</p>
        <p className="font-heading text-red-500">{error}</p>
        <button onClick={() => navigate('/scan')} className="btn-camp btn-camp-blue mt-4 text-sm">
          Try Again
        </button>
      </div>
    )
  }

  const nextAction = status === 'in' ? 'out' : 'in'

  return (
    <div className="page-enter max-w-sm mx-auto text-center">
      {showConfetti && <Confetti />}

      <div className="camp-card">
        <h1 className="font-heading text-3xl mb-1">🧒 {child.name}</h1>
        {child.guardian && <p className="text-gray-500 font-semibold mb-2">👤 Guardian: {child.guardian}</p>}

        <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold mb-6 ${
          status === 'in' ? 'badge-in' : 'badge-out'
        }`}>
          {status === 'in' ? '✅ Currently Checked In' : '⏳ Not Checked In'}
        </div>

        {message && (
          <div className="bg-green-50 border-2 border-green-200 text-green-700 p-4 rounded-xl mb-4 font-bold">
            🎉 {message}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-600 p-3 rounded-xl mb-4 font-semibold text-sm">
            {error}
          </div>
        )}

        <button
          onClick={() => handleCheckin(nextAction)}
          className={`w-full py-5 rounded-2xl text-white text-xl font-heading shadow-lg transition-all hover:scale-[1.02] active:scale-100 ${
            nextAction === 'in'
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
              : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
          }`}
        >
          {nextAction === 'in' ? '✅ Check In' : '👋 Check Out'}
        </button>

        <button onClick={() => navigate('/')} className="mt-4 text-blue-500 font-bold hover:underline text-sm">
          ← Back to Dashboard
        </button>
      </div>
    </div>
  )
}

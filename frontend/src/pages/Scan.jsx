import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import api from '../api/client'

export default function Scan() {
  const { childId } = useParams()
  const navigate = useNavigate()
  const [child, setChild] = useState(null)
  const [status, setStatus] = useState(null) // 'in' or 'out' or null
  const [message, setMessage] = useState('')
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const scannerRef = useRef(null)
  const html5QrRef = useRef(null)

  // If we arrived via QR URL with a childId, load that child
  useEffect(() => {
    if (childId) {
      loadChild(childId)
    }
  }, [childId])

  const loadChild = async (id) => {
    try {
      const [childrenRes, logsRes] = await Promise.all([
        api.get('/children'),
        api.get('/logs'),
      ])
      const found = childrenRes.data.find((c) => c.id === id)
      if (!found) {
        setError('Child not found')
        return
      }
      setChild(found)

      // Determine current status
      const childLogs = logsRes.data.filter((l) => l.child_id === id)
      if (childLogs.length > 0) {
        setStatus(childLogs[childLogs.length - 1].action)
      } else {
        setStatus(null) // not checked in today
      }
    } catch {
      setError('Failed to load child info')
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
          // Extract childId from URL
          const match = decodedText.match(/scan\/([a-f0-9]+)/)
          if (match) {
            navigate(`/scan/${match[1]}`)
          } else {
            setError('Invalid QR code')
          }
        },
        () => {} // ignore scan errors
      )
    } catch (err) {
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

  const handleCheckin = async (action) => {
    setMessage('')
    setError('')
    try {
      const res = await api.post('/checkin', { child_id: child.id, action })
      setStatus(action)
      setMessage(`${child.name} checked ${action === 'in' ? 'IN' : 'OUT'} successfully!`)
    } catch (err) {
      setError(err.response?.data?.error || 'Check-in failed')
    }
  }

  // No childId — show scanner
  if (!childId) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Scan QR Code</h1>
        <div id="qr-reader" ref={scannerRef} className="mb-4" />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {!scanning ? (
          <button onClick={startScanner} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 text-lg">
            Start Camera Scanner
          </button>
        ) : (
          <button onClick={stopScanner} className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 text-lg">
            Stop Scanner
          </button>
        )}
      </div>
    )
  }

  // Loading child
  if (!child && !error) {
    return <p className="text-center mt-10">Loading...</p>
  }

  if (error && !child) {
    return <p className="text-red-500 text-center mt-10">{error}</p>
  }

  const nextAction = status === 'in' ? 'out' : 'in'

  return (
    <div className="max-w-sm mx-auto text-center">
      <h1 className="text-2xl font-bold mb-2">{child.name}</h1>
      {child.guardian && <p className="text-gray-500 mb-1">Guardian: {child.guardian}</p>}

      <div className={`inline-block px-3 py-1 rounded-full text-sm mb-6 ${status === 'in' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
        {status === 'in' ? 'Currently Checked In' : 'Not Checked In'}
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded mb-4">
          {message}
        </div>
      )}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        onClick={() => handleCheckin(nextAction)}
        className={`w-full py-4 rounded-lg text-white text-xl font-semibold ${
          nextAction === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'
        }`}
      >
        Check {nextAction === 'in' ? 'In' : 'Out'}
      </button>

      <button onClick={() => navigate('/')} className="mt-4 text-blue-600 hover:underline text-sm">
        Back to Dashboard
      </button>
    </div>
  )
}

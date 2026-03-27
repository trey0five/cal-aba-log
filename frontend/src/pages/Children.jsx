import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import api from '../api/client'

export default function Children() {
  const [children, setChildren] = useState([])
  const [showQR, setShowQR] = useState(null)

  useEffect(() => {
    api.get('/children').then((res) => setChildren(res.data)).catch(() => {})
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Remove this camper?')) return
    await api.delete(`/children/${id}`)
    setChildren(children.filter((c) => c.id !== id))
  }

  const getQRUrl = (childId) => {
    const base = window.location.origin + window.location.pathname
    return `${base}#/scan/${childId}`
  }

  const printQR = (child) => {
    const svg = document.getElementById(`qr-${child.id}`)
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>QR - ${child.name}</title>
      <style>
        body{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:'Fredoka One',sans-serif;}
        h2{color:#8B6914;font-size:28px;}
        p{color:#FF6B35;font-weight:bold;}
      </style>
      </head><body>
      <h2>🏕️ Camp CAL</h2>
      <h3>${child.name}</h3>
      ${svgData}
      <p style="margin-top:12px;">Scan to Check In/Out</p>
      <script>window.print();window.close();</script>
      </body></html>
    `)
    win.document.close()
  }

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-heading text-2xl text-white drop-shadow-lg">👧 Campers</h1>
        <Link to="/children/add" className="btn-camp btn-camp-green text-sm !py-2 !px-4">
          ➕ Add Camper
        </Link>
      </div>

      {children.length === 0 ? (
        <div className="camp-card text-center py-10">
          <p className="text-5xl mb-3">🎪</p>
          <p className="font-heading text-xl text-gray-500">No campers yet!</p>
          <Link to="/children/add" className="btn-camp btn-camp-green inline-block mt-4 text-sm">
            Add Your First Camper
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {children.map((child) => (
            <li key={child.id} className="camp-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-heading text-lg">🧒 {child.name}</p>
                  {child.guardian && <p className="text-gray-500 text-sm font-semibold">👤 Guardian: {child.guardian}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowQR(showQR === child.id ? null : child.id)}
                    className="btn-camp btn-camp-blue text-xs !py-1.5 !px-3 !text-sm !font-semibold"
                  >
                    📱 QR
                  </button>
                  <button
                    onClick={() => handleDelete(child.id)}
                    className="btn-camp btn-camp-red text-xs !py-1.5 !px-3 !text-sm !font-semibold"
                  >
                    ✕
                  </button>
                </div>
              </div>
              {showQR === child.id && (
                <div className="mt-4 flex flex-col items-center bg-white rounded-xl p-4 border-2 border-dashed border-yellow-400">
                  <QRCodeSVG id={`qr-${child.id}`} value={getQRUrl(child.id)} size={200} />
                  <p className="text-sm text-gray-500 mt-2 font-bold">{child.name}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => printQR(child)}
                      className="btn-camp text-xs !py-1.5 !px-4 !text-sm"
                    >
                      🖨️ Print
                    </button>
                    <Link
                      to={`/scan/${child.id}`}
                      className="btn-camp btn-camp-green text-xs !py-1.5 !px-4 !text-sm"
                    >
                      Check In →
                    </Link>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

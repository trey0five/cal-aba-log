import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import api from '../api/client'

export default function Children() {
  const [children, setChildren] = useState([])
  const [showQR, setShowQR] = useState(null)
  const qrRef = useRef(null)

  useEffect(() => {
    api.get('/children').then((res) => setChildren(res.data)).catch(() => {})
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Remove this child?')) return
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
      <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;}</style>
      </head><body>
      <h2>${child.name}</h2>
      ${svgData}
      <p style="margin-top:12px;color:#666;">Cal ABA Camp</p>
      <script>window.print();window.close();</script>
      </body></html>
    `)
    win.document.close()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Children</h1>
        <Link to="/children/add" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
          + Add Child
        </Link>
      </div>

      {children.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">No children added yet.</p>
      ) : (
        <ul className="space-y-3">
          {children.map((child) => (
            <li key={child.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{child.name}</p>
                  {child.guardian && <p className="text-gray-500 text-sm">Guardian: {child.guardian}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowQR(showQR === child.id ? null : child.id)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    QR Code
                  </button>
                  <button
                    onClick={() => handleDelete(child.id)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
              {showQR === child.id && (
                <div className="mt-4 flex flex-col items-center" ref={qrRef}>
                  <QRCodeSVG id={`qr-${child.id}`} value={getQRUrl(child.id)} size={200} />
                  <p className="text-xs text-gray-400 mt-2 break-all max-w-[200px] text-center">{child.name}</p>
                  <button
                    onClick={() => printQR(child)}
                    className="mt-2 text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
                  >
                    Print QR
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

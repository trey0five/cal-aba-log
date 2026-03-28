import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import api from '../api/client'
import PhotoCropper from '../components/PhotoCropper'

function ElapsedTimer({ since }) {
  const [elapsed, setElapsed] = useState('')
  useEffect(() => {
    const calc = () => {
      const diff = Math.floor((Date.now() - new Date(since).getTime()) / 1000)
      setElapsed(`${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m ${diff % 60}s`)
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
    id: i, color: colors[i % colors.length],
    x: `${(Math.random() - 0.5) * 700}px`, y: `${(Math.random() - 0.5) * 700}px`,
    delay: `${Math.random() * 0.4}s`, size: Math.random() * 10 + 6,
  }))
  return (
    <div className="confetti-burst">
      {pieces.map((p) => (
        <div key={p.id} className="confetti-piece" style={{ '--x': p.x, '--y': p.y, backgroundColor: p.color, width: p.size, height: p.size, borderRadius: Math.random() > 0.5 ? '50%' : '2px', animationDelay: p.delay }} />
      ))}
    </div>
  )
}

const COMM_OPTIONS = [
  { key: 'verbal', label: 'Verbal Speech' },
  { key: 'aac', label: 'AAC Device' },
  { key: 'pecs', label: 'PECS/Visuals' },
  { key: 'sign', label: 'Sign Language' },
  { key: 'gestures', label: 'Gestures/Pointing' },
  { key: 'vocalizations', label: 'Vocalizations' },
]

const DIET_PRESETS = ['Gluten-Free', 'Casein-Free', 'Dye-Free', 'Sugar-Free', 'Vegan']

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

function TagList({ items, color = 'gray' }) {
  const arr = Array.isArray(items) ? items : (items ? [items] : [])
  if (arr.length === 0) return null
  const styles = {
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  }
  return (
    <div className="flex flex-wrap gap-2">
      {arr.map((item, i) => (
        <span key={i} className={`px-3 py-1.5 rounded-full border text-xs font-bold ${styles[color]}`}>{item}</span>
      ))}
    </div>
  )
}

function DynamicListEdit({ items, setItems, placeholder }) {
  const add = () => setItems([...items, ''])
  const remove = (i) => { if (items.length > 1) setItems(items.filter((_, idx) => idx !== i)) }
  const update = (i, val) => { const u = [...items]; u[i] = val; setItems(u) }
  return (
    <>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 mb-2">
          <input type="text" value={item} onChange={(e) => update(i, e.target.value)} className="camp-input !py-2" placeholder={placeholder} />
          {items.length > 1 && <button type="button" onClick={() => remove(i)} className="text-red-500 font-bold text-lg px-2">✕</button>}
        </div>
      ))}
      <button type="button" onClick={add} className="w-full py-1.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold text-xs hover:border-blue-400 hover:text-blue-500 transition-all">+ Add</button>
    </>
  )
}

export default function ChildProfile() {
  const { childId } = useParams()
  const navigate = useNavigate()
  const [child, setChild] = useState(null)
  const [status, setStatus] = useState(null)
  const [checkinTime, setCheckinTime] = useState(null)
  const [selectedCaregiver, setSelectedCaregiver] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [todayLogs, setTodayLogs] = useState([])
  const [allLogs, setAllLogs] = useState([])
  const [historyPage, setHistoryPage] = useState(1)
  const HISTORY_PER_PAGE = 5

  // Edit mode
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [photoUrl, setPhotoUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [cropSrc, setCropSrc] = useState(null)

  useEffect(() => { loadData() }, [childId])

  const loadPhoto = async () => {
    try {
      const res = await api.get(`/children/${childId}/photo`)
      setPhotoUrl(res.data.url)
    } catch { setPhotoUrl(null) }
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCropSrc(reader.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleCropDone = async (base64) => {
    setCropSrc(null)
    setUploading(true)
    try {
      await api.post(`/children/${childId}/photo`, { image: base64, content_type: 'image/jpeg' })
      await loadPhoto()
    } catch {
      setError('Failed to upload photo')
    }
    setUploading(false)
  }

  const handleRemovePhoto = async () => {
    if (!confirm('Remove profile photo?')) return
    try {
      await api.post(`/children/${childId}/photo`, { remove: true })
      setPhotoUrl(null)
    } catch {
      setError('Failed to remove photo')
    }
  }

  const loadData = async () => {
    try {
      const [childRes, logsRes, allLogsRes] = await Promise.all([
        api.get(`/children/${childId}`), api.get('/logs'), api.get(`/children/${childId}/logs`),
      ])
      setChild(childRes.data)
      if (childRes.data.photo_key) loadPhoto()
      setAllLogs(allLogsRes.data)
      const childLogs = logsRes.data.filter((l) => l.child_id === childId)
      setTodayLogs(childLogs)
      if (childLogs.length > 0) {
        const last = childLogs[childLogs.length - 1]
        setStatus(last.action)
        setCheckinTime(last.action === 'in' ? last.timestamp : null)
      } else {
        setStatus(null)
        setCheckinTime(null)
      }
    } catch { setError('Could not load camper information') }
  }

  const startEdit = () => {
    const nameParts = (child.name || '').split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Separate preset vs custom diet restrictions
    const presets = (child.diet_restrictions || []).filter((d) => DIET_PRESETS.includes(d))
    const custom = (child.diet_restrictions || []).filter((d) => !DIET_PRESETS.includes(d))

    setEditData({
      firstName, lastName,
      age: child.age || '',
      allergies: (child.allergies?.length ? child.allergies : ['']),
      behaviors: (child.behaviors?.length ? child.behaviors : ['']),
      elopement_risk: child.elopement_risk || false,
      one_to_one: child.one_to_one || false,
      pica: child.pica || false,
      epi_pen: child.epi_pen || false,
      communication_styles: child.communication_styles || [],
      reinforcers: (child.reinforcers?.length ? child.reinforcers : ['']),
      dislikes: (child.dislikes?.length ? child.dislikes : ['']),
      diet_presets: presets,
      diet_custom: (custom.length ? custom : ['']),
      toileting_help: child.toileting_help || false,
      pictures_allowed: child.pictures_allowed !== false,
      notes: child.notes || '',
      caregivers: (child.caregivers || []).map((cg) => {
        const parts = (cg.name || '').split(' ')
        return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '', relationship: cg.relationship || '', phone: cg.phone || '' }
      }),
    })
    if (editData.caregivers?.length === 0) editData.caregivers = [{ firstName: '', lastName: '', relationship: '', phone: '' }]
    setEditing(true)
  }

  const saveEdit = async () => {
    const d = editData
    const validCaregivers = d.caregivers
      .filter((c) => c.firstName.trim())
      .map((c) => ({ name: `${c.firstName.trim()} ${c.lastName.trim()}`.trim(), relationship: c.relationship, phone: c.phone }))

    if (validCaregivers.length === 0) {
      setError('At least one caregiver is required')
      return
    }

    const allDiet = [...d.diet_presets, ...d.diet_custom.filter((x) => x.trim())]

    try {
      const res = await api.put(`/children/${childId}`, {
        name: `${d.firstName.trim()} ${d.lastName.trim()}`.trim(),
        age: d.age,
        allergies: d.allergies.filter((a) => a.trim()),
        behaviors: d.behaviors.filter((b) => b.trim()),
        elopement_risk: d.elopement_risk,
        one_to_one: d.one_to_one,
        pica: d.pica,
        epi_pen: d.epi_pen,
        communication_styles: d.communication_styles,
        reinforcers: d.reinforcers.filter((r) => r.trim()),
        dislikes: d.dislikes.filter((x) => x.trim()),
        diet_restrictions: allDiet,
        toileting_help: d.toileting_help,
        pictures_allowed: d.pictures_allowed,
        notes: d.notes,
        caregivers: validCaregivers,
      })
      setChild(res.data)
      setEditing(false)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save')
    }
  }

  const updateEdit = (field, value) => setEditData((prev) => ({ ...prev, [field]: value }))
  const toggleEditComm = (key) => updateEdit('communication_styles', editData.communication_styles.includes(key) ? editData.communication_styles.filter((k) => k !== key) : [...editData.communication_styles, key])
  const toggleEditDiet = (d) => updateEdit('diet_presets', editData.diet_presets.includes(d) ? editData.diet_presets.filter((x) => x !== d) : [...editData.diet_presets, d])
  const updateEditCaregiver = (i, field, value) => {
    const u = [...editData.caregivers]
    if (field === 'phone') value = formatPhone(value)
    u[i][field] = value
    updateEdit('caregivers', u)
  }
  const addEditCaregiver = () => updateEdit('caregivers', [...editData.caregivers, { firstName: '', lastName: '', relationship: '', phone: '' }])
  const removeEditCaregiver = (i) => { if (editData.caregivers.length > 1) updateEdit('caregivers', editData.caregivers.filter((_, idx) => idx !== i)) }

  const getQRUrl = () => `${window.location.origin}${window.location.pathname}#/child/${childId}`
  const printQR = () => {
    const svg = document.getElementById('child-qr')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const w = window.open('', '_blank')
    w.document.write(`<html><head><title>QR - ${child.name}</title><style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;margin:0}h2{color:#8B6914;font-size:28px;margin-bottom:4px}h3{color:#333;font-size:22px;margin-top:0}p{color:#FF6B35;font-weight:bold}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><h2>Camp CAL</h2><h3>${child.name}</h3>${svgData}<p style="margin-top:12px">Scan to Check In / Check Out</p></body></html>`)
    w.document.close()
    w.onload = () => w.print()
  }

  const triggerConfetti = () => { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 2000) }

  const handleCheckin = async (action) => {
    setMessage(''); setError('')
    if (!selectedCaregiver) { setError('You must select a caregiver'); return }
    try {
      const res = await api.post('/checkin', { child_id: child.id, action, caregiver: selectedCaregiver })
      setStatus(action)
      if (action === 'in') { setMessage(`${child.name} checked IN by ${selectedCaregiver}!`); setCheckinTime(res.data.timestamp) }
      else { setMessage(`${child.name} checked OUT by ${selectedCaregiver}! Time at camp: ${res.data.elapsed_display || ''}`); setCheckinTime(null) }
      setSelectedCaregiver('')
      triggerConfetti()
      loadData()
    } catch (err) { setError(err.response?.data?.error || 'Failed') }
  }

  if (!child && !error) return <div className="flex items-center justify-center min-h-[60vh]"><div className="camp-card text-center p-8"><p className="font-heading text-gray-500">Loading camper...</p></div></div>
  if (error && !child) return <div className="camp-card text-center max-w-sm mx-auto mt-10"><p className="font-heading text-red-500">{error}</p><button onClick={() => navigate('/children')} className="btn-camp btn-camp-blue mt-4 text-sm">Back to Campers</button></div>

  const nextAction = status === 'in' ? 'out' : 'in'
  const hasArr = (v) => v && (Array.isArray(v) ? v.length > 0 : true)

  return (
    <div className="page-enter max-w-lg mx-auto space-y-4">
      {showConfetti && <Confetti />}
      {cropSrc && <PhotoCropper imageSrc={cropSrc} onCropDone={handleCropDone} onCancel={() => setCropSrc(null)} />}

      <div className="page-header flex items-center justify-between">
        <h1 className="font-heading text-2xl text-white drop-shadow-lg">{child.name}</h1>
        <button onClick={() => navigate('/children')} className="back-btn">← Back</button>
      </div>

      {/* Status + QR */}
      <div className="camp-card">
        {/* Profile photo */}
        <div className="flex flex-col items-center mb-3">
          {photoUrl ? (
            <img src={photoUrl} alt={child.name} className="w-24 h-24 rounded-full object-cover border-4 border-yellow-400 shadow-lg mb-2" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-yellow-400 shadow-lg mb-2">
              <span className="text-3xl text-gray-400">👤</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-blue-500 hover:text-blue-700 cursor-pointer">
              {uploading ? 'Uploading...' : (photoUrl ? 'Change Photo' : 'Add Photo')}
              <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" disabled={uploading} />
            </label>
            {photoUrl && (
              <button onClick={handleRemovePhoto} className="text-xs font-bold text-red-400 hover:text-red-600">
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-center mb-2">
          <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${status === 'in' ? 'badge-in' : 'badge-out'}`}>
            {status === 'in' ? 'Checked In' : 'Not Checked In'}
          </div>
        </div>
        {status === 'in' && checkinTime && (
          <div className="text-center mb-3">
            <p className="text-sm font-bold text-gray-500">Time at camp</p>
            <p className="font-heading text-2xl text-green-600"><ElapsedTimer since={checkinTime} /></p>
          </div>
        )}
        <div className="flex justify-center">
          <div className="bg-white rounded-xl p-4 border-2 border-dashed border-yellow-400 inline-block">
            <QRCodeSVG id="child-qr" value={getQRUrl()} size={180} />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">Scan this QR code to access this camper's profile</p>
        <div className="flex justify-center mt-2">
          <button onClick={printQR} className="btn-camp text-sm !py-2 !px-6">Print QR Code</button>
        </div>
      </div>

      {/* Check In / Out */}
      <div className="camp-card">
        <h2 className="font-heading text-lg mb-3">{nextAction === 'in' ? 'Check In' : 'Check Out'}</h2>
        {nextAction === 'out' && checkinTime && (
          <div className="bg-green-50 border-2 border-green-200 p-3 rounded-xl mb-3 text-center">
            <p className="text-sm font-bold text-green-700">Currently checked in — Elapsed:</p>
            <p className="font-heading text-xl text-green-600"><ElapsedTimer since={checkinTime} /></p>
          </div>
        )}
        <p className="text-sm font-bold text-gray-600 mb-2">Select caregiver for {nextAction === 'in' ? 'drop-off' : 'pick-up'} *</p>
        <div className="space-y-2 mb-4">
          {(child.caregivers || []).map((cg, i) => (
            <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedCaregiver === cg.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="caregiver" value={cg.name} checked={selectedCaregiver === cg.name} onChange={(e) => setSelectedCaregiver(e.target.value)} className="w-5 h-5 accent-blue-500" />
              <div>
                <p className="font-bold text-sm">{cg.name}</p>
                {cg.relationship && <p className="text-xs text-gray-500">{cg.relationship}</p>}
              </div>
            </label>
          ))}
        </div>
        {message && <div className="bg-green-50 border-2 border-green-200 text-green-700 p-3 rounded-xl mb-3 font-bold text-sm">{message}</div>}
        {error && <div className="bg-red-50 border-2 border-red-200 text-red-600 p-3 rounded-xl mb-3 font-semibold text-sm">{error}</div>}
        <button onClick={() => handleCheckin(nextAction)} className={`w-full py-4 rounded-2xl text-white text-xl font-heading shadow-lg transition-all hover:scale-[1.02] active:scale-100 ${nextAction === 'in' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'}`}>
          {nextAction === 'in' ? 'Check In' : 'Check Out'}
        </button>
      </div>

      {/* ═══════════ EDIT MODE ═══════════ */}
      {editing ? (
        <div className="camp-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg">Edit Camper</h2>
            <button onClick={() => setEditing(false)} className="text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
          </div>

          {/* Name & Age */}
          <div className="grid grid-cols-2 gap-2">
            <input type="text" value={editData.firstName} onChange={(e) => updateEdit('firstName', e.target.value)} className="camp-input !py-2" placeholder="First name" />
            <input type="text" value={editData.lastName} onChange={(e) => updateEdit('lastName', e.target.value)} className="camp-input !py-2" placeholder="Last name" />
          </div>
          <input type="number" value={editData.age} onChange={(e) => updateEdit('age', e.target.value)} className="camp-input !py-2" placeholder="Age" min="1" max="18" />

          {/* Communication */}
          <div>
            <p className="text-sm font-bold text-gray-600 mb-2">Communication Style</p>
            <div className="flex flex-wrap gap-2">
              {COMM_OPTIONS.map((opt) => (
                <button key={opt.key} type="button" onClick={() => toggleEditComm(opt.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${editData.communication_styles.includes(opt.key) ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-300'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Safety alerts */}
          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-600">Safety Alerts</p>
            {[
              { key: 'elopement_risk', label: 'Elopement Risk' },
              { key: 'one_to_one', label: '1:1 Supervision Needed' },
              { key: 'pica', label: 'PICA' },
              { key: 'epi_pen', label: 'Epi-Pen Required' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 bg-red-50 p-2 rounded-xl border border-red-200 cursor-pointer">
                <input type="checkbox" checked={editData[key] || false} onChange={(e) => updateEdit(key, e.target.checked)} className="w-5 h-5 accent-red-500" />
                <span className="text-sm font-bold text-red-700">{label}</span>
              </label>
            ))}
          </div>

          {/* Allergies */}
          <div>
            <p className="text-sm font-bold text-gray-600 mb-1">Allergies</p>
            <DynamicListEdit items={editData.allergies} setItems={(v) => updateEdit('allergies', v)} placeholder="Allergy" />
          </div>

          {/* Behaviors */}
          <div>
            <p className="text-sm font-bold text-gray-600 mb-1">Behaviors</p>
            <DynamicListEdit items={editData.behaviors} setItems={(v) => updateEdit('behaviors', v)} placeholder="Behavior" />
          </div>

          {/* Reinforcers & Dislikes */}
          <div>
            <p className="text-sm font-bold text-gray-600 mb-1">Reinforcers</p>
            <DynamicListEdit items={editData.reinforcers} setItems={(v) => updateEdit('reinforcers', v)} placeholder="Reinforcer" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-600 mb-1">Dislikes / Aversions</p>
            <DynamicListEdit items={editData.dislikes} setItems={(v) => updateEdit('dislikes', v)} placeholder="Dislike" />
          </div>

          {/* Diet */}
          <div>
            <p className="text-sm font-bold text-gray-600 mb-2">Diet Restrictions</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {DIET_PRESETS.map((d) => (
                <button key={d} type="button" onClick={() => toggleEditDiet(d)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${editData.diet_presets.includes(d) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-300'}`}>
                  {d}
                </button>
              ))}
            </div>
            <DynamicListEdit items={editData.diet_custom} setItems={(v) => updateEdit('diet_custom', v)} placeholder="Custom restriction" />
          </div>

          {/* Permissions */}
          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-600">Permissions</p>
            <label className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200 cursor-pointer">
              <input type="checkbox" checked={editData.toileting_help} onChange={(e) => updateEdit('toileting_help', e.target.checked)} className="w-5 h-5 accent-blue-500" />
              <span className="text-sm font-bold text-gray-700">Toileting help allowed</span>
            </label>
            <label className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200 cursor-pointer">
              <input type="checkbox" checked={editData.pictures_allowed} onChange={(e) => updateEdit('pictures_allowed', e.target.checked)} className="w-5 h-5 accent-blue-500" />
              <span className="text-sm font-bold text-gray-700">Pictures allowed</span>
            </label>
          </div>

          {/* Notes */}
          <div>
            <p className="text-sm font-bold text-gray-600 mb-1">Notes</p>
            <textarea value={editData.notes} onChange={(e) => updateEdit('notes', e.target.value)} className="camp-input !py-2" rows={2} />
          </div>

          {/* Caregivers */}
          <div>
            <p className="text-sm font-bold text-gray-600 mb-2">Authorized Pickup / Caregivers</p>
            {editData.caregivers.map((cg, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-2 mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500">Caregiver {i + 1}</span>
                  {editData.caregivers.length > 1 && <button type="button" onClick={() => removeEditCaregiver(i)} className="text-red-500 text-xs font-bold">Remove</button>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="First name" value={cg.firstName} onChange={(e) => updateEditCaregiver(i, 'firstName', e.target.value)} className="camp-input !py-2 text-sm" />
                  <input type="text" placeholder="Last name" value={cg.lastName} onChange={(e) => updateEditCaregiver(i, 'lastName', e.target.value)} className="camp-input !py-2 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Relationship" value={cg.relationship} onChange={(e) => updateEditCaregiver(i, 'relationship', e.target.value)} className="camp-input !py-2 text-sm" />
                  <input type="tel" placeholder="(555) 555-5555" value={cg.phone} onChange={(e) => updateEditCaregiver(i, 'phone', e.target.value)} className="camp-input !py-2 text-sm" />
                </div>
              </div>
            ))}
            <button type="button" onClick={addEditCaregiver} className="w-full py-1.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold text-xs hover:border-blue-400 hover:text-blue-500 transition-all">+ Add Caregiver</button>
          </div>

          {error && <div className="bg-red-50 border-2 border-red-200 text-red-600 p-3 rounded-xl font-semibold text-sm">{error}</div>}

          <button onClick={saveEdit} className="btn-camp btn-camp-green w-full">Save Changes</button>
        </div>
      ) : (
        <>
          {/* ═══════════ VIEW MODE ═══════════ */}

          {/* Camper Information */}
          <div className="camp-card">
            <div className="flex items-center justify-between mb-3 border-b-2 border-yellow-400 pb-1">
              <h2 className="font-heading text-lg">Camper Information</h2>
              <button onClick={startEdit} className="text-sm font-bold text-blue-500 hover:text-blue-700">Edit</button>
            </div>
            <div className="space-y-3 text-sm">
              {child.age && <p className="font-bold text-gray-700">Age: {child.age}</p>}

              {/* Safety alerts */}
              {child.elopement_risk && <div className="bg-red-100 text-red-800 p-3 rounded-xl border-2 border-red-300 font-bold text-center">ELOPEMENT RISK</div>}
              {child.one_to_one && <div className="bg-red-100 text-red-800 p-3 rounded-xl border-2 border-red-300 font-bold text-center">1:1 SUPERVISION NEEDED</div>}
              {child.pica && <div className="bg-red-100 text-red-800 p-3 rounded-xl border-2 border-red-300 font-bold text-center">PICA</div>}
              {child.epi_pen && <div className="bg-red-100 text-red-800 p-3 rounded-xl border-2 border-red-300 font-bold text-center">EPI-PEN REQUIRED</div>}

              {/* Communication */}
              {hasArr(child.communication_styles) && (
                <div>
                  <p className="font-bold text-gray-600 mb-2">Communication Style</p>
                  <TagList items={child.communication_styles.map((k) => COMM_OPTIONS.find((o) => o.key === k)?.label || k)} color="blue" />
                </div>
              )}

              {hasArr(child.allergies) && (
                <div>
                  <p className="font-bold text-gray-600 mb-2">Allergies</p>
                  <TagList items={child.allergies} color="red" />
                </div>
              )}

              {hasArr(child.behaviors) && (
                <div>
                  <p className="font-bold text-gray-600 mb-2">Behaviors</p>
                  <TagList items={child.behaviors} color="yellow" />
                </div>
              )}

              {hasArr(child.reinforcers) && (
                <div>
                  <p className="font-bold text-gray-600 mb-2">Reinforcers</p>
                  <TagList items={child.reinforcers} color="green" />
                </div>
              )}

              {hasArr(child.dislikes) && (
                <div>
                  <p className="font-bold text-gray-600 mb-2">Dislikes / Aversions</p>
                  <TagList items={child.dislikes} color="gray" />
                </div>
              )}

              {hasArr(child.diet_restrictions) && (
                <div>
                  <p className="font-bold text-gray-600 mb-2">Diet Restrictions</p>
                  <TagList items={child.diet_restrictions} color="orange" />
                </div>
              )}

              {/* Permissions */}
              <div className="flex flex-wrap gap-3">
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${child.toileting_help ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  Toileting Help: {child.toileting_help ? 'Yes' : 'No'}
                </span>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${child.pictures_allowed !== false ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  Pictures: {child.pictures_allowed !== false ? 'Yes' : 'No'}
                </span>
              </div>

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
            <div className="flex items-center justify-between mb-3 border-b-2 border-yellow-400 pb-1">
              <h2 className="font-heading text-lg">Authorized Pickup / Caregivers</h2>
              <button onClick={startEdit} className="text-sm font-bold text-blue-500 hover:text-blue-700">Edit</button>
            </div>
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
        </>
      )}

      {/* Activity history - paginated */}
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
                          <span className={log.action === 'in' ? 'badge-in' : 'badge-out'}>{log.action === 'in' ? 'IN' : 'OUT'}</span>
                          <span className="text-sm text-gray-500 ml-2">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {log.elapsed_display && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{log.elapsed_display}</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Staff: {log.staff_name} &middot; Caregiver: {log.caregiver}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                <button onClick={() => setHistoryPage((p) => Math.max(1, p - 1))} disabled={historyPage === 1} className="text-sm font-bold text-blue-500 disabled:text-gray-300 disabled:cursor-not-allowed">← Newer</button>
                <span className="text-xs font-bold text-gray-400">Page {historyPage} of {totalPages}</span>
                <button onClick={() => setHistoryPage((p) => Math.min(totalPages, p + 1))} disabled={historyPage === totalPages} className="text-sm font-bold text-blue-500 disabled:text-gray-300 disabled:cursor-not-allowed">Older →</button>
              </div>
            )}
          </div>
        )
      })()}

      {/* Delete child */}
      {!editing && (
        <div className="camp-card text-center">
          <button onClick={async () => {
            if (!confirm(`Remove ${child.name}? This cannot be undone.`)) return
            try { await api.delete(`/children/${child.id}`); navigate('/children') } catch { setError('Failed to delete') }
          }} className="btn-camp btn-camp-red text-sm">Remove Camper</button>
        </div>
      )}
    </div>
  )
}

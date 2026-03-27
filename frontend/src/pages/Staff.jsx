import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Staff() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [staff, setStaff] = useState([])
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/')
      return
    }
    loadStaff()
  }, [])

  const loadStaff = () => {
    api.get('/staff').then((res) => setStaff(res.data)).catch(() => {})
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await api.post('/staff', { name, pin })
      setSuccess(`🎉 ${name} added to the team!`)
      setName('')
      setPin('')
      loadStaff()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add staff')
    }
  }

  const handleDelete = async (id, staffName) => {
    if (!confirm(`Remove ${staffName} from staff?`)) return
    try {
      await api.delete(`/staff/${id}`)
      loadStaff()
    } catch {
      setError('Failed to remove staff')
    }
  }

  return (
    <div className="page-enter">
      <h1 className="font-heading text-2xl text-white drop-shadow-lg mb-4">👥 Manage Staff</h1>

      <div className="camp-card mb-6">
        <h2 className="font-heading text-lg mb-3">➕ Add Staff Member</h2>
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-600 p-3 rounded-xl mb-3 font-semibold text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-2 border-green-200 text-green-600 p-3 rounded-xl mb-3 font-semibold text-sm">
            {success}
          </div>
        )}
        <form onSubmit={handleAdd} className="space-y-3">
          <input
            type="text"
            placeholder="👋 Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="camp-input"
            required
          />
          <input
            type="password"
            placeholder="🔒 PIN (min 4 digits)"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="camp-input"
            required
            minLength={4}
          />
          <button type="submit" className="btn-camp btn-camp-green w-full">
            ✅ Add to Team
          </button>
        </form>
      </div>

      <ul className="space-y-2">
        {staff.map((s) => (
          <li key={s.id} className="camp-card !p-3 flex items-center justify-between">
            <div>
              <p className="font-heading text-base">🧑‍🏫 {s.name}</p>
              <p className="text-gray-400 text-xs font-bold uppercase">{s.role}</p>
            </div>
            <button
              onClick={() => handleDelete(s.id, s.name)}
              className="btn-camp btn-camp-red text-xs !py-1.5 !px-3 !text-sm !font-semibold"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <button onClick={() => navigate('/')} className="text-white font-bold hover:underline text-sm block text-center w-full mt-4 pb-4">
        ← Back to Home
      </button>
    </div>
  )
}

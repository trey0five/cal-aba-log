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
      <div className="page-header mb-4">
        <h1 className="font-heading text-2xl text-white drop-shadow-lg">Manage Staff</h1>
      </div>

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
            placeholder="Password (min 4 characters)"
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
          <li key={s.id} className="camp-card !p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-lg">👤</span>
              </div>
              <div className="min-w-0">
                <p className="font-heading text-base truncate">{s.name}</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  s.role === 'admin'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {s.role.toUpperCase()}
                </span>
              </div>
            </div>
            {s.role !== 'admin' && (
              <button
                onClick={() => handleDelete(s.id, s.name)}
                className="btn-camp btn-camp-red !text-xs !py-1.5 !px-3 !font-semibold shrink-0"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

    </div>
  )
}

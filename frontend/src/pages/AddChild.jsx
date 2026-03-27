import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function AddChild() {
  const [name, setName] = useState('')
  const [guardian, setGuardian] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/children', { name, guardian, notes })
      navigate('/children')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add camper')
    }
  }

  return (
    <div className="page-enter max-w-sm mx-auto">
      <div className="camp-card">
        <h1 className="font-heading text-2xl text-center mb-6">🎪 Add New Camper</h1>
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-600 p-3 rounded-xl mb-4 font-semibold text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">🧒 Child's Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="camp-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">👤 Guardian Name</label>
            <input
              type="text"
              value={guardian}
              onChange={(e) => setGuardian(e.target.value)}
              className="camp-input"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">📝 Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="camp-input"
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-camp btn-camp-green flex-1">
              ✅ Add Camper
            </button>
            <button type="button" onClick={() => navigate('/children')} className="btn-camp flex-1 !bg-gray-400">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

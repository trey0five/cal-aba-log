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
      setError(err.response?.data?.error || 'Failed to add child')
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add Child</h1>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Child's Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
          <input
            type="text"
            value={guardian}
            onChange={(e) => setGuardian(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">
            Add Child
          </button>
          <button type="button" onClick={() => navigate('/children')} className="flex-1 bg-gray-200 py-2 rounded hover:bg-gray-300">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

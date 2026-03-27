import { useState, useEffect } from 'react'
import api from '../api/client'

export default function Staff() {
  const [staff, setStaff] = useState([])
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
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
      setName('')
      setPin('')
      setSuccess(`${name} added successfully`)
      loadStaff()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add staff')
    }
  }

  const handleDelete = async (id, staffName) => {
    if (!confirm(`Remove ${staffName}?`)) return
    try {
      await api.delete(`/staff/${id}`)
      loadStaff()
    } catch {
      setError('Failed to remove staff')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Staff</h1>

      <form onSubmit={handleAdd} className="bg-white rounded-lg shadow p-4 mb-6 space-y-3">
        <h2 className="font-semibold">Add Staff Member</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="PIN (min 4 digits)"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
          minLength={4}
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Add Staff
        </button>
      </form>

      <ul className="space-y-2">
        {staff.map((s) => (
          <li key={s.id} className="bg-white rounded-lg shadow p-3 flex items-center justify-between">
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="text-gray-400 text-xs">{s.role}</p>
            </div>
            <button onClick={() => handleDelete(s.id, s.name)} className="text-red-500 text-sm hover:underline">
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

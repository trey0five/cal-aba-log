import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function ChangePin() {
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPin !== confirmPin) {
      setError('New passwords do not match')
      return
    }

    try {
      await api.post('/change-pin', { current_pin: currentPin, new_pin: newPin })
      setSuccess('Password changed successfully!')
      setCurrentPin('')
      setNewPin('')
      setConfirmPin('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password')
    }
  }

  return (
    <div className="page-enter max-w-sm mx-auto">
      <div className="page-header flex items-center justify-between mb-4">
        <h1 className="font-heading text-2xl text-white drop-shadow-lg">Change Password</h1>
        <button onClick={() => navigate('/')} className="back-btn">
          ← Back
        </button>
      </div>
      <div className="camp-card">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-600 p-3 rounded-xl mb-4 font-semibold text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-2 border-green-200 text-green-600 p-3 rounded-xl mb-4 font-semibold text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value)}
              className="camp-input"
              required
              minLength={4}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">New Password</label>
            <input
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="camp-input"
              required
              minLength={4}
              placeholder="Letters, numbers, symbols"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              className="camp-input"
              required
              minLength={4}
            />
          </div>
          <div className="pt-2">
            <button type="submit" className="btn-camp btn-camp-green w-full">
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

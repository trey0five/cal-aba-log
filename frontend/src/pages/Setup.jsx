import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Setup() {
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)
  const { setup, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) { navigate('/'); return }
    api.get('/setup').then((res) => {
      if (res.data.setup_complete) navigate('/login')
      else setChecking(false)
    }).catch(() => setChecking(false))
  }, [navigate, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await setup(name, pin)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Setup failed')
    }
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="camp-card text-center p-8">
          <p className="text-xl font-heading bounce-icon">🏕️</p>
          <p className="mt-2 font-semibold text-gray-600">Setting up camp...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="camp-card max-w-sm w-full text-center">
        <div className="flex flex-col items-center mb-6">
          <img
            src={`${import.meta.env.BASE_URL}logo.jpeg`}
            alt="Camp CAL"
            className="h-48 w-48 rounded-full border-4 border-yellow-400 shadow-xl float mb-4"
          />
          <h1 className="font-heading text-3xl rainbow-text">Welcome to Camp CAL!</h1>
          <p className="text-gray-500 font-semibold mt-2">🎪 Create your admin account to get started</p>
        </div>
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-600 p-3 rounded-xl mb-4 font-semibold text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="👋 Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="camp-input"
            required
          />
          <input
            type="password"
            placeholder="🔒 Create PIN (min 4 digits)"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="camp-input"
            required
            minLength={4}
          />
          <button type="submit" className="btn-camp w-full">
            ⛺ Set Up Camp
          </button>
        </form>
      </div>
    </div>
  )
}

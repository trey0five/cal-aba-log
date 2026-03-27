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

  if (checking) return <p className="text-center mt-10">Loading...</p>

  return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="flex flex-col items-center mb-6">
        <img src={`${import.meta.env.BASE_URL}logo.jpeg`} alt="Camp CAL" className="h-24 w-24 rounded-full mb-3" />
        <h1 className="text-2xl font-bold">Welcome to Camp CAL</h1>
        <p className="text-gray-500 text-sm">Create your admin account to get started.</p>
      </div>
      {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="Create PIN (min 4 digits)"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
          minLength={4}
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Create Admin Account
        </button>
      </form>
    </div>
  )
}

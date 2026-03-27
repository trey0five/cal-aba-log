import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Login() {
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/setup').then((res) => {
      if (!res.data.setup_complete) navigate('/setup')
    }).catch(() => {})
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(name, pin)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="camp-card max-w-sm w-full text-center">
        <div className="flex flex-col items-center mb-6">
          <img
            src={`${import.meta.env.BASE_URL}logo.jpeg`}
            alt="Camp CAL"
            className="h-40 w-40 rounded-full border-4 border-yellow-400 shadow-xl float mb-4"
          />
          <h1 className="font-heading text-3xl rainbow-text">Camp CAL</h1>
          <p className="text-gray-500 font-semibold mt-1">Communication &bull; Adaptation &bull; Learning</p>
          <p className="text-sm text-gray-400 mt-1">☀️ Where Fun Meets Clinical Excellence ☀️</p>
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
            placeholder="🔒 PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="camp-input"
            required
          />
          <button type="submit" className="btn-camp btn-camp-green w-full">
            🏕️ Enter Camp
          </button>
        </form>
      </div>
    </div>
  )
}

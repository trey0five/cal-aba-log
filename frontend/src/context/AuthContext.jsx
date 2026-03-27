import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const staff = localStorage.getItem('staff')
    if (token && staff) {
      setUser(JSON.parse(staff))
    }
    setLoading(false)
  }, [])

  const login = async (name, pin) => {
    const res = await api.post('/login', { name, pin })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('staff', JSON.stringify(res.data.staff))
    setUser(res.data.staff)
    return res.data
  }

  const setup = async (name, pin) => {
    const res = await api.post('/setup', { name, pin })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('staff', JSON.stringify(res.data.staff))
    setUser(res.data.staff)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('staff')
    setUser(null)
  }

  if (loading) return null

  return (
    <AuthContext.Provider value={{ user, login, setup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

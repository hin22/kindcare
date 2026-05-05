import axios from 'axios'
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'kindcare_auth'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadFromStorage)

  const login = (data) => {
    // data = { token, email, name, role }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setAuth(data)
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setAuth(null)
  }

  const refreshProfile = async () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const cur = raw ? JSON.parse(raw) : null
      if (!cur?.token) return
      const res = await axios.get('/api/me', {
        headers: { Authorization: `Bearer ${cur.token}` },
      })
      const next = {
        ...cur,
        name: res.data.name,
        phone: res.data.phone ?? '',
        avatarUrl: res.data.avatarUrl ?? '',
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setAuth(next)
    } catch {
      /* ignore */
    }
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authService.getCurrentUser().then((user) => {
      if (user) setAuth(user)
      setLoading(false)
    })
  }, [])

  const login = useCallback(async (email, password) => {
    const user = await authService.login(email, password)
    if (user) setAuth(user)
    return user
  }, [])

  const register = useCallback(async (data) => {
    const user = await authService.register(data)
    if (user) setAuth(user)
    return user
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setAuth(null)
  }, [])

  const value = useMemo(() => ({
    auth,
    user: auth,
    login,
    logout,
    register,
    isAuthenticated: !!auth,
  }), [auth, login, logout, register])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#626979', fontSize: 14 }}>
        Memuat...
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth harus digunakan di dalam AuthProvider')
  return value
}

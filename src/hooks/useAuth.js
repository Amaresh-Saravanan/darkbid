import { useState, useContext, createContext, useEffect } from 'react'
import { login as apiLogin, register as apiRegister, clearToken, getToken } from '../lib/api'

/**
 * Authentication context
 */
const AuthContext = createContext(null)

/**
 * Authentication provider component
 * Wrap your app with this to access auth state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize from localStorage on mount
  useEffect(() => {
    const token = getToken()
    if (token) {
      console.log('[Auth] Token found in localStorage')
      // In a real app, you'd verify the token or fetch user info
      // For now, just mark as authenticated
      setUser({ authenticated: true })
    }
    setLoading(false)
  }, [])

  const register = async (username, password) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiRegister(username, password)
      console.log('[Auth] Registration successful:', response)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiLogin(username, password)
      console.log('[Auth] Login successful:', response)
      setUser({ username, authenticated: true })
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    console.log('[Auth] Logging out')
    setUser(null)
    clearToken()
  }

  const value = {
    user,
    loading,
    error,
    authenticated: !!user,
    register,
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to use authentication
 * Usage: const { user, login, logout, authenticated } = useAuth()
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

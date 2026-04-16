import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'optimiser_auth'

const MOCK_USER = {
  id: 'u_1',
  username: 'srikant',
  displayName: 'Srikant',
  avatar: null,
  karma: 12450,
  memberSince: '2024-01-15',
  bio: 'Building the future of AI tooling.',
  links: { github: 'https://github.com/srikant' }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return !!localStorage.getItem(STORAGE_KEY)
    } catch {
      return false
    }
  })

  // Sync to localStorage on change
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // Storage unavailable
    }
  }, [user])

  const login = useCallback((userData) => {
    const u = userData || MOCK_USER
    setUser(u)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

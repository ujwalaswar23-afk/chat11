import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSocket } from './SocketContext'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { socket } = useSocket?.() || {};

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('chatapp_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('chatapp_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('chatapp_user')
    if (socket) socket.disconnect();
  }

  const value = {
    user,
    login,
    logout,
    loading,
    socket
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

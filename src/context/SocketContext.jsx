import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      // Use same-origin in production (server serves the frontend),
      // and localhost for development unless VITE_SERVER_URL overrides.
      const baseUrl = import.meta.env.VITE_SERVER_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:5000')

      const newSocket = io(baseUrl, {
        withCredentials: true,
        query: {
          userId: user.id,
          phoneNumber: user.phoneNumber
        }
      })

      newSocket.on('connect', () => {
        console.log('Connected to server')
        // Join user when connected
        newSocket.emit('userJoin', user)
      })

      newSocket.on('onlineUsers', (users) => {
        setOnlineUsers(users)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [user])

  const value = {
    socket,
    onlineUsers
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useSelector } from 'react-redux'
import { getAccessToken } from '@/services/apiClient'

const SocketContext = createContext(null)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export function SocketProvider({ children }) {
  const status = useSelector((s) => s.auth.status)
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated') return undefined

    const socket = io(SOCKET_URL, {
      auth: { token: getAccessToken() },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('connect_error', () => setConnected(false))

    return () => {
      socket.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [status])

  const emit = useCallback((event, payload, ack) => {
    if (!socketRef.current) return
    if (ack) socketRef.current.emit(event, payload, ack)
    else socketRef.current.emit(event, payload)
  }, [])

  const on = useCallback((event, cb) => {
    const socket = socketRef.current
    if (!socket) return () => {}
    socket.on(event, cb)
    return () => socket.off(event, cb)
  }, [])

  return (
    <SocketContext.Provider value={{ socket: socketRef, connected, emit, on }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)

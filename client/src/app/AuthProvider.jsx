import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import apiClient, { setAccessToken, getAccessToken } from '@/services/apiClient'
import { setUser, clearAuth } from '@/store/slices/authSlice'
import { baseApi } from '@/services/baseApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const dispatch = useDispatch()
  const [bootstrapped, setBootstrapped] = useState(false)

  const hydrate = useCallback(async () => {
    try {
      // The refresh token lives in an httpOnly cookie set by the API on
      // login — this silently re-establishes a session on page load/refresh
      // without ever putting the refresh token in JS-accessible storage.
      const { data } = await apiClient.post('/auth/refresh-token')
      setAccessToken(data.data.accessToken)
      const me = await apiClient.get('/auth/me')
      dispatch(setUser(me.data.data))
    } catch {
      setAccessToken(null)
      dispatch(clearAuth())
    } finally {
      setBootstrapped(true)
    }
  }, [dispatch])

  useEffect(() => { hydrate() }, [hydrate])

  useEffect(() => {
    const onExpired = () => {
      dispatch(clearAuth())
      dispatch(baseApi.util.resetApiState())
      toast.error('Your session expired — please log in again.')
    }
    window.addEventListener('auth:session-expired', onExpired)
    return () => window.removeEventListener('auth:session-expired', onExpired)
  }, [dispatch])

  const login = useCallback(async (credentials) => {
    const { data } = await apiClient.post('/auth/login', credentials)
    setAccessToken(data.data.accessToken)
    dispatch(setUser(data.data.user))
    return data.data.user
  }, [dispatch])

  const register = useCallback(async (payload) => {
    const { data } = await apiClient.post('/auth/register', payload)
    return data.data
  }, [])

  const logout = useCallback(async () => {
    try { await apiClient.post('/auth/logout') } catch { /* best-effort */ }
    setAccessToken(null)
    dispatch(clearAuth())
    dispatch(baseApi.util.resetApiState())
  }, [dispatch])

  return (
    <AuthContext.Provider value={{ bootstrapped, login, register, logout, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

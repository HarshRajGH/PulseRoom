import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Access token is kept in memory (not localStorage) to reduce XSS exposure;
// it's re-hydrated from the refresh-token cookie on app load via /auth/refresh-token.
let accessToken = null
let refreshPromise = null
const listeners = new Set()

export function setAccessToken(token) {
  accessToken = token
  listeners.forEach((cb) => cb(token))
}

export function getAccessToken() {
  return accessToken
}

export function onAccessTokenChange(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

// On a 401, try exactly one silent refresh (cookie-based) before giving up —
// concurrent requests share the same in-flight refresh call.
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry && !original.url.includes('/auth/')) {
      original._retry = true
      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true })
            .finally(() => { refreshPromise = null })
        }
        const { data } = await refreshPromise
        setAccessToken(data.data.accessToken)
        original.headers.Authorization = `Bearer ${data.data.accessToken}`
        return apiClient(original)
      } catch {
        setAccessToken(null)
        window.dispatchEvent(new CustomEvent('auth:session-expired'))
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient

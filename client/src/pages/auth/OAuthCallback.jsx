import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import apiClient, { setAccessToken } from '@/services/apiClient'
import { setUser, clearAuth } from '@/store/slices/authSlice'
import PageLoader from '@/components/ui/PageLoader'

// Landing point for Google OAuth: the API redirects here with the access
// token in the query string (the refresh token was already set as an
// httpOnly cookie server-side, so it never has to touch the URL).
export default function OAuthCallback() {
  const [params] = useSearchParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const accessToken = params.get('accessToken')
    if (!accessToken) {
      dispatch(clearAuth())
      navigate('/login')
      return
    }
    setAccessToken(accessToken)
    apiClient.get('/auth/me')
      .then(({ data }) => {
        dispatch(setUser(data.data))
        toast.success('Signed in with Google')
        navigate('/app')
      })
      .catch(() => {
        dispatch(clearAuth())
        navigate('/login')
      })
  }, [params, dispatch, navigate])

  return <PageLoader />
}

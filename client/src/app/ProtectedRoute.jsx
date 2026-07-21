import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageLoader from '@/components/ui/PageLoader'

// Gates the /app shell behind authentication. While the silent-refresh
// hydration in AuthProvider is still resolving, render a loader instead of
// bouncing an already-logged-in user to /login on every hard refresh.
export default function ProtectedRoute() {
  const status = useSelector((s) => s.auth.status)
  const location = useLocation()

  if (status === 'loading') return <PageLoader />
  if (status === 'guest') return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}

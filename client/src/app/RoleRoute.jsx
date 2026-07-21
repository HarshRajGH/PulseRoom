import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function RoleRoute({ allow = [] }) {
  const user = useSelector((s) => s.auth.user)
  if (!user || !allow.includes(user.role)) return <Navigate to="/app" replace />
  return <Outlet />
}

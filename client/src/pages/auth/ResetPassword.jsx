import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Lock } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useResetPasswordMutation } from '@/services/auth.api'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const [token] = useState(params.get('token') || '')
  const [password, setPassword] = useState('')
  const [resetPassword, { isLoading }] = useResetPasswordMutation()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await resetPassword({ token, password }).unwrap()
      toast.success('Password reset — please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Reset link is invalid or expired.')
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1.5">Set a new password</h1>
      <p className="text-muted text-sm mb-8">Choose a new password for your account.</p>
      <form onSubmit={submit} className="space-y-4">
        <Input label="New password" type="password" icon={Lock} placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" className="w-full" disabled={isLoading || !token}>{isLoading ? 'Resetting…' : 'Reset password'}</Button>
      </form>
      {!token && <p className="text-xs text-ember-2 mt-4">No reset token found in the URL — use the link from your email.</p>}
    </div>
  )
}

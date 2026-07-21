import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import { useVerifyEmailMutation } from '@/services/auth.api'

// SyncWave verifies email via a tokenized link (see the email templates in
// the backend's email.service.js), not a numeric code — this screen accepts
// the token either from the URL (?token=...) or pasted in manually.
export default function OtpVerification() {
  const [params] = useSearchParams()
  const [token, setToken] = useState(params.get('token') || '')
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation()
  const navigate = useNavigate()

  const verify = async () => {
    try {
      await verifyEmail({ token }).unwrap()
      toast.success('Email verified!')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Verification failed — the link may have expired.')
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1.5">Verify your email</h1>
      <p className="text-muted text-sm mb-8">Paste the verification token from your email, or follow the link directly.</p>
      <input
        value={token} onChange={(e) => setToken(e.target.value)} placeholder="Verification token"
        className="w-full rounded-xl bg-surface-2 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-current/60 mb-6 font-mono"
      />
      <Button onClick={verify} className="w-full" disabled={isLoading || !token}>
        {isLoading ? 'Verifying…' : 'Verify email'}
      </Button>
    </div>
  )
}

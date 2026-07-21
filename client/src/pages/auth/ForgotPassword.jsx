import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Mail } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useForgotPasswordMutation } from '@/services/auth.api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await forgotPassword({ email }).unwrap()
      setSent(true)
      toast.success('Reset link sent to your email')
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1.5">Reset your password</h1>
      <p className="text-muted text-sm mb-8">Enter the email tied to your account and we'll send a reset link.</p>
      {sent ? (
        <div className="card p-5 text-sm text-muted">
          Check your inbox for a reset link. Didn't get it? <button onClick={submit} className="text-current-2 font-semibold hover:underline">Resend</button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Sending…' : 'Send reset link'}</Button>
        </form>
      )}
      <button onClick={() => navigate('/login')} className="text-sm text-muted hover:text-paper mt-6 block mx-auto">← Back to log in</button>
    </div>
  )
}

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Mail, Lock } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAuth } from '@/app/AuthProvider'
import { API_URL } from '@/services/apiClient'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
})

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const err = params.get('error') || params.get('spotifyError')
    if (err) toast.error(err, { id: 'oauth-error' })
  }, [location.search])

  const onSubmit = async (values) => {
    try {
      await login(values)
      toast.success('Welcome back!')
      navigate(location.state?.from?.pathname || '/app')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed — check your credentials.')
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1.5">Welcome back</h1>
      <p className="text-muted text-sm mb-8">Log in to jump back into your rooms.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" icon={Lock} placeholder="••••••••" error={errors.password?.message} {...register('password')} />
        <div className="flex justify-end -mt-1">
          <Link to="/forgot-password" className="text-xs font-semibold text-current-2 hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Logging in…' : 'Log in'}</Button>
      </form>
      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-white/10" /><span className="text-xs text-muted">or</span><div className="h-px flex-1 bg-white/10" />
      </div>
      <div className="flex flex-col gap-2.5">
        <Button variant="ghost" className="w-full" as="a" href={`${API_URL}/auth/google`}>Continue with Google</Button>
        <Button variant="ghost" className="w-full" as="a" href={`${API_URL}/auth/spotify`}>Continue with Spotify</Button>
      </div>
      <p className="text-sm text-muted text-center mt-6">
        New to SyncWave? <Link to="/signup" className="text-current-2 font-semibold hover:underline">Create an account</Link>
      </p>
    </div>
  )
}

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Mail, Lock, User } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAuth } from '@/app/AuthProvider'
import { API_URL } from '@/services/apiClient'

const schema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
})

export default function Signup() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })
  const { register: registerAccount, login } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (values) => {
    try {
      await registerAccount(values)
      toast.success('Account created! Logging you in…')
      await login({ email: values.email, password: values.password })
      navigate('/app')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sign up failed — please try again.')
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1.5">Create your account</h1>
      <p className="text-muted text-sm mb-8">Free forever. Upgrade to host rooms whenever you're ready.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full name" icon={User} placeholder="Jane Doe" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" icon={Lock} placeholder="At least 6 characters" error={errors.password?.message} {...register('password')} />
        <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Creating account…' : 'Create account'}</Button>
      </form>
      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-white/10" /><span className="text-xs text-muted">or</span><div className="h-px flex-1 bg-white/10" />
      </div>
      <div className="flex flex-col gap-2.5">
        <Button variant="ghost" className="w-full" as="a" href={`${API_URL}/auth/google`}>Continue with Google</Button>
        <Button variant="ghost" className="w-full" as="a" href={`${API_URL}/auth/spotify`}>Continue with Spotify</Button>
      </div>
      <p className="text-sm text-muted text-center mt-6">
        Already on SyncWave? <Link to="/login" className="text-current-2 font-semibold hover:underline">Log in</Link>
      </p>
    </div>
  )
}

import { useState } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useUpdateProfileMutation } from '@/services/user.api'

export default function AccountSettings() {
  const user = useSelector((s) => s.auth.user)
  const [form, setForm] = useState({ name: user.name, handle: user.handle || '' })
  const [updateProfile, { isLoading }] = useUpdateProfileMutation()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await updateProfile(form).unwrap()
      toast.success('Account updated')
    } catch (err) {
      toast.error(err.message || 'Update failed')
    }
  }

  return (
    <form onSubmit={submit} className="card p-6 max-w-lg space-y-5">
      <h2 className="font-display font-semibold text-lg">Account details</h2>
      <Input label="Display name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <Input label="Email" type="email" defaultValue={user.email} disabled />
      <Input label="Handle" value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} />
      <Button type="submit" size="sm" disabled={isLoading}>{isLoading ? 'Saving…' : 'Save changes'}</Button>
    </form>
  )
}

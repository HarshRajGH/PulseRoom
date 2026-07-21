import { useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Camera } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useUpdateProfileMutation, useUploadAvatarMutation } from '@/services/user.api'

export default function EditProfile() {
  const user = useSelector((s) => s.auth.user)
  const [form, setForm] = useState({ name: user.name, bio: user.bio || '', handle: user.handle || '' })
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation()
  const [uploadAvatar, { isLoading: uploading }] = useUploadAvatarMutation()
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await updateProfile(form).unwrap()
      toast.success('Profile updated')
      navigate('/app/profile')
    } catch (err) {
      toast.error(err.message || 'Could not update profile')
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('avatar', file)
    try {
      await uploadAvatar(formData).unwrap()
      toast.success('Avatar updated')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-display text-3xl font-bold mb-8">Edit profile</h1>
      <form onSubmit={submit} className="card p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar name={form.name} src={user.avatarUrl} size="lg" />
            {uploading && <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center text-xs text-white">…</div>}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <Button type="button" variant="subtle" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Camera size={14} /> Change photo
          </Button>
        </div>
        <Input label="Display name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Handle" value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} />
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-muted">Bio</span>
          <textarea rows={3} maxLength={280} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full rounded-xl bg-surface-2 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-current/60 resize-none" />
        </label>
        <div className="flex gap-3">
          <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}

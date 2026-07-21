import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Lock, Globe } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import { useCreateRoomMutation } from '@/services/room.api'

const genres = ['Synthwave', 'Lo-fi', 'Drum & Bass', 'Neo Soul', 'Post-Rock', 'Indie Folk']

export default function CreateRoom() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [genre, setGenre] = useState(genres[0])
  const [privacy, setPrivacy] = useState('public')
  const [createRoom, { isLoading }] = useCreateRoomMutation()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      const room = await createRoom({ name: name || 'Untitled Room', description, genre, privacy }).unwrap()
      toast.success(`"${room.name}" is live!`)
      navigate(`/app/rooms/${room._id}`)
    } catch (err) {
      toast.error(err.message || 'Could not create room')
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <p className="heading-eyebrow mb-1">New room</p>
      <h1 className="font-display text-3xl font-bold mb-8">Set the mood, then go live.</h1>
      <form onSubmit={submit} className="card p-6 space-y-5">
        <Input label="Room name" placeholder="Sunday Static" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Description (optional)" placeholder="Lo-fi textures for slow mornings." value={description} onChange={(e) => setDescription(e.target.value)} />
        <div>
          <span className="mb-1.5 block text-xs font-semibold text-muted">Primary genre</span>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <button type="button" key={g} onClick={() => setGenre(g)} className={cn('px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors', genre === g ? 'bg-current text-white' : 'bg-surface-2 text-mist hover:text-paper')}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="mb-1.5 block text-xs font-semibold text-muted">Privacy</span>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setPrivacy('public')} className={cn('flex items-center gap-2 rounded-xl border px-4 py-3 text-sm', privacy === 'public' ? 'border-current bg-current/10 text-current-2' : 'border-white/10 text-mist')}>
              <Globe size={15} /> Public
            </button>
            <button type="button" onClick={() => setPrivacy('private')} className={cn('flex items-center gap-2 rounded-xl border px-4 py-3 text-sm', privacy === 'private' ? 'border-current bg-current/10 text-current-2' : 'border-white/10 text-mist')}>
              <Lock size={15} /> Invite-only
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Going live…' : 'Go live'}</Button>
      </form>
    </div>
  )
}

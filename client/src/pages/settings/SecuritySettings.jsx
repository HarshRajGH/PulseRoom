import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Music } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { useChangePasswordMutation } from '@/services/user.api'
import { useLazyGetSpotifyLinkUrlQuery, useDisconnectSpotifyMutation } from '@/services/spotify.api'
import { useAuth } from '@/app/AuthProvider'

export default function SecuritySettings() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' })
  const [changePassword, { isLoading }] = useChangePasswordMutation()
  const { logout } = useAuth()
  const user = useSelector((s) => s.auth.user)
  const [params] = useSearchParams()
  const [getLinkUrl, { isFetching: linking }] = useLazyGetSpotifyLinkUrlQuery()
  const [disconnectSpotify, { isLoading: disconnecting }] = useDisconnectSpotifyMutation()

  useEffect(() => {
    if (params.get('spotifyLinked') === 'true') toast.success('Spotify connected!')
    if (params.get('spotifyError')) toast.error(`Spotify: ${params.get('spotifyError')}`)
  }, [params])

  const submit = async (e) => {
    e.preventDefault()
    try {
      await changePassword(form).unwrap()
      toast.success('Password updated — please log in again.')
      setForm({ currentPassword: '', newPassword: '' })
      logout()
    } catch (err) {
      toast.error(err.message || 'Could not update password')
    }
  }

  const connectSpotify = async () => {
    try {
      const { url } = await getLinkUrl().unwrap()
      window.location.href = url
    } catch (err) {
      toast.error(err.message || 'Could not start Spotify connection')
    }
  }

  const disconnect = async () => {
    try {
      await disconnectSpotify().unwrap()
      toast.success('Spotify disconnected')
    } catch (err) {
      toast.error(err.message || 'Could not disconnect Spotify')
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="card p-6 max-w-lg space-y-5">
        <h2 className="font-display font-semibold text-lg">Change password</h2>
        <Input label="Current password" type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required />
        <Input label="New password" type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required minLength={6} />
        <Button type="submit" size="sm" disabled={isLoading}>{isLoading ? 'Updating…' : 'Update password'}</Button>
      </form>

      <div className="card p-6 max-w-lg">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-[#1DB954]/15 flex items-center justify-center shrink-0"><Music size={16} className="text-[#1DB954]" /></div>
          <div>
            <h2 className="font-display font-semibold text-sm">Spotify</h2>
            <p className="text-xs text-muted">Connect your Spotify account for a faster login.</p>
          </div>
          {user?.spotifyConnected && <Badge variant="success" className="ml-auto">Connected</Badge>}
        </div>
        <div className="mt-4">
          {user?.spotifyConnected ? (
            <Button size="sm" variant="ghost" onClick={disconnect} disabled={disconnecting}>{disconnecting ? 'Disconnecting…' : 'Disconnect Spotify'}</Button>
          ) : (
            <Button size="sm" onClick={connectSpotify} disabled={linking}>{linking ? 'Redirecting…' : 'Connect Spotify'}</Button>
          )}
        </div>
      </div>

      <div className="card p-6 max-w-lg">
        <h2 className="font-display font-semibold text-sm mb-1">Log out of all devices</h2>
        <p className="text-xs text-muted mb-3">Revokes every active session, including this one.</p>
        <Button size="sm" variant="ghost" onClick={logout}>Log out everywhere</Button>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import apiClient from '@/services/apiClient'
import { setUser } from '@/store/slices/authSlice'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useUpdateProfileMutation } from '@/services/user.api'
import { useLazyGetSpotifyLinkUrlQuery, useDisconnectSpotifyMutation } from '@/services/spotify.api'
import { Music2, CheckCircle, Loader2, Unlink } from 'lucide-react'

export default function AccountSettings() {
  const user = useSelector((s) => s.auth.user)
  const [form, setForm] = useState({ name: user.name, handle: user.handle || '' })
  const [updateProfile, { isLoading }] = useUpdateProfileMutation()
  const [searchParams, setSearchParams] = useSearchParams()

  const dispatch = useDispatch()

  // ── Handle Spotify OAuth callback params ───────────────────────────────────
  useEffect(() => {
    if (searchParams.get('spotifyLinked') === 'true') {
      toast.success('Spotify connected successfully! 🎵')
      setSearchParams({})
      // Refresh /auth/me so Redux has spotifyConnected: true immediately
      apiClient.get('/auth/me').then(({ data }) => {
        dispatch(setUser(data.data))
      }).catch(() => {})
    }
    const spotifyError = searchParams.get('spotifyError')
    if (spotifyError) {
      toast.error(`Spotify connection failed: ${decodeURIComponent(spotifyError)}`)
      setSearchParams({})
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Spotify ────────────────────────────────────────────────────────────────
  const [getSpotifyLink, { isLoading: isLinking }] = useLazyGetSpotifyLinkUrlQuery()
  const [disconnectSpotify, { isLoading: isDisconnecting }] = useDisconnectSpotifyMutation()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await updateProfile(form).unwrap()
      toast.success('Account updated')
    } catch (err) {
      toast.error(err.message || 'Update failed')
    }
  }

  const handleConnectSpotify = async () => {
    try {
      const { data } = await getSpotifyLink()
      if (data?.url) window.location.href = data.url
    } catch {
      toast.error('Could not start Spotify connection')
    }
  }

  const handleDisconnectSpotify = async () => {
    if (!window.confirm('Disconnect your Spotify account? You can reconnect anytime.')) return
    try {
      await disconnectSpotify().unwrap()
      toast.success('Spotify disconnected')
    } catch (err) {
      toast.error(err?.data?.message || 'Could not disconnect Spotify')
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* ── Profile details ──────────────────────────────────────────────── */}
      <form onSubmit={submit} className="card p-6 space-y-5">
        <h2 className="font-display font-semibold text-lg">Account details</h2>
        <Input label="Display name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Email" type="email" defaultValue={user.email} disabled />
        <Input label="Handle" value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} />
        <Button type="submit" size="sm" disabled={isLoading}>{isLoading ? 'Saving…' : 'Save changes'}</Button>
      </form>

      {/* ── Spotify connection card ──────────────────────────────────────── */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          {/* Spotify logo circle */}
          <div className="w-9 h-9 rounded-full bg-[#1DB954]/15 flex items-center justify-center ring-1 ring-[#1DB954]/30">
            <Music2 size={18} className="text-[#1DB954]" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-base">Spotify</h2>
            <p className="text-xs text-muted">Access your liked songs &amp; playlists inside SyncWave</p>
          </div>
        </div>

        {user.spotifyConnected ? (
          /* ── Connected state ──────────────────────────────────────────── */
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={14} className="text-[#1DB954] shrink-0" />
              <span className="text-[#1DB954] font-medium">Spotify connected</span>
            </div>
            <p className="text-xs text-muted">
              Your liked songs and playlists are now available in the{' '}
              <a href="/app/library" className="text-current-2 hover:underline">Library</a> tab.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnectSpotify}
              disabled={isDisconnecting}
              className="text-red-400 hover:text-red-300 border-red-400/20 hover:bg-red-400/10"
            >
              {isDisconnecting
                ? <Loader2 size={13} className="animate-spin mr-1.5" />
                : <Unlink size={13} className="mr-1.5" />}
              Disconnect Spotify
            </Button>
          </div>
        ) : (
          /* ── Not connected state ──────────────────────────────────────── */
          <div className="space-y-3">
            <p className="text-sm text-muted">
              Connect your Spotify account to browse your music library without leaving the app.
            </p>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-1.5">
              <p className="text-xs font-semibold text-paper">What you'll get:</p>
              {['Browse your Spotify liked songs', 'Access all your Spotify playlists', 'Play 30-second previews inside SyncWave', 'Open any track directly on Spotify'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-muted">
                  <CheckCircle size={11} className="text-[#1DB954] shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <Button
              onClick={handleConnectSpotify}
              disabled={isLinking}
              className="bg-[#1DB954] hover:bg-[#17a349] text-black font-bold border-0 w-full sm:w-auto"
            >
              {isLinking
                ? <Loader2 size={14} className="animate-spin mr-1.5" />
                : <Music2 size={14} className="mr-1.5" />}
              Connect Spotify
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

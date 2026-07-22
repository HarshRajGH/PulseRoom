import { useState } from 'react'
import toast from 'react-hot-toast'
import { Music2, Play, Check, X, Loader2, AlertCircle } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { RowSkeletonList } from '@/components/ui/SkeletonGrid'
import Avatar from '@/components/ui/Avatar'
import Pagination from '@/components/ui/Pagination'
import { useGetPendingSongsQuery, useVerifySongMutation } from '@/services/song.api'

function RejectModal({ song, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6 space-y-4">
        <h3 className="font-display font-bold text-lg">Reject "{song.title}"</h3>
        <p className="text-sm text-muted">Please provide a reason. The uploader will see this in their Library.</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Copyrighted material, low quality audio, explicit content without tag…"
          rows={3}
          className="w-full rounded-xl bg-surface-2 border border-white/10 px-4 py-3 text-sm outline-none focus:border-current/60 resize-none"
        />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="ember" size="sm" disabled={!reason.trim() || loading} onClick={() => onConfirm(reason)}>
            {loading ? <Loader2 size={14} className="animate-spin mr-1" /> : <X size={14} className="mr-1" />}
            Reject song
          </Button>
        </div>
      </div>
    </div>
  )
}

function formatDuration(secs) {
  if (!secs) return '–'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function VerificationQueue() {
  const [page, setPage] = useState(1)
  const [playingUrl, setPlayingUrl] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [verifyLoading, setVerifyLoading] = useState(null)

  const { data, isLoading } = useGetPendingSongsQuery({ page, limit: 10 })
  const [verifySong] = useVerifySongMutation()

  const handleVerify = async (id, status, rejectionReason = '') => {
    setVerifyLoading(id)
    try {
      await verifySong({ id, data: { status, rejectionReason } }).unwrap()
      toast.success(status === 'approved' ? '✅ Song approved!' : '❌ Song rejected')
      setRejectTarget(null)
    } catch (err) {
      toast.error(err?.data?.message || 'Action failed')
    } finally {
      setVerifyLoading(null)
    }
  }

  const togglePlay = (url) => {
    setPlayingUrl((prev) => (prev === url ? null : url))
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="heading-eyebrow mb-1">Music Moderation</p>
        <h2 className="font-display text-2xl font-bold">Verification Queue</h2>
        <p className="text-sm text-muted mt-1">Review and approve or reject pending song uploads from users.</p>
      </div>

      {isLoading ? (
        <RowSkeletonList count={5} />
      ) : !data?.results?.length ? (
        <EmptyState icon={Music2} title="Queue is clear" description="No pending songs — you're all caught up!" />
      ) : (
        <div className="space-y-3">
          {data.results.map((song) => {
            const isPlaying = playingUrl === song.audioUrl
            const isProcessing = verifyLoading === song._id
            return (
              <div key={song._id} className="card p-4 space-y-3">
                <div className="flex items-center gap-4">
                  {/* Cover */}
                  <div
                    className="w-14 h-14 rounded-xl shrink-0 bg-cover bg-center flex items-center justify-center"
                    style={{ background: song.coverUrl ? `url(${song.coverUrl}) center/cover` : 'linear-gradient(135deg,#7C5CFF,#0D0B14)' }}
                  >
                    {!song.coverUrl && <Music2 size={20} className="text-white/40" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{song.title}</p>
                    <p className="text-xs text-muted truncate">{song.artist?.name || '–'} · {formatDuration(song.duration)}</p>
                    <p className="text-xs text-muted mt-0.5">Uploaded by <span className="text-paper">{song.uploadedBy?.name || 'Unknown'}</span></p>
                  </div>

                  {/* Badge */}
                  <Badge variant="live" className="shrink-0">pending</Badge>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {song.audioUrl && (
                      <button
                        onClick={() => togglePlay(song.audioUrl)}
                        title="Preview audio"
                        className="w-9 h-9 rounded-full bg-surface-2 hover:bg-current/20 flex items-center justify-center transition-colors"
                      >
                        <Play size={14} className={isPlaying ? 'text-current-2' : 'text-mist'} fill={isPlaying ? 'currentColor' : 'none'} />
                      </button>
                    )}

                    <button
                      onClick={() => handleVerify(song._id, 'approved')}
                      disabled={isProcessing}
                      title="Approve"
                      className="w-9 h-9 rounded-full bg-emerald-500/15 hover:bg-emerald-500/30 flex items-center justify-center transition-colors"
                    >
                      {isProcessing ? <Loader2 size={14} className="animate-spin text-emerald-400" /> : <Check size={14} className="text-emerald-400" />}
                    </button>

                    <button
                      onClick={() => setRejectTarget(song)}
                      disabled={isProcessing}
                      title="Reject"
                      className="w-9 h-9 rounded-full bg-red-500/15 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                    >
                      <X size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Inline audio player */}
                {isPlaying && song.audioUrl && (
                  <audio
                    key={song.audioUrl}
                    src={song.audioUrl}
                    autoPlay
                    controls
                    className="w-full h-8 rounded-lg"
                    onEnded={() => setPlayingUrl(null)}
                  />
                )}
              </div>
            )
          })}

          <Pagination page={data.pagination?.page || 1} totalPages={data.pagination?.totalPages || 1} onChange={setPage} className="pt-2" />
        </div>
      )}

      {rejectTarget && (
        <RejectModal
          song={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={(reason) => handleVerify(rejectTarget._id, 'rejected', reason)}
          loading={verifyLoading === rejectTarget._id}
        />
      )}
    </div>
  )
}

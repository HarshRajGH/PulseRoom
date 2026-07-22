import { useState, useRef } from 'react'
import { Upload, Music, Image, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { useUploadSongMutation } from '@/services/song.api'

const MAX_AUDIO_MB = 15
const MAX_AUDIO_BYTES = MAX_AUDIO_MB * 1024 * 1024
const MAX_COVER_MB = 5
const MAX_COVER_BYTES = MAX_COVER_MB * 1024 * 1024

function FileDropZone({ accept, label, icon: Icon, file, onFile, hint, error }) {
  const inputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) onFile(f)
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer rounded-xl border-2 border-dashed p-4 flex items-center gap-3 transition-colors ${
        error ? 'border-red-500/60 bg-red-500/5' : file ? 'border-emerald-500/60 bg-emerald-500/5' : 'border-white/10 hover:border-current/40 bg-surface-2'
      }`}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${file ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
        {file ? <CheckCircle size={18} className="text-emerald-400" /> : <Icon size={18} className="text-mist" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{file ? file.name : label}</p>
        <p className="text-xs text-muted">{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : hint}</p>
      </div>
      {file && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onFile(null) }}
          className="text-mist hover:text-paper shrink-0"
        >
          <X size={14} />
        </button>
      )}
      {error && <p className="absolute -bottom-5 left-0 text-xs text-red-400">{error}</p>}
    </div>
  )
}

export default function UploadSongModal({ onClose }) {
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [genre, setGenre] = useState('')
  const [audioFile, setAudioFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState({})
  const [progress, setProgress] = useState(0)

  const [uploadSong, { isLoading }] = useUploadSongMutation()

  const validate = () => {
    const e = {}
    if (!title.trim()) e.title = 'Title is required'
    if (!artist.trim()) e.artist = 'Artist name is required'
    if (!audioFile) e.audio = 'An MP3 file is required'
    else if (audioFile.size > MAX_AUDIO_BYTES) e.audio = `File must be under ${MAX_AUDIO_MB}MB`
    else if (!audioFile.type.includes('audio')) e.audio = 'File must be an audio file'
    if (coverFile && coverFile.size > MAX_COVER_BYTES) e.cover = `Cover must be under ${MAX_COVER_MB}MB`
    if (coverFile && !coverFile.type.includes('image')) e.cover = 'Cover must be an image file'
    if (!agreed) e.agreed = 'You must confirm you have the rights to upload this'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const formData = new FormData()
    formData.append('title', title.trim())
    formData.append('artist', artist.trim())
    if (genre) formData.append('genre', genre.trim())
    formData.append('audio', audioFile)
    if (coverFile) formData.append('cover', coverFile)

    // Simulate progress for large file uploads
    const interval = setInterval(() => setProgress((p) => Math.min(p + 5, 85)), 300)

    try {
      await uploadSong(formData).unwrap()
      clearInterval(interval)
      setProgress(100)
      toast.success('🎵 Song uploaded! It will appear in your library once verified by an admin.')
      setTimeout(onClose, 600)
    } catch (err) {
      clearInterval(interval)
      setProgress(0)
      toast.error(err?.data?.message || 'Upload failed. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl">Upload a Song</h2>
              <p className="text-xs text-muted mt-0.5">Submitted songs go to an admin for review before going live.</p>
            </div>
            <button onClick={onClose} className="text-mist hover:text-paper transition-colors">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Song Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midnight Transit"
                className={`w-full rounded-xl bg-surface-2 border px-4 py-2.5 text-sm outline-none transition-colors ${errors.title ? 'border-red-500/60' : 'border-white/10 focus:border-current/60'}`}
              />
              {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
            </div>

            {/* Artist */}
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Artist Name *</label>
              <input
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. Nova Halcyon"
                className={`w-full rounded-xl bg-surface-2 border px-4 py-2.5 text-sm outline-none transition-colors ${errors.artist ? 'border-red-500/60' : 'border-white/10 focus:border-current/60'}`}
              />
              {errors.artist && <p className="text-xs text-red-400 mt-1">{errors.artist}</p>}
            </div>

            {/* Genre */}
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Genre <span className="text-mist">(optional)</span></label>
              <input
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Lo-fi, Synthwave, Pop…"
                className="w-full rounded-xl bg-surface-2 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-current/60"
              />
            </div>

            {/* Audio file */}
            <div className="mt-1">
              <label className="text-xs font-medium text-muted block mb-2">Audio File * <span className="text-mist">(MP3, max {MAX_AUDIO_MB}MB, max 8 min)</span></label>
              <FileDropZone
                accept="audio/*"
                label="Click or drag an MP3 file here"
                icon={Music}
                file={audioFile}
                onFile={setAudioFile}
                hint={`Max ${MAX_AUDIO_MB}MB · MP3, WAV, OGG`}
                error={errors.audio}
              />
            </div>

            {/* Cover image */}
            <div className="mt-5">
              <label className="text-xs font-medium text-muted block mb-2">Cover Art <span className="text-mist">(optional, max {MAX_COVER_MB}MB)</span></label>
              <FileDropZone
                accept="image/*"
                label="Click or drag a cover image here"
                icon={Image}
                file={coverFile}
                onFile={setCoverFile}
                hint={`Max ${MAX_COVER_MB}MB · JPG, PNG, WebP`}
                error={errors.cover}
              />
            </div>

            {/* Rights checkbox */}
            <label className={`flex items-start gap-3 cursor-pointer rounded-xl border p-3 transition-colors ${errors.agreed ? 'border-red-500/40 bg-red-500/5' : 'border-white/10 bg-surface-2'}`}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 accent-purple-500 shrink-0"
              />
              <span className="text-xs text-muted leading-relaxed">
                I confirm I have the rights to upload this content and that it does not violate any copyright laws or the SyncWave community guidelines.
              </span>
            </label>
            {errors.agreed && <p className="text-xs text-red-400 -mt-2">{errors.agreed}</p>}

            {/* Upload progress */}
            {isLoading && progress > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted">
                  <span>Uploading…</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-current-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-1">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>Cancel</Button>
              <Button type="submit" size="sm" disabled={isLoading}>
                {isLoading ? <><Loader2 size={14} className="animate-spin mr-1.5" />Uploading…</> : <><Upload size={14} className="mr-1.5" />Submit for Review</>}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

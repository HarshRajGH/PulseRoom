import { useEffect, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setProgress, togglePlay } from '@/store/slices/playerSlice'

export default function GlobalAudioPlayer() {
  const dispatch = useDispatch()
  const audioRef = useRef(null)
  
  // Track previous state to detect explicit user scrubs
  const lastProgressRef = useRef(0)
  const isInternalUpdateRef = useRef(false)

  const { currentTrack, isPlaying, progress, volume, repeat, activeRoomId } = useSelector((s) => s.player)

  // 1. Initialize Audio Element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new window.Audio()
      // Only set crossOrigin if strictly necessary, but usually required for WebAudio API.
      // We are just using standard HTML5 Audio, so it's safer without it unless CORS is configured on the media server.
      // audioRef.current.crossOrigin = 'anonymous' 
    }
  }, [])

  // 2. Handle Track Changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack?.audioUrl) return

    // Only swap src if the track actually changed
    if (audioRef.current.src !== currentTrack.audioUrl) {
      audioRef.current.src = currentTrack.audioUrl
      audioRef.current.load()
      
      // If we swapped tracks while isPlaying was true, start playing the new track
      if (isPlaying) {
        audioRef.current.play().catch((err) => console.error('Playback failed:', err))
      }
    }
  }, [currentTrack?.audioUrl]) // Don't include isPlaying here to avoid re-triggering play continuously

  // 3. Handle Play/Pause
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return

    if (isPlaying && audioRef.current.paused) {
      audioRef.current.play().catch((err) => console.error('Playback failed:', err))
    } else if (!isPlaying && !audioRef.current.paused) {
      audioRef.current.pause()
    }
  }, [isPlaying, currentTrack])

  // 4. Handle Volume
  useEffect(() => {
    if (audioRef.current) {
      // Map 0-100 to 0.0-1.0
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  // 5. Handle Scrubbing (User dragging the UI slider)
  useEffect(() => {
    if (!audioRef.current || !currentTrack?.duration) return

    // If activeRoomId is present, the socket drives the playback progress via 'music-synced' events
    // However, if we aren't the host, we still need to seek our local audio when Redux is updated by the socket!
    // So whether it's the UI slider or a socket event, if Redux `progress` diverges significantly from our local audio time, we must seek.
    
    // Ignore updates that were dispatched by our own onTimeUpdate event below
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false
      return
    }

    const targetTime = (progress / 100) * currentTrack.duration
    const currentTime = audioRef.current.currentTime

    // If the difference is larger than 1 second, it was a manual scrub or a socket sync
    if (Math.abs(currentTime - targetTime) > 1.0) {
      audioRef.current.currentTime = targetTime
    }
  }, [progress, currentTrack?.duration])

  // 6. Bind Event Listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      if (!currentTrack?.duration) return
      const currentPercentage = (audio.currentTime / currentTrack.duration) * 100
      
      // If activeRoomId is present, let the host's socket drive the progress bar for everyone.
      // We don't dispatch local progress updates to Redux to avoid jitter against the socket updates.
      if (activeRoomId) return

      // Only dispatch if the percentage changed meaningfully to prevent Redux spam
      if (Math.abs(currentPercentage - lastProgressRef.current) > 0.5) {
        lastProgressRef.current = currentPercentage
        isInternalUpdateRef.current = true // Flag that this dispatch came from us
        dispatch(setProgress(currentPercentage))
      }
    }

    const handleEnded = () => {
      if (repeat === 'one') {
        audio.currentTime = 0
        audio.play().catch(() => {})
      } else {
        // Just pause for now. If a queue system is added later, this is where playNext() would go.
        dispatch(togglePlay())
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [dispatch, currentTrack?.duration, repeat, activeRoomId])

  // Component is purely headless (no UI)
  return null
}

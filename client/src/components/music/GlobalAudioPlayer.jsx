import { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setProgress, togglePlay } from '@/store/slices/playerSlice'

// Helper to parse YouTube video IDs
const getYoutubeId = (url) => {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

export default function GlobalAudioPlayer() {
  const dispatch = useDispatch()
  const audioRef = useRef(null)
  const ytPlayerRef = useRef(null)
  
  // Track previous state to detect explicit user scrubs
  const lastProgressRef = useRef(0)
  const isInternalUpdateRef = useRef(false)

  const { currentTrack, isPlaying, progress, volume, repeat, activeRoomId } = useSelector((s) => s.player)
  const [ytReady, setYtReady] = useState(false)

  const isYoutube = currentTrack?.audioUrl && (currentTrack.audioUrl.includes('youtube.com') || currentTrack.audioUrl.includes('youtu.be'))
  const ytVideoId = isYoutube ? getYoutubeId(currentTrack.audioUrl) : null

  // 1. Initialize HTML5 Audio Element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new window.Audio()
    }
  }, [])

  // 2. Load YouTube API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setYtReady(true)
      return
    }

    // Bind callback for API ready
    window.onYouTubeIframeAPIReady = () => {
      setYtReady(true)
    }

    // Load API script if not present
    if (!document.getElementById('youtube-iframe-api')) {
      const tag = document.createElement('script')
      tag.id = 'youtube-iframe-api'
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    }
  }, [])

  // 3. Track ended handler
  const handleTrackEnded = useCallback(() => {
    if (repeat === 'one') {
      if (isYoutube && ytPlayerRef.current?.seekTo) {
        ytPlayerRef.current.seekTo(0, true)
        ytPlayerRef.current.playVideo()
      } else if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => {})
      }
    } else {
      dispatch(togglePlay())
    }
  }, [repeat, isYoutube, dispatch])

  // 4. Initialize & Control YouTube Player
  useEffect(() => {
    if (!ytReady || !ytVideoId) return

    // If player exists, load/cue video
    if (ytPlayerRef.current) {
      try {
        if (typeof ytPlayerRef.current.cueVideoById === 'function') {
          ytPlayerRef.current.cueVideoById(ytVideoId)
          if (isPlaying) {
            ytPlayerRef.current.playVideo()
          }
        }
      } catch (err) {
        console.error('Failed to cue video:', err)
      }
      return
    }

    // Create new player
    try {
      ytPlayerRef.current = new window.YT.Player('youtube-player-iframe', {
        height: '0',
        width: '0',
        videoId: ytVideoId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(volume)
            if (isPlaying) event.target.playVideo()
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              handleTrackEnded()
            }
          }
        }
      })
    } catch (err) {
      console.error('Failed to init YT player:', err)
    }
  }, [ytReady, ytVideoId, handleTrackEnded])

  // 5. Handle standard HTML5 Audio Source / Track Swaps
  useEffect(() => {
    if (!audioRef.current) return

    if (isYoutube) {
      // Pause HTML5 Audio if playing YouTube track
      if (!audioRef.current.paused) {
        audioRef.current.pause()
      }
      return
    }

    if (!currentTrack?.audioUrl) return

    // Only swap src if the track actually changed
    if (audioRef.current.src !== currentTrack.audioUrl) {
      audioRef.current.src = currentTrack.audioUrl
      audioRef.current.load()
      
      // If we swapped tracks while isPlaying was true, start playing the new track
      if (isPlaying) {
        audioRef.current.play().catch((err) => console.error('Playback failed:', err))
      }
    }
  }, [currentTrack?.audioUrl, isYoutube])

  // 6. Handle Play/Pause
  useEffect(() => {
    if (isYoutube) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
        try {
          if (isPlaying) {
            ytPlayerRef.current.playVideo()
          } else {
            ytPlayerRef.current.pauseVideo()
          }
        } catch {}
      }
      return
    }

    // Standard HTML5 play/pause
    if (!audioRef.current || !currentTrack) return
    if (isPlaying && audioRef.current.paused) {
      audioRef.current.play().catch((err) => console.error('Playback failed:', err))
    } else if (!isPlaying && !audioRef.current.paused) {
      audioRef.current.pause()
    }
  }, [isPlaying, currentTrack, isYoutube])

  // 7. Handle Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      try {
        ytPlayerRef.current.setVolume(volume)
      } catch {}
    }
  }, [volume])

  // 8. Handle Scrubbing (User dragging the UI slider)
  useEffect(() => {
    if (!currentTrack?.duration) return

    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false
      return
    }

    const targetTime = (progress / 100) * currentTrack.duration

    if (isYoutube) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
        try {
          const currentTime = ytPlayerRef.current.getCurrentTime()
          if (Math.abs(currentTime - targetTime) > 1.5) {
            ytPlayerRef.current.seekTo(targetTime, true)
          }
        } catch {}
      }
      return
    }

    if (!audioRef.current) return
    const currentTime = audioRef.current.currentTime
    if (Math.abs(currentTime - targetTime) > 1.0) {
      audioRef.current.currentTime = targetTime
    }
  }, [progress, currentTrack?.duration, isYoutube])

  // 9. Bind Event Listeners for HTML5 Audio
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      if (!currentTrack?.duration || isYoutube) return
      const currentPercentage = (audio.currentTime / currentTrack.duration) * 100
      
      if (activeRoomId) return // Room sync drives progress bar

      if (Math.abs(currentPercentage - lastProgressRef.current) > 0.5) {
        lastProgressRef.current = currentPercentage
        isInternalUpdateRef.current = true
        dispatch(setProgress(currentPercentage))
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleTrackEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleTrackEnded)
    }
  }, [dispatch, currentTrack?.duration, handleTrackEnded, activeRoomId, isYoutube])

  // 10. YouTube Playback Time Updates
  useEffect(() => {
    if (!isYoutube || !isPlaying || activeRoomId) return

    const interval = setInterval(() => {
      try {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
          const currentTime = ytPlayerRef.current.getCurrentTime()
          const duration = ytPlayerRef.current.getDuration() || currentTrack?.duration || 1
          const currentPercentage = (currentTime / duration) * 100

          if (Math.abs(currentPercentage - lastProgressRef.current) > 0.5) {
            lastProgressRef.current = currentPercentage
            isInternalUpdateRef.current = true
            dispatch(setProgress(currentPercentage))
          }
        }
      } catch {}
    }, 1000)

    return () => clearInterval(interval)
  }, [isYoutube, isPlaying, currentTrack?.duration, activeRoomId])

  return (
    <div style={{ display: 'none', position: 'absolute', width: 0, height: 0, opacity: 0 }}>
      <div id="youtube-player-iframe"></div>
    </div>
  )
}

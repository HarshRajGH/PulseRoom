import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  volume: 72,
  shuffled: false,
  repeat: 'off', // off | all | one
  activeRoomId: null, // room currently driving playback via socket sync, if any
}

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    playTrack(state, action) {
      state.currentTrack = action.payload
      state.isPlaying = true
      state.progress = 0
    },
    togglePlay(state) {
      state.isPlaying = !state.isPlaying
    },
    setProgress(state, action) {
      state.progress = action.payload
    },
    setVolume(state, action) {
      state.volume = action.payload
    },
    toggleShuffle(state) {
      state.shuffled = !state.shuffled
    },
    cycleRepeat(state) {
      state.repeat = state.repeat === 'off' ? 'all' : state.repeat === 'all' ? 'one' : 'off'
    },
    setActiveRoom(state, action) {
      state.activeRoomId = action.payload
    },
    syncFromRoom(state, action) {
      // Applied when a `music-synced` socket event arrives for the room
      // currently driving playback — keeps listeners' progress bars aligned
      // with the host without a full track re-fetch.
      const { positionSeconds, isPlaying } = action.payload
      if (state.currentTrack?.duration) {
        state.progress = Math.min(100, (positionSeconds / state.currentTrack.duration) * 100)
      }
      state.isPlaying = isPlaying
    },
  },
})

export const {
  playTrack, togglePlay, setProgress, setVolume, toggleShuffle, cycleRepeat,
  setActiveRoom, syncFromRoom,
} = playerSlice.actions
export default playerSlice.reducer

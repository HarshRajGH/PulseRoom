import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  status: 'loading', // loading | authenticated | guest
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload
      state.status = action.payload ? 'authenticated' : 'guest'
    },
    setAuthStatus(state, action) {
      state.status = action.payload
    },
    clearAuth(state) {
      state.user = null
      state.status = 'guest'
    },
  },
})

export const { setUser, setAuthStatus, clearAuth } = authSlice.actions
export default authSlice.reducer

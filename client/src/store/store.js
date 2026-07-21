import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from '@/services/baseApi'
import authReducer from './slices/authSlice'
import playerReducer from './slices/playerSlice'
import uiReducer from './slices/uiSlice'

// All server data now flows through RTK Query (see src/services/*.api.js) —
// only genuinely client-local state lives in plain slices: the current auth
// user + hydration status, local player/transport state (progress, volume),
// and UI chrome state (sidebar, command palette).
export const store = configureStore({
  reducer: {
    auth: authReducer,
    player: playerReducer,
    ui: uiReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefault) => getDefault({ serializableCheck: false }).concat(baseApi.middleware),
})

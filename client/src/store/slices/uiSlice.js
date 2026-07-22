import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  mobileSidebarOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setCommandPalette(state, action) {
      state.commandPaletteOpen = action.payload
    },
    openMobileSidebar(state) {
      state.mobileSidebarOpen = true
    },
    closeMobileSidebar(state) {
      state.mobileSidebarOpen = false
    },
    toggleMobileSidebar(state) {
      state.mobileSidebarOpen = !state.mobileSidebarOpen
    },
  },
})

export const { toggleSidebar, setCommandPalette, openMobileSidebar, closeMobileSidebar, toggleMobileSidebar } = uiSlice.actions
export default uiSlice.reducer

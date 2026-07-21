import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sidebarCollapsed: false,
  commandPaletteOpen: false,
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
  },
})

export const { toggleSidebar, setCommandPalette } = uiSlice.actions
export default uiSlice.reducer

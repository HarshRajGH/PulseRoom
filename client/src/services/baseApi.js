import { createApi } from '@reduxjs/toolkit/query/react'
import apiClient, { getAccessToken } from './apiClient'

// Custom axios-based baseQuery so RTK Query rides on the same axios instance
// (and its 401 → refresh-token interceptor) instead of a second fetch client.
const axiosBaseQuery = () => async ({ url, method = 'get', data, params }) => {
  try {
    const result = await apiClient({ url, method, data, params })
    return { data: result.data.data, meta: result.data }
  } catch (error) {
    return {
      error: {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        errors: error.response?.data?.errors || [],
      },
    }
  }
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    'Me', 'User', 'Song', 'Artist', 'Album', 'Playlist', 'Room', 'Queue',
    'Message', 'Notification', 'Wallet', 'Transaction', 'Tip', 'Subscription',
    'FriendRequest', 'Friend', 'Report', 'Analytics', 'AdminStats', 'AuditLog',
    'Privacy', 'Conversation', 'DirectMessage',
  ],
  // Keep unused data around for 60s so switching tabs doesn't re-fetch instantly.
  keepUnusedDataFor: 60,
  refetchOnFocus: false,
  refetchOnReconnect: true,
  endpoints: () => ({}),
})

export const isAuthed = () => Boolean(getAccessToken())

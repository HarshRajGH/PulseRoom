import { baseApi } from './baseApi'

export const spotifyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Auth / linking ──────────────────────────────────────────────────────
    getSpotifyLinkUrl: builder.query({ query: () => ({ url: '/auth/spotify/link' }) }),
    disconnectSpotify: builder.mutation({
      query: () => ({ url: '/auth/spotify', method: 'delete' }),
      invalidatesTags: ['Me'],
    }),

    // ── Spotify Library ─────────────────────────────────────────────────────
    /** GET /spotify/liked-songs?page=&limit= */
    getSpotifyLikedSongs: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: '/spotify/liked-songs',
        params: { page, limit },
      }),
      providesTags: ['SpotifyLib'],
    }),

    /** GET /spotify/playlists?page=&limit= */
    getSpotifyPlaylists: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: '/spotify/playlists',
        params: { page, limit },
      }),
      providesTags: ['SpotifyLib'],
    }),

    /** GET /spotify/playlists/:playlistId/tracks?page=&limit= */
    getSpotifyPlaylistTracks: builder.query({
      query: ({ playlistId, page = 1, limit = 20 }) => ({
        url: `/spotify/playlists/${playlistId}/tracks`,
        params: { page, limit },
      }),
      providesTags: (r, e, { playlistId }) => [{ type: 'SpotifyLib', id: playlistId }],
    }),

    /** POST /spotify/import */
    importSpotifyTrack: builder.mutation({
      query: (trackData) => ({
        url: '/spotify/import',
        method: 'post',
        data: trackData,
      }),
      invalidatesTags: ['Song', 'SpotifyLib'],
    }),
  }),
})

export const {
  useLazyGetSpotifyLinkUrlQuery,
  useDisconnectSpotifyMutation,
  useGetSpotifyLikedSongsQuery,
  useGetSpotifyPlaylistsQuery,
  useGetSpotifyPlaylistTracksQuery,
  useImportSpotifyTrackMutation,
} = spotifyApi

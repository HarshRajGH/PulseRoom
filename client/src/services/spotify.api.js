import { baseApi } from './baseApi'

export const spotifyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSpotifyLinkUrl: builder.query({ query: () => ({ url: '/auth/spotify/link' }) }),
    disconnectSpotify: builder.mutation({
      query: () => ({ url: '/auth/spotify', method: 'delete' }),
      invalidatesTags: ['Me'],
    }),
  }),
})

export const { useLazyGetSpotifyLinkUrlQuery, useDisconnectSpotifyMutation } = spotifyApi

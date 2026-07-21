import { baseApi } from './baseApi'

export const libraryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listLikedSongs: builder.query({
      query: (params) => ({ url: '/library/liked', params }),
      providesTags: (result) => result?.results
        ? [...result.results.map((s) => ({ type: 'Song', id: s._id })), { type: 'Song', id: 'LIKED_LIST' }]
        : [{ type: 'Song', id: 'LIKED_LIST' }],
    }),
    likeSong: builder.mutation({
      query: (songId) => ({ url: `/library/liked/${songId}`, method: 'post' }),
      invalidatesTags: (r, e, songId) => [{ type: 'Song', id: songId }, { type: 'Song', id: 'LIST' }, { type: 'Song', id: 'LIKED_LIST' }, 'Me'],
    }),
    unlikeSong: builder.mutation({
      query: (songId) => ({ url: `/library/liked/${songId}`, method: 'delete' }),
      invalidatesTags: (r, e, songId) => [{ type: 'Song', id: songId }, { type: 'Song', id: 'LIST' }, { type: 'Song', id: 'LIKED_LIST' }, 'Me'],
    }),
  }),
})

export const { useListLikedSongsQuery, useLikeSongMutation, useUnlikeSongMutation } = libraryApi

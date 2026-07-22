import { baseApi } from './baseApi'

export const songApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listSongs: builder.query({
      query: (params) => ({ url: '/songs', params }),
      providesTags: (result) => result?.results
        ? [...result.results.map((s) => ({ type: 'Song', id: s._id })), { type: 'Song', id: 'LIST' }]
        : [{ type: 'Song', id: 'LIST' }],
    }),
    getPendingSongs: builder.query({
      query: (params) => ({ url: '/songs/pending', params }),
      providesTags: ['PendingSong'],
    }),
    getMySongs: builder.query({
      query: (params) => ({ url: '/songs/mine', params }),
      providesTags: ['MySong'],
    }),
    getSong: builder.query({ query: (id) => ({ url: `/songs/${id}` }), providesTags: (r, e, id) => [{ type: 'Song', id }] }),
    
    uploadSong: builder.mutation({
      query: (formData) => ({ url: '/songs', method: 'post', data: formData }),
      invalidatesTags: ['MySong', { type: 'Song', id: 'LIST' }],
    }),
    verifySong: builder.mutation({
      query: ({ id, data }) => ({ url: `/songs/${id}/verify`, method: 'patch', data }),
      invalidatesTags: ['PendingSong', { type: 'Song', id: 'LIST' }],
    }),
    deleteSong: builder.mutation({
      query: (id) => ({ url: `/songs/${id}`, method: 'delete' }),
      invalidatesTags: ['MySong', 'PendingSong', { type: 'Song', id: 'LIST' }],
    }),
    registerPlay: builder.mutation({ query: (id) => ({ url: `/songs/${id}/play`, method: 'post' }) }),
  }),
})

export const {
  useListSongsQuery, useGetPendingSongsQuery, useGetMySongsQuery, useGetSongQuery,
  useUploadSongMutation, useVerifySongMutation, useDeleteSongMutation, useRegisterPlayMutation
} = songApi

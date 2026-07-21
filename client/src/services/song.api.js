import { baseApi } from './baseApi'

export const songApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listSongs: builder.query({
      query: (params) => ({ url: '/songs', params }),
      providesTags: (result) => result?.results
        ? [...result.results.map((s) => ({ type: 'Song', id: s._id })), { type: 'Song', id: 'LIST' }]
        : [{ type: 'Song', id: 'LIST' }],
    }),
    getSong: builder.query({ query: (id) => ({ url: `/songs/${id}` }), providesTags: (r, e, id) => [{ type: 'Song', id }] }),
    registerPlay: builder.mutation({ query: (id) => ({ url: `/songs/${id}/play`, method: 'post' }) }),
  }),
})

export const { useListSongsQuery, useGetSongQuery, useRegisterPlayMutation } = songApi

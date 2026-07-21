import { baseApi } from './baseApi'

export const artistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listArtists: builder.query({ query: (params) => ({ url: '/artists', params }), providesTags: ['Artist'] }),
    getArtist: builder.query({ query: (id) => ({ url: `/artists/${id}` }) }),
  }),
})

export const { useListArtistsQuery, useGetArtistQuery } = artistApi

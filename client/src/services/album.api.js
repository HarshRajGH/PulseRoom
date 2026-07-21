import { baseApi } from './baseApi'

export const albumApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listAlbums: builder.query({ query: (params) => ({ url: '/albums', params }), providesTags: ['Album'] }),
  }),
})

export const { useListAlbumsQuery } = albumApi

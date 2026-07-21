import { baseApi } from './baseApi'

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    globalSearch: builder.query({ query: (q) => ({ url: '/search', params: { q } }) }),
  }),
})

export const { useGlobalSearchQuery, useLazyGlobalSearchQuery } = searchApi

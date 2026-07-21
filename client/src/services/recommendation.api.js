import { baseApi } from './baseApi'

export const recommendationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    recommendedSongs: builder.query({ query: (limit) => ({ url: '/recommendations/songs', params: { limit } }) }),
    recommendedRooms: builder.query({ query: (limit) => ({ url: '/recommendations/rooms', params: { limit } }) }),
  }),
})

export const { useRecommendedSongsQuery, useRecommendedRoomsQuery } = recommendationApi

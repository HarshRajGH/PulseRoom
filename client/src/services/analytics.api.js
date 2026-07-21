import { baseApi } from './baseApi'

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    myAnalytics: builder.query({ query: (days = 7) => ({ url: '/analytics/me', params: { days } }), providesTags: ['Analytics'] }),
    roomAnalytics: builder.query({ query: ({ roomId, days = 7 }) => ({ url: `/analytics/rooms/${roomId}`, params: { days } }) }),
    platformOverview: builder.query({ query: () => ({ url: '/analytics/platform' }), providesTags: ['Analytics'] }),
  }),
})

export const { useMyAnalyticsQuery, useRoomAnalyticsQuery, usePlatformOverviewQuery } = analyticsApi

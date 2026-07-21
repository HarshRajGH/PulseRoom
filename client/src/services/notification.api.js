import { baseApi } from './baseApi'

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listNotifications: builder.query({ query: (params) => ({ url: '/notifications', params }), providesTags: ['Notification'] }),
    markRead: builder.mutation({ query: (id) => ({ url: `/notifications/${id}/read`, method: 'patch' }), invalidatesTags: ['Notification'] }),
    markAllRead: builder.mutation({ query: () => ({ url: '/notifications/read-all', method: 'patch' }), invalidatesTags: ['Notification'] }),
    deleteNotification: builder.mutation({ query: (id) => ({ url: `/notifications/${id}`, method: 'delete' }), invalidatesTags: ['Notification'] }),
  }),
})

export const { useListNotificationsQuery, useMarkReadMutation, useMarkAllReadMutation, useDeleteNotificationMutation } = notificationApi

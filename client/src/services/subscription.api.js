import { baseApi } from './baseApi'

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPlans: builder.query({ query: () => ({ url: '/subscriptions/plans' }) }),
    getMySubscription: builder.query({ query: () => ({ url: '/subscriptions/me' }), providesTags: ['Subscription'] }),
    subscribe: builder.mutation({ query: (body) => ({ url: '/subscriptions/subscribe', method: 'post', data: body }), invalidatesTags: ['Subscription', 'Me'] }),
    cancelSubscription: builder.mutation({ query: () => ({ url: '/subscriptions/cancel', method: 'post' }), invalidatesTags: ['Subscription', 'Me'] }),
  }),
})

export const { useListPlansQuery, useGetMySubscriptionQuery, useSubscribeMutation, useCancelSubscriptionMutation } = subscriptionApi

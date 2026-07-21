import { baseApi } from './baseApi'

export const friendApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendFriendRequest: builder.mutation({ query: (toUserId) => ({ url: '/friends/requests', method: 'post', data: { toUserId } }), invalidatesTags: ['FriendRequest'] }),
    listIncomingRequests: builder.query({ query: () => ({ url: '/friends/requests' }), providesTags: ['FriendRequest'] }),
    acceptRequest: builder.mutation({ query: (id) => ({ url: `/friends/requests/${id}/accept`, method: 'post' }), invalidatesTags: ['FriendRequest', 'Friend'] }),
    rejectRequest: builder.mutation({ query: (id) => ({ url: `/friends/requests/${id}/reject`, method: 'post' }), invalidatesTags: ['FriendRequest'] }),
    listFriends: builder.query({ query: () => ({ url: '/friends' }), providesTags: ['Friend'] }),
    removeFriend: builder.mutation({ query: (id) => ({ url: `/friends/${id}`, method: 'delete' }), invalidatesTags: ['Friend'] }),
  }),
})

export const {
  useSendFriendRequestMutation, useListIncomingRequestsQuery, useAcceptRequestMutation,
  useRejectRequestMutation, useListFriendsQuery, useRemoveFriendMutation,
} = friendApi

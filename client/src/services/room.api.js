import { baseApi } from './baseApi'

export const roomApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listRooms: builder.query({
      query: (params) => ({ url: '/rooms', params }),
      providesTags: (result) => result?.results
        ? [...result.results.map((r) => ({ type: 'Room', id: r._id })), { type: 'Room', id: 'LIST' }]
        : [{ type: 'Room', id: 'LIST' }],
    }),
    getRoom: builder.query({ query: (id) => ({ url: `/rooms/${id}` }), providesTags: (r, e, id) => [{ type: 'Room', id }] }),
    createRoom: builder.mutation({ query: (body) => ({ url: '/rooms', method: 'post', data: body }), invalidatesTags: [{ type: 'Room', id: 'LIST' }] }),
    updateRoom: builder.mutation({ query: ({ id, ...body }) => ({ url: `/rooms/${id}`, method: 'patch', data: body }), invalidatesTags: (r, e, { id }) => [{ type: 'Room', id }] }),
    endRoom: builder.mutation({ query: (id) => ({ url: `/rooms/${id}/end`, method: 'post' }), invalidatesTags: (r, e, id) => [{ type: 'Room', id }] }),
    joinRoom: builder.mutation({ query: (id) => ({ url: `/rooms/${id}/join`, method: 'post' }), invalidatesTags: (r, e, id) => [{ type: 'Room', id }] }),
    leaveRoom: builder.mutation({ query: (id) => ({ url: `/rooms/${id}/leave`, method: 'post' }), invalidatesTags: (r, e, id) => [{ type: 'Room', id }] }),

    getQueue: builder.query({ query: (roomId) => ({ url: `/rooms/${roomId}/queue` }), providesTags: (r, e, roomId) => [{ type: 'Queue', id: roomId }] }),
    addToQueue: builder.mutation({ query: ({ roomId, songId }) => ({ url: `/rooms/${roomId}/queue`, method: 'post', data: { songId } }), invalidatesTags: (r, e, { roomId }) => [{ type: 'Queue', id: roomId }] }),
    upvoteQueue: builder.mutation({ query: (voteId) => ({ url: `/rooms/queue/${voteId}/upvote`, method: 'post' }) }),
    removeFromQueue: builder.mutation({ query: (voteId) => ({ url: `/rooms/queue/${voteId}`, method: 'delete' }) }),

    getMessages: builder.query({ query: ({ roomId, ...params }) => ({ url: `/rooms/${roomId}/messages`, params }), providesTags: (r, e, { roomId }) => [{ type: 'Message', id: roomId }] }),
    postMessage: builder.mutation({ query: ({ roomId, text }) => ({ url: `/rooms/${roomId}/messages`, method: 'post', data: { text } }) }),
  }),
})

export const {
  useListRoomsQuery, useGetRoomQuery, useCreateRoomMutation, useUpdateRoomMutation,
  useEndRoomMutation, useJoinRoomMutation, useLeaveRoomMutation,
  useGetQueueQuery, useAddToQueueMutation, useUpvoteQueueMutation, useRemoveFromQueueMutation,
  useGetMessagesQuery, usePostMessageMutation,
} = roomApi

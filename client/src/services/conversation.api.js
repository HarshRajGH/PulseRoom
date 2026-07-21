import { baseApi } from './baseApi'

export const conversationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listConversations: builder.query({
      query: (params) => ({ url: '/conversations', params }),
      providesTags: (result) => result?.results
        ? [...result.results.map((c) => ({ type: 'Conversation', id: c._id })), { type: 'Conversation', id: 'LIST' }]
        : [{ type: 'Conversation', id: 'LIST' }],
    }),
    startConversation: builder.mutation({
      query: (userId) => ({ url: '/conversations', method: 'post', data: { userId } }),
      invalidatesTags: [{ type: 'Conversation', id: 'LIST' }],
    }),
    getConversation: builder.query({ query: (id) => ({ url: `/conversations/${id}` }), providesTags: (r, e, id) => [{ type: 'Conversation', id }] }),
    deleteConversation: builder.mutation({
      query: (id) => ({ url: `/conversations/${id}`, method: 'delete' }),
      invalidatesTags: [{ type: 'Conversation', id: 'LIST' }],
    }),
    getDirectMessages: builder.query({
      query: ({ id, ...params }) => ({ url: `/conversations/${id}/messages`, params }),
      providesTags: (r, e, { id }) => [{ type: 'DirectMessage', id }],
    }),
    sendDirectMessage: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/conversations/${id}/messages`, method: 'post', data: body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'DirectMessage', id }, { type: 'Conversation', id: 'LIST' }],
    }),
    uploadDmAttachment: builder.mutation({ query: (formData) => ({ url: '/conversations/attachments', method: 'post', data: formData }) }),
    markThreadRead: builder.mutation({
      query: (id) => ({ url: `/conversations/${id}/read`, method: 'patch' }),
      invalidatesTags: (r, e, id) => [{ type: 'DirectMessage', id }, { type: 'Conversation', id: 'LIST' }],
    }),
    deleteDirectMessage: builder.mutation({
      query: ({ id, messageId }) => ({ url: `/conversations/${id}/messages/${messageId}`, method: 'delete' }),
      invalidatesTags: (r, e, { id }) => [{ type: 'DirectMessage', id }],
    }),
    unreadDmCount: builder.query({ query: () => ({ url: '/conversations/unread-count' }) }),
  }),
})

export const {
  useListConversationsQuery, useStartConversationMutation, useGetConversationQuery, useDeleteConversationMutation,
  useGetDirectMessagesQuery, useSendDirectMessageMutation, useUploadDmAttachmentMutation,
  useMarkThreadReadMutation, useDeleteDirectMessageMutation, useUnreadDmCountQuery,
} = conversationApi

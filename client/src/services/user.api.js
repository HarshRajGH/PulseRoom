import { baseApi } from './baseApi'

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query({ query: (id) => ({ url: `/users/${id}` }), providesTags: (r, e, id) => [{ type: 'User', id }] }),
    updateProfile: builder.mutation({
      query: (body) => ({ url: '/users/me', method: 'patch', data: body }),
      invalidatesTags: ['Me'],
    }),
    changePassword: builder.mutation({ query: (body) => ({ url: '/users/me/password', method: 'patch', data: body }) }),
    uploadAvatar: builder.mutation({
      query: (formData) => ({ url: '/users/me/avatar', method: 'post', data: formData }),
      invalidatesTags: ['Me'],
    }),
    listUsers: builder.query({ query: (params) => ({ url: '/users', params }), providesTags: ['User'] }),
    followUser: builder.mutation({ query: (id) => ({ url: `/users/${id}/follow`, method: 'post' }), invalidatesTags: (r, e, id) => [{ type: 'User', id }, 'Me'] }),
    unfollowUser: builder.mutation({ query: (id) => ({ url: `/users/${id}/follow`, method: 'delete' }), invalidatesTags: (r, e, id) => [{ type: 'User', id }, 'Me'] }),
    blockUserSelf: builder.mutation({ query: (id) => ({ url: `/users/${id}/block`, method: 'post' }), invalidatesTags: ['Me'] }),
    unblockUserSelf: builder.mutation({ query: (id) => ({ url: `/users/${id}/block`, method: 'delete' }), invalidatesTags: ['Me'] }),
  }),
})

export const {
  useGetUserQuery, useUpdateProfileMutation, useChangePasswordMutation, useUploadAvatarMutation,
  useListUsersQuery, useFollowUserMutation, useUnfollowUserMutation,
  useBlockUserSelfMutation, useUnblockUserSelfMutation,
} = userApi

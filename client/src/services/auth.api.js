import { baseApi } from './baseApi'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({ query: (body) => ({ url: '/auth/register', method: 'post', data: body }) }),
    login: builder.mutation({
      query: (body) => ({ url: '/auth/login', method: 'post', data: body }),
      invalidatesTags: ['Me'],
    }),
    refreshToken: builder.mutation({ query: () => ({ url: '/auth/refresh-token', method: 'post' }) }),
    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'post' }),
      invalidatesTags: ['Me'],
    }),
    forgotPassword: builder.mutation({ query: (body) => ({ url: '/auth/forgot-password', method: 'post', data: body }) }),
    resetPassword: builder.mutation({ query: (body) => ({ url: '/auth/reset-password', method: 'post', data: body }) }),
    verifyEmail: builder.mutation({ query: (body) => ({ url: '/auth/verify-email', method: 'post', data: body }) }),
    getMe: builder.query({ query: () => ({ url: '/auth/me' }), providesTags: ['Me'] }),
  }),
})

export const {
  useRegisterMutation, useLoginMutation, useRefreshTokenMutation, useLogoutMutation,
  useForgotPasswordMutation, useResetPasswordMutation, useVerifyEmailMutation, useGetMeQuery,
} = authApi

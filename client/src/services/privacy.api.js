import { baseApi } from './baseApi'

export const privacyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPrivacySettings: builder.query({ query: () => ({ url: '/privacy/me' }), providesTags: ['Privacy'] }),
    updatePrivacySettings: builder.mutation({
      query: (body) => ({ url: '/privacy/me', method: 'patch', data: body }),
      invalidatesTags: ['Privacy'],
    }),
  }),
})

export const { useGetPrivacySettingsQuery, useUpdatePrivacySettingsMutation } = privacyApi

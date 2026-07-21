import { baseApi } from './baseApi'

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createReport: builder.mutation({ query: (body) => ({ url: '/reports', method: 'post', data: body }) }),
    listReports: builder.query({ query: (params) => ({ url: '/reports', params }), providesTags: ['Report'] }),
    updateReportStatus: builder.mutation({ query: ({ id, ...body }) => ({ url: `/reports/${id}`, method: 'patch', data: body }), invalidatesTags: ['Report'] }),
  }),
})

export const { useCreateReportMutation, useListReportsQuery, useUpdateReportStatusMutation } = reportApi

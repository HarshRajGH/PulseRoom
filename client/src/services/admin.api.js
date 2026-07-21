import { baseApi } from './baseApi'

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    dashboardStats: builder.query({ query: () => ({ url: '/admin/dashboard' }), providesTags: ['AdminStats'] }),
    auditLogs: builder.query({ query: (params) => ({ url: '/admin/audit-logs', params }), providesTags: ['AuditLog'] }),
  }),
})

export const { useDashboardStatsQuery, useAuditLogsQuery } = adminApi

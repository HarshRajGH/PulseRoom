import { baseApi } from './baseApi'

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWallet: builder.query({ query: () => ({ url: '/wallet' }), providesTags: ['Wallet'] }),
    listTransactions: builder.query({ query: (params) => ({ url: '/wallet/transactions', params }), providesTags: ['Transaction'] }),
    withdraw: builder.mutation({ query: (body) => ({ url: '/wallet/withdraw', method: 'post', data: body }), invalidatesTags: ['Wallet', 'Transaction'] }),
    sendTip: builder.mutation({ query: (body) => ({ url: '/wallet/tips', method: 'post', data: body }), invalidatesTags: ['Wallet', 'Tip'] }),
    listTipsReceived: builder.query({ query: (params) => ({ url: '/wallet/tips/received', params }), providesTags: ['Tip'] }),
  }),
})

export const { useGetWalletQuery, useListTransactionsQuery, useWithdrawMutation, useSendTipMutation, useListTipsReceivedQuery } = walletApi

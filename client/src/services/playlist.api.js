import { baseApi } from './baseApi'

export const playlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listMyPlaylists: builder.query({
      query: (params) => ({ url: '/playlists', params }),
      providesTags: (result) => result?.results
        ? [...result.results.map((p) => ({ type: 'Playlist', id: p._id })), { type: 'Playlist', id: 'LIST' }]
        : [{ type: 'Playlist', id: 'LIST' }],
    }),
    getPlaylist: builder.query({ query: (id) => ({ url: `/playlists/${id}` }), providesTags: (r, e, id) => [{ type: 'Playlist', id }] }),
    createPlaylist: builder.mutation({ query: (body) => ({ url: '/playlists', method: 'post', data: body }), invalidatesTags: [{ type: 'Playlist', id: 'LIST' }] }),
    updatePlaylist: builder.mutation({ query: ({ id, ...body }) => ({ url: `/playlists/${id}`, method: 'patch', data: body }), invalidatesTags: (r, e, { id }) => [{ type: 'Playlist', id }] }),
    deletePlaylist: builder.mutation({ query: (id) => ({ url: `/playlists/${id}`, method: 'delete' }), invalidatesTags: [{ type: 'Playlist', id: 'LIST' }] }),
    addTrack: builder.mutation({ query: ({ id, songId }) => ({ url: `/playlists/${id}/tracks`, method: 'post', data: { songId } }), invalidatesTags: (r, e, { id }) => [{ type: 'Playlist', id }] }),
    removeTrack: builder.mutation({ query: ({ id, songId }) => ({ url: `/playlists/${id}/tracks/${songId}`, method: 'delete' }), invalidatesTags: (r, e, { id }) => [{ type: 'Playlist', id }] }),
    toggleFollowPlaylist: builder.mutation({ query: (id) => ({ url: `/playlists/${id}/follow`, method: 'post' }), invalidatesTags: (r, e, id) => [{ type: 'Playlist', id }] }),
  }),
})

export const {
  useListMyPlaylistsQuery, useGetPlaylistQuery, useCreatePlaylistMutation, useUpdatePlaylistMutation,
  useDeletePlaylistMutation, useAddTrackMutation, useRemoveTrackMutation, useToggleFollowPlaylistMutation,
} = playlistApi

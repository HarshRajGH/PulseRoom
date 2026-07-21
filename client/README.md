# SyncWave — Frontend

React 19 + Vite frontend for SyncWave, now fully wired to the backend in
`../server` — see the **root README** (`../README.md`) for full-stack setup,
architecture, and the integration checklist. This file covers frontend-only
specifics.

## Run (standalone dev)

```bash
cp .env.example .env   # points at http://localhost:5000 by default
npm install
npm run dev             # http://localhost:5173
```

Requires the backend running separately (`cd ../server && npm run dev`).

## Environment variables

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL for REST calls (`src/services/apiClient.js`) |
| `VITE_SOCKET_URL` | Socket.io server URL (`src/app/SocketProvider.jsx`) |

In the Docker build these are both set to relative paths (`/api/v1`, `/`) at
build time via Dockerfile `ARG`s, since Nginx reverse-proxies same-origin in
production — see `nginx.conf`.

## Structure

```
src/
  app/            App.jsx (lazy routes), AuthProvider, SocketProvider, ThemeProvider
  services/       apiClient (axios + refresh interceptor), baseApi (RTK Query) + one *.api.js per resource
  store/          Redux store — only client-local state (auth user, player, UI chrome)
  components/     ui/ layout/ music/ room/ charts/
  layouts/        MarketingLayout, AuthLayout, DashboardLayout
  pages/          one folder per feature area, all lazy-loaded from App.jsx
```

Server data flows entirely through RTK Query (`services/*.api.js`) — the
Redux store itself only holds genuinely client-local state (which user is
logged in, local player transport state, sidebar/command-palette UI state).

## Scripts

```bash
npm run dev      # Vite dev server
npm run build    # production build → dist/
npm run preview  # preview the production build locally
npm run lint     # eslint src/
```

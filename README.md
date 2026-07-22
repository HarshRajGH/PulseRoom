# SyncWave — Full-Stack Application

Collaborative playlists and live listening-party rooms. React 19 frontend,
Node/Express backend, MongoDB, Redis, Socket.io, and Docker — fully
integrated, with every feature backed by a real API. No mock data, no
localStorage workarounds, no stub endpoints.

```
syncwave-fullstack/
  client/     React 19 + Vite frontend (RTK Query, Socket.io-client)
  server/     Node/Express API — MVC + Repository + Service layers
  docker-compose.yml   Full stack: client (nginx) + server + worker + mongo + redis
  .github/workflows/   CI (lint/build/wiring-check) + CD (build & push images)
```

## 1. Quickstart — Docker (recommended)

```bash
cp .env.example .env       # fill in real secrets — see §4
docker compose up --build
```

→ **http://localhost:8080**

Nginx serves the built React app and reverse-proxies `/api/*`, `/socket.io/*`,
and `/api-docs` to the Express container, so the browser only ever talks to
one origin — nothing to configure for CORS in production.

**Seed demo data** (admin/host/creator/listener accounts, a room, songs, a
playlist — all with password `password123`):
```bash
docker compose exec server npm run seed
```

## 2. Quickstart — local dev (hot reload)

```bash
# Terminal 1 — MongoDB + Redis (skip if you already have them running)
docker run -d --name syncwave-mongo -p 27017:27017 mongo:7
docker run -d --name syncwave-redis -p 6379:6379 redis:7-alpine

# Terminal 2 — backend
cd server
cp .env.example .env        # MONGO_URI/REDIS_* already point at localhost
npm install
npm run seed                # optional demo data
npm run dev                 # http://localhost:5000, Swagger at /api-docs

# Terminal 3 — backend worker (emails, analytics rollups)
cd server && npm run worker

# Terminal 4 — frontend
cd client
cp .env.example .env        # points at http://localhost:5000 by default
npm install
npm run dev                 # http://localhost:5173
```

## 3. Feature checklist — everything is backend-driven

| Feature | Backend | Frontend |
|---|---|---|
| JWT auth (access + rotating refresh) | `auth.service.js`, `Session` model | `AuthProvider.jsx` silent-refresh + `apiClient.js` 401-retry |
| Google OAuth | Passport strategy, `auth.controller.js` | "Continue with Google" on Login/Signup |
| **Spotify OAuth (full flow)** | `spotify.service.js` — real code exchange, token refresh, account linking, disconnect | "Continue with Spotify" (login) + Settings → Security (link/disconnect) |
| Role-based access (admin/host/creator/listener) | `role.middleware.js` | `RoleRoute.jsx` |
| **Liked songs (backend-driven)** | `library.service.js`/`.repository.js`, `GET/POST/DELETE /library/liked` — paginated, sorted, searched, indexed | `Library.jsx` — zero client-side filtering |
| Playlists | `playlist.*` (CRUD, tracks, follow) | `Playlists.jsx`, `PlaylistDetails.jsx` |
| Rooms + live sync | `room.*`, Socket.io `sync-music` | `RoomDetails.jsx` |
| Real-time voting & queue | `queue.service.js`, Socket.io `vote-song`/`queue-song` | `QueueItem.jsx` |
| Live room chat | `message.*`, Socket.io `chat:message`/`chat:typing` | `ChatPanel.jsx` |
| **Direct messaging (full 1:1 system)** | `Conversation`/`DirectMessage` models, Socket.io `dm:*` events, attachments via Cloudinary | `Messages.jsx`, `ConversationList.jsx`, `DmThread.jsx` |
| **Privacy settings (MongoDB-persisted)** | `PrivacySettings` model, `GET/PATCH /privacy/me` | `PrivacySettings.jsx` |
| Creator tips & wallet | `wallet.*`, `tip.*` | Tip modal in `RoomDetails.jsx`, `Wallet.jsx` |
| Subscriptions (Stripe-mock) | `payment.service.js`, `subscription.*` | `Subscription.jsx` |
| Analytics | `analytics.*` (Recharts) | `CreatorDashboard.jsx`, `AdminOverview.jsx` |
| Pagination | Every list endpoint (`utils/pagination.js`) | `Pagination.jsx` |
| Global search | `search.service.js` (songs/rooms/playlists/users) | `Search.jsx`, `CommandPalette.jsx`, `NewMessageModal.jsx` |
| File uploads | Multer → Cloudinary (avatars, song audio/covers, DM attachments) | `EditProfile.jsx`, DM attachment picker |
| Notifications | `notification.*` | `Notifications.jsx`, Topbar unread badge |
| Reports & moderation | `report.*`, `admin.*` | `ReportedMessages.jsx`, `ManageUsers.jsx` |
| Audit logs | `AuditLog` model | (queried via `/admin/audit-logs`) |

**Direct messaging feature detail** — one-to-one conversations, conversation
list with search, message history with pagination, real-time delivery,
typing indicators, online presence (global, Redis-backed, connection-counted
for multi-device), delivered/read receipts, per-message delete, per-user
soft-deleted conversations (reappear when a new message arrives), image and
file attachments, and a notification created on every new message.

**Privacy settings persist for real** — stored in a dedicated MongoDB
collection (one document per user, created lazily on first access).
Refreshing the browser, logging in on another device, or a different tab all
read the same server state — nothing lives in `localStorage` or component
state.

## 4. Environment variables

Copy `.env.example` → `.env` and fill in what you need. Every integration
degrades gracefully without its credentials (registration/login/rooms/chat
all work with zero external services configured) — only the specific
feature needing that credential is unavailable until you add it.

### MongoDB
```
MONGO_URI=mongodb://localhost:27017/syncwave        # local
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/syncwave   # Atlas (free tier is fine)
```
Docker Compose sets this automatically to `mongodb://mongo:27017/syncwave`.

### Redis
```
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=            # leave blank locally; set this for Redis Cloud etc.
```
Used for: BullMQ job queues (email sending, analytics rollups), Socket.io
room presence, and the global online/offline presence used by DMs.

### Cloudinary (avatars, song files, DM attachments)
1. Create a free account at cloudinary.com.
2. Dashboard → copy **Cloud name**, **API Key**, **API Secret**.
3. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

### Google OAuth
1. https://console.cloud.google.com/apis/credentials → **Create OAuth client ID** → Web application.
2. Authorized redirect URI: `http://localhost:5000/api/v1/auth/google/callback`
   (or `http://localhost:8080/api/v1/auth/google/callback` for the Docker setup).
3. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`.

### Spotify OAuth
1. https://developer.spotify.com/dashboard → **Create app**.
2. Redirect URI: `http://localhost:5000/api/v1/auth/spotify/callback`
   (or the `:8080` equivalent for Docker) — must match exactly.
3. Set `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_CALLBACK_URL`.
4. That's it — no extra package to install. The token exchange uses Node 18's
   built-in `fetch` against Spotify's `accounts.spotify.com/api/token` and
   `api.spotify.com/v1/me` (see `server/src/services/spotify.service.js`).
   Both **login via Spotify** (`/auth/spotify`) and **linking Spotify to an
   already-logged-in account** (Settings → Security → Connect Spotify) work
   out of the box once these three variables are set.

### JWT secrets
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Run twice, paste into `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.

### SMTP (optional)
Without `SMTP_HOST` set, emails are logged instead of sent (dev-safe
fallback via Nodemailer's `jsonTransport`) — registration/reset/verification
flows all still work end-to-end.

## 5. Frontend ↔ backend connection

- **Docker**: same-origin via Nginx reverse proxy (`client/nginx.conf`) — the
  frontend is built with `VITE_API_URL=/api/v1` and `VITE_SOCKET_URL=/`.
- **Local dev**: two different ports, so `client/.env` points
  `VITE_API_URL` at `http://localhost:5000/api/v1` directly, and
  `server/.env`'s `CLIENT_URL=http://localhost:5173` is what the backend's
  CORS + OAuth redirects use.
- **Auth**: refresh tokens live in an httpOnly cookie (`server` sets it on
  login); access tokens live in memory on the client (`apiClient.js`) and
  are silently re-hydrated on page load via `POST /auth/refresh-token`.

## 6. Socket.io architecture

Every authenticated connection joins a personal room (`user:<id>`) — this is
how DMs, notifications, and presence updates reach a user regardless of
which page they're on, in addition to room-scoped events for whichever
listening room they've joined (`room:<id>`).

| Event | Direction | Purpose |
|---|---|---|
| `join-room` / `leave-room` | C→S | Join/leave a listening room |
| `sync-music` | C↔S | Host broadcasts playback position |
| `queue-song` / `vote-song` | C→S | Add to queue / upvote |
| `queue-updated` | S→C | Broadcast queue changes |
| `chat:message` / `chat:typing` | C↔S | Room chat |
| `presence-count` | S→C | Room listener count |
| `heartbeat` | C→S | Keep room presence alive |
| `dm:message` | C↔S | Send/receive a direct message |
| `dm:typing` | C↔S | DM typing indicator |
| `dm:read` | C↔S | Read receipts |
| `dm:delivered` | S→C | Delivered receipt (recipient was online) |
| `presence:online` / `presence:offline` | S→C | Pushed to a user's friends when they connect/disconnect |
| `presence:query` | C→S (ack) | Bulk online-status check for a conversation list |

Presence is Redis-backed and connection-counted (`userPresence.store.js`),
so a user with multiple tabs/devices open only goes "offline" once every
connection has closed.

## 7. API documentation

- **Swagger UI**: `http://localhost:5000/api-docs` (or `:8080` via Docker) —
  every endpoint below is documented here with request/response schemas.
- **Postman**: import `server/postman/SyncWave.postman_collection.json` +
  `SyncWave.postman_environment.json` — 115 requests across 19 folders,
  including Library, Direct Messages, and Privacy. Run **Auth → Login**,
  copy `data.accessToken` into the `accessToken` environment variable.

## 8. Deployment guide

1. **Build & push images** — `.github/workflows/cd.yml` does this
   automatically on push to `main`/tags, publishing to GHCR
   (`ghcr.io/<repo>/server`, `ghcr.io/<repo>/client`).
2. **Provision** MongoDB (Atlas) and Redis (Redis Cloud, or self-hosted) —
   update `MONGO_URI`/`REDIS_*` in your production `.env`.
3. **Deploy** — pull both images on your host and run them with
   `docker-compose.yml` (adjust `CLIENT_URL` and the OAuth callback URLs to
   your real domain first), or adapt the compose file to your platform
   (Kubernetes, Render, Railway, Fly.io, a plain VM with `docker compose up
   -d`, etc.). The CD workflow leaves the actual deploy trigger as a
   documented placeholder since it's entirely host-dependent.
4. **Update OAuth redirect URIs** in the Google/Spotify developer consoles
   to match your production domain before going live.
5. **Set `NODE_ENV=production`** — tightens cookie `secure` flags and log
   verbosity.

## 9. Troubleshooting

| Symptom | Likely cause |
|---|---|
| `MongoDB connection failed` on boot | `MONGO_URI` wrong, or Mongo container/service not up yet — `docker compose logs mongo` |
| Redis errors in logs | Same idea — check `REDIS_HOST`/`REDIS_PORT`, or that the Redis container is running |
| Socket.io won't connect | Check `VITE_SOCKET_URL` matches where the server actually is; in Docker this should be `/` (proxied), not `http://localhost:5000` |
| Google/Spotify OAuth redirects to an error page | Redirect URI in the provider's dashboard doesn't exactly match `GOOGLE_CALLBACK_URL`/`SPOTIFY_CALLBACK_URL` (including trailing slashes and http vs https) |
| File uploads fail (avatar, songs, DM attachments) | Cloudinary env vars not set — everything else works without them, only uploads need them |
| "Session expired" immediately after login | Clock skew between client/server, or `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` changed (rotating them invalidates all existing tokens by design) |
| CORS errors in local dev | `CLIENT_URL` in `server/.env` doesn't match the port the frontend is actually running on |

## 10. Viva / interview prep — Q&A

**How does the liked-songs feature actually work end-to-end?**
`Song.likedBy` is an indexed array of user ObjectIds. `POST /library/liked/:songId`
does an idempotent `$addToSet`; `DELETE` does a `$pull`. Listing uses
`songRepository.findLikedByUser()` which filters `{ likedBy: userId }`,
combines it with a MongoDB text-index search when `?q=` is passed, and pages
with the same `getPagination`/`buildPaginatedResponse` helpers every other
list endpoint uses — so it's consistent with the rest of the API, not a
one-off.

**Walk me through a direct message from send to read receipt.**
Client emits `dm:message` over the socket (not REST — REST exists too, as a
fallback and for programmatic access, but the socket path is what powers the
UI). The server's `directMessage.service.js` validates the sender is a
participant, creates the message, clears any soft-delete flag on the
conversation for both users, updates `Conversation.lastMessage`, and creates
a notification. The server then emits `dm:message` to both participants'
personal rooms (`user:<id>`) — the sender's other tabs stay in sync too. If
the recipient is currently online (checked via the Redis presence set), the
server immediately marks the message `delivered` and tells the sender via
`dm:delivered`. When the recipient actually opens the thread, the client
emits `dm:read`, the server bulk-updates every unread message in that
conversation to `status: 'read'`, and tells the sender via `dm:read` so their
ticks update in real time.

**Why track presence with a connection *count* instead of a boolean?**
A user can have SyncWave open in two browser tabs. If presence were a simple
"mark online on connect, mark offline on disconnect" boolean, closing one
tab would incorrectly show them as offline to their friends while their
other tab is still open. `userPresence.store.js` increments a Redis counter
per connection and only flips to offline when it hits zero.

**How does the Spotify link flow avoid needing the refresh token in a cookie?**
The access token lives in memory on the client (see the Google/JWT section),
not a cookie — so a plain `<a href>` browser navigation to a protected
"start Spotify link" endpoint wouldn't carry an Authorization header. Instead,
`GET /auth/spotify/link` is called via the authenticated axios client (which
does attach the header) and returns the Spotify authorize URL as JSON; the
frontend then does `window.location.href = url` itself. The OAuth `state`
parameter is a short-lived signed JWT (`signStateToken`) carrying
`{ purpose: 'spotify-link', userId }`, so the callback — which Spotify calls
directly, unauthenticated — can verify both that the flow wasn't forged
(CSRF) and which account to attach the tokens to, without needing a session.

**Why a dedicated `PrivacySettings` collection instead of fields on `User`?**
Keeps the frequently-read, rarely-changing `User` document lean, and makes
"created with defaults on first access" (`getOrCreate`, the same pattern
`Wallet` and `PrivacySettings` both use) trivial — no migration needed for
users who existed before the feature shipped.

**What would you change if this had to scale to millions of users?**

Socket.io would need the Redis adapter (`@socket.io/redis-adapter`) so
`io.to(room).emit(...)` fans out correctly across multiple API instances —
everything here already treats Redis as the shared source of truth for
presence, so that's an additive change, not a redesign. MongoDB would move
to a sharded/replica-set deployment, and the liked-songs / DM search queries
would want dedicated indexes reviewed against real query patterns rather
than the reasonable defaults shipped here.

# SyncWave API — Backend

Production-shaped Node.js/Express backend for SyncWave: collaborative playlists
and live listening-party rooms. MVC + Repository + Service layering, JWT auth
with refresh-token rotation, role-based access control, Socket.io real-time
sync, BullMQ background jobs, and Swagger docs.

**113 REST endpoints** across 19 modules · **17 Socket.io events** · **21 MongoDB
collections** · Docker-ready.

---

## 1. Tech stack

| Concern | Choice |
|---|---|
| Runtime / framework | Node.js, Express |
| Database / ODM | MongoDB, Mongoose |
| Cache / queues / presence | Redis, BullMQ, ioredis |
| Realtime | Socket.io |
| Auth | JWT (access + refresh), Passport (Google OAuth), Spotify OAuth (full flow — see §6) |
| File storage | Cloudinary + Multer (memory storage → stream upload) |
| Validation | Joi (schemas) + express-validator (available, Joi used throughout) |
| Security | Helmet, express-rate-limit, express-mongo-sanitize, CORS |
| Logging | Winston (console + daily-rotate file), Morgan (HTTP access log) |
| Jobs | BullMQ workers (email, analytics rollups) + node-cron (cleanup jobs) |
| Docs | swagger-jsdoc + swagger-ui-express, Postman collection |
| Payments | Stripe-shaped **mock** service (no real Stripe key required) |
| Containerization | Docker + docker-compose (api, worker, mongo, redis) |

## 2. Architecture

```
Route → Middleware (auth/role/validate) → Controller → Service → Repository → Mongoose Model
```

- **Controllers** only translate HTTP ↔ service calls. No business logic.
- **Services** hold all business logic and orchestrate repositories.
- **Repositories** (`BaseRepository` + one subclass per collection) are the
  only layer that talks to Mongoose — swapping databases later means
  rewriting this layer only.
- **Custom `ApiError`** (with `.badRequest()`, `.notFound()`, etc. factory
  methods) and a **centralized error middleware** turn every thrown error
  into the same JSON shape: `{ success, statusCode, message, errors }`.
- **`ApiResponse`** class gives every successful response the same shape too:
  `{ success, statusCode, message, data }`.

```
src/
  config/        env, db, redis, cloudinary, passport, mailer, logger, swagger
  models/        21 Mongoose schemas (User, Song, Room, Vote, Wallet, Conversation, ...)
  repositories/  BaseRepository + one repository per model
  services/      business logic (auth, room, queue, wallet, subscription, spotify, directMessage, privacy...)
  controllers/   thin HTTP handlers
  routes/        one router per resource + central index.js
  middlewares/   auth, role, validate, error, upload, rateLimiter
  validations/   Joi schemas per resource
  sockets/       Socket.io handlers, auth middleware, room + global presence stores (Redis)
  jobs/
    queues/      BullMQ queue definitions (email, analytics-rollup)
    workers/     BullMQ worker processes
    cron/        node-cron scheduled jobs
  utils/         ApiError, ApiResponse, asyncHandler, tokens, pagination, seed
  docs/          (reserved for extra OpenAPI fragments)
  app.js         Express app (middleware pipeline + routes)
  server.js      boots DB/Redis/Socket.io/cron and starts the HTTP server
```

## 3. MongoDB collections (21)

`User, Artist, Album, Song, Playlist, Room, Vote (queue), Message, Notification,
FriendRequest, Wallet, Transaction, Tip, Subscription, Report, Session,
Analytics, AuditLog, Conversation, DirectMessage, PrivacySettings`

## 4. Roles

`admin`, `host`, `creator`, `listener` — enforced via `authorize(...roles)`
middleware on top of `authenticate` (JWT check). See `src/utils/constants.js`.

---

## 5. Run it on your machine

### Option A — Docker (recommended, zero local installs)

```bash
cd syncwave-backend
cp .env.example .env          # fill in secrets you have; safe defaults exist for the rest
docker compose up --build
```

This starts **4 containers**: `api` (port 5000), `worker` (BullMQ jobs),
`mongo` (port 27017), `redis` (port 6379) — all networked together
automatically. The API's `MONGO_URI`/`REDIS_HOST` are already pointed at the
`mongo`/`redis` service names inside `docker-compose.yml`, so you don't need
to edit those two lines for Docker.

Stop everything: `docker compose down` (add `-v` to also wipe DB/Redis data).

### Option B — Run locally without Docker

You need MongoDB and Redis running somewhere reachable — either installed on
your machine, or free cloud instances (MongoDB Atlas + Redis Cloud both have
free tiers, which is the easiest path on Windows/Mac).

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create your `.env`**
   ```bash
   cp .env.example .env
   ```

3. **Point `.env` at your MongoDB and Redis** — this is the part most people
   get stuck on, so here's exactly what to change:

   | Variable | If MongoDB is installed locally | If using MongoDB Atlas (cloud) |
   |---|---|---|
   | `MONGO_URI` | `mongodb://localhost:27017/syncwave` | `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/syncwave` (copy from Atlas → Connect → Drivers) |

   | Variable | If Redis is installed locally | If using Redis Cloud |
   |---|---|---|
   | `REDIS_HOST` | `localhost` | your Redis Cloud host, e.g. `redis-12345.c1.ap-south-1-1.ec2.cloud.redislabs.com` |
   | `REDIS_PORT` | `6379` | the port Redis Cloud gives you |
   | `REDIS_PASSWORD` | *(leave blank)* | the password Redis Cloud gives you |

4. **Generate real JWT secrets** (don't ship the placeholder ones):
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
   Run it twice and paste the two outputs into `JWT_ACCESS_SECRET` and
   `JWT_REFRESH_SECRET` in `.env`.

5. **(Optional) Cloudinary** — only needed for avatar/song-cover/audio
   uploads to actually persist. Free account → dashboard gives you
   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
   Without these, upload endpoints will error — everything else works fine.

6. **(Optional) Google OAuth** — only needed for `/auth/google`. Create an
   OAuth Client ID at https://console.cloud.google.com/apis/credentials,
   add `http://localhost:5000/api/v1/auth/google/callback` as an authorized
   redirect URI, then paste the client ID/secret into `.env`. Without these
   set, every other auth route (register/login/refresh) still works — the
   Google route just won't be usable.

7. **(Optional) SMTP** — without `SMTP_HOST` set, Nodemailer uses a
   `jsonTransport` in dev: verification/reset/welcome emails are logged
   instead of actually sent, so registration/login still work end-to-end
   without a mail provider. Fill in real SMTP creds (e.g. Mailtrap for
   testing, or a real provider) to actually receive them.

8. **Seed some starter data** (creates an admin/host/creator/listener with
   password `password123`, plus a room, songs, and a playlist):
   ```bash
   npm run seed
   ```

9. **Start the API**
   ```bash
   npm run dev        # nodemon, auto-restarts on file changes
   # or
   npm start           # plain node, for a production-style run
   ```
   You should see:
   ```
   MongoDB connected → localhost/syncwave
   Redis connected → localhost:6379
   SyncWave API listening on port 5000 [development]
   Swagger docs → http://localhost:5000/api-docs
   ```

10. **Start the background worker** (separate terminal — required for
    verification/reset emails and analytics rollups to actually process):
    ```bash
    npm run worker
    ```

### Updating things later (on your device)

- **Changed a `.env` value?** Restart `npm run dev` / `docker compose up`
  (env vars are read once at boot — nodemon does *not* reload them on save).
- **Pulled new code?** Re-run `npm install` in case dependencies changed,
  then restart the server.
- **Switched from local Mongo/Redis to cloud (or back)?** Only `MONGO_URI`
  and the three `REDIS_*` variables need to change — nothing else in the
  codebase references a connection string directly (see `src/config/db.js`
  and `src/config/redis.js`).
- **Rotating JWT secrets** logs out every existing session immediately
  (all existing access/refresh tokens stop verifying) — expected, not a bug.

---

## 6. What's intentionally simulated

- **Payments** — `src/services/payment.service.js` mimics Stripe's
  checkout-session → webhook shape without calling Stripe (no real Stripe
  keys required to run this project). Swap it for the real `stripe` SDK
  later without touching `subscription.service.js`'s calling code — that's
  the point of the service-layer boundary.

Everything else — Spotify OAuth, direct messaging, liked songs, privacy
settings — is a full implementation, not a stub. Cloudinary/SMTP/Google/
Spotify all work for real once you add credentials (see the root README's
environment variable section); the app still runs without them, just with
that one integration unavailable (uploads, or the specific OAuth provider).

## 7. Real-time (Socket.io) events

Connect with an access token: `io(URL, { auth: { token: accessToken } })`.
Every connection auto-joins a personal room (`user:<id>`) for DMs/presence,
in addition to whichever listening room (`room:<id>`) it joins explicitly.

| Event (client → server) | Payload | What happens |
|---|---|---|
| `join-room` | `{ roomId }` | joins the room, marks presence, broadcasts `user-joined` + `presence-count` |
| `leave-room` | `{ roomId? }` | leaves current/given room |
| `sync-music` | `{ roomId, trackId, positionSeconds, isPlaying }` | host broadcasts playback position → others get `music-synced` |
| `queue-song` | `{ roomId, songId }` | adds to queue → broadcasts `queue-updated` |
| `vote-song` | `{ roomId, voteId }` | upvotes a queued track → broadcasts `queue-updated` |
| `chat:message` | `{ roomId, text }` | saves + broadcasts `chat:message` |
| `chat:typing` | `{ roomId, isTyping }` | broadcasts typing indicator to the room |
| `heartbeat` | `{ roomId? }` | refreshes room presence TTL (call every ~30s) |
| `dm:message` | `{ conversationId, text, attachments }` | saves the message, pushes `dm:message` to both participants' personal rooms, marks `delivered` if the recipient is online |
| `dm:typing` | `{ conversationId, isTyping }` | pushes `dm:typing` to the other participant |
| `dm:read` | `{ conversationId }` | marks the thread read, pushes `dm:read` to the other participant |
| `presence:query` | `{ userIds: [] }` (ack) | bulk online/offline lookup for a conversation list |
| `disconnect` | — | auto room-leave, presence cleanup, and (if this was the user's last open connection) a `presence:offline` broadcast to their friends |

Room presence counts are tracked in Redis (`src/sockets/presence.store.js`)
with a 90-second TTL so a dropped connection ages out even without a clean
disconnect event. Global online/offline presence for DMs is tracked
separately (`src/sockets/userPresence.store.js`) with a connection-count
(not a boolean), so a user with multiple tabs/devices open only shows
offline once every connection has closed.

## 8. API documentation

- **Swagger UI**: `http://localhost:5000/api-docs` (interactive, try-it-out)
- **Raw OpenAPI JSON**: `http://localhost:5000/api-docs.json`
- **Postman**: import `postman/SyncWave.postman_collection.json` and
  `postman/SyncWave.postman_environment.json` — 115 pre-built requests across
  19 folders (including Library, Direct Messages, and Privacy). Run
  **Auth → Login**, copy `data.accessToken` from the
  response into the `accessToken` environment variable, and every other
  request is ready to go.

## 9. Useful scripts

```bash
npm run dev      # start API with nodemon
npm start        # start API (production-style)
npm run worker   # start BullMQ workers (email, analytics)
npm run seed     # wipe + reseed demo data
npm run lint     # eslint src/
```

## 10. Health check

`GET /health` → `{ success: true, status: "ok", uptime, timestamp }` — used
by the Dockerfile's `HEALTHCHECK` and safe to point a load balancer at.

---

## 11. Viva / interview prep notes

Quick answers for "walk me through your project" or "why did you do X":

**Why Repository pattern on top of Mongoose, when Mongoose is already an
abstraction?** Services stay testable and swappable — they call
`userRepository.findByEmail(...)`, not `User.findOne({...})` directly. To
move part of the data layer to Postgres or add caching later, only the
repository changes, not every service that uses users.

**Why separate `services/` from `controllers/`?** Controllers know about
`req`/`res` (HTTP). Services don't — they're plain functions that take and
return data, so the same `queueService.upvote()` call works from a REST
route *and* from a Socket.io handler (see `sockets/index.js`), without
duplicating the vote logic.

**How does refresh-token rotation work?** Login issues a short-lived (15m)
access token and a long-lived (30d) refresh token; the refresh token's hash
(not the raw token) is stored in a `Session` document. `/auth/refresh-token`
verifies the JWT *and* checks the session hasn't been revoked, then
**revokes the old session and issues a brand new refresh token** — so a
stolen, already-used refresh token can't be replayed indefinitely
(rotation). `/auth/logout-all` revokes every session for a user at once.

**Why BullMQ instead of sending emails inline?** Sending a verification
email synchronously inside the `/register` request ties your API's response
time to your SMTP provider's latency, and a flaky mail server would fail
otherwise-successful registrations. Enqueueing it on Redis via BullMQ lets
`/register` return immediately; a separate worker process retries email
delivery independently (3 attempts, exponential backoff).

**Why is presence tracked in Redis instead of just Socket.io rooms?**
`io.sockets.adapter.rooms` only exists on the Socket.io process's memory —
it doesn't survive a restart and doesn't work if you ever run more than one
API instance behind a load balancer. Redis-backed presence (with a 90s TTL
refreshed by `heartbeat`) is instance-agnostic and self-healing if a client
disconnects uncleanly.

**How would you scale this?** Socket.io would need the Redis adapter
(`@socket.io/redis-adapter`) so events broadcast across multiple API
instances — the presence store already assumes Redis as the shared source
of truth, so that's a small addition, not a redesign. MongoDB would move to
a replica set; BullMQ workers already run as a separate process/container so
they scale independently of the API.

**What's the centralized response format for?** Every success path returns
`{ success, statusCode, message, data }` and every error returns
`{ success, statusCode, message, errors }` (`ApiResponse` / `ApiError` in
`src/utils/`) — so a frontend can write one response interceptor instead of
handling each endpoint's shape differently.

# Secure Note-Taking API

Backend REST API for a note-taking app, with a React UI in `frontend/`. Users manage their own notes. Admins manage users and can read every note. Passwords are hashed with bcrypt. Access uses JWT Bearer tokens.

Interactive docs: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

OpenAPI JSON: [http://localhost:3000/api/docs.json](http://localhost:3000/api/docs.json)

## Stack

- Node.js and Express
- MongoDB with Mongoose
- JWT (`Authorization: Bearer <token>`)
- bcrypt password hashing
- Swagger UI for manual testing

## Project layout

```text
frontend/                  Vite + React UI
  .env.example             VITE_API_URL
  src/api/client.js        fetch wrapper, Bearer token
  src/auth/                login session
  src/pages/               login, notes, users, posts, admin views
backend/
  index.js                 starts the server
  seed.js                  demo users, notes, and posts
  src/
    app.js                 routes, Swagger, error handler
    server.js              database connect and listen
    config/                environment and MongoDB
    models/                User, Note, Post and schema.index()
    routes/                auth, users, notes, admin
    controllers/
    services/
    middleware/            auth, authorize, validation, errors
    aggregations/          interest grouping and posts $lookup
    docs/openapi.js        Swagger specification
```

## Prerequisites

- Node.js 18 or newer
- A MongoDB connection string

## Backend setup

From the repository root:

```bash
cd backend
cp .env.example .env
```

Windows PowerShell:

```powershell
cd backend
Copy-Item .env.example .env
```

Edit `backend/.env`. Do not commit it.

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGO_URL` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign tokens |
| `JWT_EXPIRES_IN` | No | Token lifetime. Default `7d` |
| `PORT` | No | HTTP port. Default `3000` |

Install, load demo data, and start:

```bash
npm install
npm run seed
npm start
```

Restart on file changes:

```bash
npm run dev
```

`npm run seed` is safe to run again. It upserts the demo users, notes, and posts and stores bcrypt password hashes.

| Role | Email | Password |
| --- | --- | --- |
| User | `rahim@example.com` | `test123` |
| Admin | `admin@example.com` | `admin123` |

The user account has interests `chess`, `reading`, and `programming`, two notes, and one post. The admin account has interests `security` and `technology`.

## Frontend

React app in `frontend/`. It uses the API above: login stores the JWT, and every later request sends `Authorization: Bearer <token>`. Start the backend and run the seed before opening the UI. The demo accounts in the table above work on the login page.

Stack: Vite, React, and React Router. There is no component library. The session lives in `localStorage` (`token` and `user`). Logout clears both. A missing token, or a `401` from the API, sends the browser to `/login`.

### Frontend setup

From the repository root:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Windows PowerShell:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The dev server is [http://localhost:5173](http://localhost:5173). `npm install` is only required the first time, or after dependencies change.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | No | API origin. Example and fallback are `http://localhost:3000` |

`frontend/.env` is not committed. Change `VITE_API_URL` when the API is not on port 3000, then restart `npm run dev`. Vite reads env variables at startup.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server with reload |
| `npm run build` | Production build in `frontend/dist` |
| `npm run preview` | Serve the production build locally |

### Screens

| Screen | Path | Who | API |
| --- | --- | --- | --- |
| Login and register | `/login` | Public | `POST /api/auth/login`, `POST /api/auth/register` |
| My notes | `/notes` | Signed in | `GET`, `POST`, `PATCH`, `DELETE /api/notes` |
| User posts | `/posts` | Signed in | `GET /api/users/{id}/posts` |
| Users | `/users` | Admin | `GET`, `POST`, `PATCH`, `DELETE /api/users` |
| All notes | `/admin/notes` | Admin | `GET /api/admin/notes` |
| Users by interest | `/admin/analytics/users-by-interest` | Admin | `GET /api/admin/analytics/users-by-interest` |

Lists use `page` and `limit=10` and show the API `meta` pager. Notes and users can be created, edited, and deleted. All notes is read-only. Users by interest shows each interest, the count, and the users in that group. User posts defaults to the signed-in user id; another id can be entered on that page.

Admin links stay hidden for role `user`. Opening an admin path as a user returns to `/notes`. The API still answers `403` if that request is sent directly.

## Swagger and Bearer auth

1. Open [http://localhost:3000/api/docs](http://localhost:3000/api/docs).
2. Call **POST /api/auth/login**.
3. Copy the `token` value from the response. Do not include the word `Bearer`.
4. Click **Authorize**, paste the token, then click **Authorize** and **Close**.
5. Call any protected operation. Swagger sends `Authorization: Bearer <token>`.

The token stays in the browser session. Register, login, and the health check do not need a token. A lock icon marks routes that do.

From code or curl, send:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

In PowerShell, use `curl.exe`. `curl` is an alias for `Invoke-WebRequest`.

## Roles

| Action | User | Admin |
| --- | --- | --- |
| Register and login | Yes | Yes |
| Create, read, update, and delete own notes | Yes | Yes |
| List own notes | Yes | Yes |
| List every note | No | Yes |
| List, create, update, and delete users | No | Yes |
| Read own profile | Yes | Yes |
| Read another user's profile | No | Yes |
| Users grouped by interest | No | Yes |
| Read a user's posts | Yes | Yes |

Public registration always saves role `user`. Only an admin can set `role` to `admin`, through **POST /api/users** or **PATCH /api/users/{id}**.

## Conventions

**Success lists**

```json
{
  "data": [],
  "meta": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 }
}
```

`page` starts at 1. `limit` defaults to 10 and cannot be higher than 50. Lists are sorted by `createdAt` descending.

**Errors**

```json
{ "message": "Human readable", "code": "ERROR_CODE" }
```

| Status | Code | When |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Invalid or missing body fields |
| 400 | `INVALID_JSON` | Body is not JSON |
| 401 | `UNAUTHORIZED` | Missing Bearer token |
| 401 | `INVALID_TOKEN` | Token is expired, malformed, or the user is gone |
| 401 | `INVALID_CREDENTIALS` | Login email or password is wrong |
| 403 | `FORBIDDEN` | Signed in, but the role cannot do this |
| 404 | `NOT_FOUND` | Route, user, or note does not exist, or the note is not yours |
| 409 | `EMAIL_TAKEN` | Email is already registered |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

Passwords are never returned. A user who requests another person's note gets `404`.

## API reference

Base URL: `http://localhost:3000`

### Health

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | No | Service message |
| GET | `/api/health` | No | `{ "status": "ok" }` |

### Auth

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Create a user with role `user` and return `{ token, user }` |
| POST | `/api/auth/login` | No | Return `{ token, user }` |
| GET | `/api/auth/me` | Bearer | Current user |

Register body:

```json
{ "name": "Amina", "email": "amina@example.com", "password": "secret12" }
```

`name` is required. `email` must be a valid email. `password` must be at least 6 characters.

Login body:

```json
{ "email": "rahim@example.com", "password": "test123" }
```

Login response:

```json
{
  "token": "<jwt>",
  "user": {
    "id": "<userId>",
    "name": "Rahim Ahmed",
    "email": "rahim@example.com",
    "role": "user",
    "interests": ["chess", "reading", "programming"]
  }
}
```

The JWT payload is `{ "sub": "<userId>", "role": "user" }`.

```bash
curl.exe -s -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"rahim@example.com\",\"password\":\"test123\"}"
```

### Users

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/users?page=1&limit=10` | Admin | Paginated users, newest first |
| POST | `/api/users` | Admin | Create a user. Password is hashed |
| GET | `/api/users/{id}` | Self or admin | One user. Lookup uses `_id` |
| PATCH | `/api/users/{id}` | Admin | Update name, email, password, role, or interests |
| DELETE | `/api/users/{id}` | Admin | Delete a user. Response `204` |
| GET | `/api/users/{id}/posts` | Bearer | That user's posts through one `$lookup` aggregation |

Create body:

```json
{
  "name": "New User",
  "email": "new@example.com",
  "password": "secret12",
  "role": "user",
  "interests": ["chess"]
}
```

`role` is optional and must be `user` or `admin`. `interests` is an optional array of strings. Update sends only the fields that change. At least one field is required.

```bash
curl.exe -s "http://localhost:3000/api/users?page=1&limit=10" ^
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Notes

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/notes?page=1&limit=10` | Bearer | Caller's notes only, newest first |
| POST | `/api/notes` | Bearer | Create a note. `userId` comes from the token |
| GET | `/api/notes/{id}` | Owner or admin | One note |
| PATCH | `/api/notes/{id}` | Owner or admin | Update `title` and/or `content` |
| DELETE | `/api/notes/{id}` | Owner or admin | Delete a note. Response `204` |
| GET | `/api/admin/notes?page=1&limit=10` | Admin | Every note, newest first |

Create body:

```json
{ "title": "Interview notes", "content": "Indexes and aggregations." }
```

`title` and `content` are required and cannot be blank. An admin's own-note list is still `GET /api/notes`. `GET /api/admin/notes` is the full list.

```bash
curl.exe -s -X POST http://localhost:3000/api/notes ^
  -H "Authorization: Bearer TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Interview notes\",\"content\":\"Indexes and aggregations.\"}"
```

### Aggregations

Both views use exactly one `User.aggregate()` call.

**Users grouped by interest.** Admin only.

`GET /api/admin/analytics/users-by-interest`

Pipeline: project safe fields, unwind `interests`, group by interest, sort by interest name. A user with several interests appears in each group.

```bash
curl.exe -s http://localhost:3000/api/admin/analytics/users-by-interest ^
  -H "Authorization: Bearer ADMIN_TOKEN"
```

Example item:

```json
{
  "_id": "chess",
  "count": 1,
  "users": [{ "id": "<userId>", "name": "Rahim Ahmed", "email": "rahim@example.com" }]
}
```

**Posts for one user.** Any signed-in user.

`GET /api/users/{id}/posts`

Pipeline: match the user id, `$lookup` from `posts` where `userId` equals the user `_id`, then drop `password`. An unknown or invalid id returns `404`. A user with no posts returns `"posts": []`.

```bash
curl.exe -s http://localhost:3000/api/users/USER_ID/posts ^
  -H "Authorization: Bearer TOKEN"
```

Replace `USER_ID` with the `id` from login or from `GET /api/users`.

## Indexes

Only these indexes are declared, with `schema.index()`:

| Model | Index | Query it supports |
| --- | --- | --- |
| User | `{ email: 1 }` unique | Login and registration lookup |
| User | `{ createdAt: -1 }` | Admin user list |
| User | `{ interests: 1 }` | Group-by-interest aggregation |
| Note | `{ userId: 1, createdAt: -1 }` | A user's own note list |
| Note | `{ createdAt: -1 }` | Admin list of every note |
| Post | `{ userId: 1 }` | Posts `$lookup` |

`GET` by id uses MongoDB's default `_id` index. Source files:

- `backend/src/models/User.js`
- `backend/src/models/Note.js`
- `backend/src/models/Post.js`
- `backend/src/aggregations/groupByInterests.js`
- `backend/src/aggregations/userPostsLookup.js`

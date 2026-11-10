---
name: secure-notes-phase-1-models-indexes-seed
description: >-
  Adds User, Note, and Post Mongoose schemas with minimal schema.index() entries
  and a bcrypt-based idempotent seed. Use for secure-notes phase 1 or when
  models, indexes, or seed migration are requested.
disable-model-invocation: true
---

# Secure Notes — Phase 1: Models, Indexes, Seed

## Goal

Define data layer and indexes required by the assignment rubric. Rewrite [`backend/seed.js`](backend/seed.js) to use models and hashed passwords.

## Prerequisites

- Phase 0 complete (`backend/src/` layout, DB connect works)
- Read [index-map.md](index-map.md) before adding any index

## Checklist

```
- [ ] Create backend/src/models/User.js
- [ ] Create backend/src/models/Note.js
- [ ] Create backend/src/models/Post.js
- [ ] Declare ALL indexes via schema.index() only (see index-map.md)
- [ ] User.password: select false; role enum user|admin; interests [String]
- [ ] Note/Post: userId ObjectId ref User; timestamps enabled
- [ ] Add bcrypt dependency; hash in seed and on user create (service later)
- [ ] Rewrite seed.js: upsert by email, preserve demo interests/notes/posts
- [ ] package.json script: "seed": "node seed.js"
```

## Schema sketch

**User:** `name`, `email`, `password`, `role` (default `user`), `interests`, timestamps.

**Note:** `userId`, `title`, `content`, timestamps.

**Post:** `userId`, `title`, `content`, timestamps.

## Index block (copy intent into models; adjust only if query changes)

```javascript
// User.js — cite query in comment above each schema.index()
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });
userSchema.index({ interests: 1 });

// Note.js
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ createdAt: -1 });

// Post.js
postSchema.index({ userId: 1 });
```

## Seed rules

- Replace plaintext passwords from old seed with `bcrypt.hash`.
- Admin user: `admin@example.com`, role `admin`.
- Regular user: `rahim@example.com`, interests `['chess','reading','programming']`.
- Idempotent: `findOneAndUpdate` by email with `upsert` or skip if exists.

## Anti-patterns

- No `index: true` on schema fields when the same index is already in `schema.index()`.
- No extra indexes beyond [index-map.md](index-map.md).
- Do not implement REST routes in this phase.

## Acceptance criteria

- `npm run seed` succeeds twice without duplicate key errors (idempotent).
- Models sync indexes (`mongoose.model` + indexes defined in code for review).
- Password fields in DB are bcrypt hashes, not plaintext.

## Next phase

**secure-notes-phase-2-auth-jwt** — register, login, JWT middleware.

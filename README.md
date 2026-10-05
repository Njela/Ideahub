# Idea Tracker

Next.js 14 + Prisma (Postgres) + Auth.js (GitHub sign-in).

- Every save writes an append-only `Revision` (changed fields only, author, note).
- Saves use an optimistic lock (`version`), so simultaneous edits are rejected, not overwritten.
- Link an idea to a GitHub repo and push/PR/issue/release events appear in the same History timeline.

## Setup
1. `cp .env.example .env` and fill it in (Postgres, e.g. Neon).
2. Create a GitHub OAuth App: callback `http://localhost:3000/api/auth/callback/github`. Put its ID/secret in `.env`.
3. `npm install && npm run db:push && npm run dev`

## GitHub webhook (build-stage tracking)
On each tracked repo (or org): Settings > Webhooks > Add webhook
- Payload URL: `https://YOUR-DOMAIN/api/github/webhook` (use ngrok locally)
- Content type: `application/json`, Secret: your `GITHUB_WEBHOOK_SECRET`
- Events: Pushes, Pull requests, Issues, Releases

Then set the idea's "GitHub repo" field to `owner/name`.

## Not included yet
Comments, activity feed across ideas, restore-version button, milestone progress bars, GitHub App (this uses OAuth + a webhook secret).

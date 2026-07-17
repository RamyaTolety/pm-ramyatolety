# Waypoint 🧭

_Chart the course. Ship the work._

A project management platform built for Phase 1 Project 1 of the Hult Cohort Developer Program.

## Architecture

- **Framework:** Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Auth:** Firebase Authentication (email + password)
- **Data:** Firestore
  - `projects/{projectId}` — `name`, `description`, `ownerId`, `ownerEmail`, `memberEmails[]`, `archived`, `createdAt`
  - `projects/{projectId}/tasks/{taskId}` — `title`, `description`, `status` (`todo` | `in_progress` | `done`), `assigneeEmail`, `createdAt`, `updatedAt`
- **Real-time:** all reads use Firestore `onSnapshot` listeners, so the board and dashboard update live across users without a refresh.
- **Access control:** `firestore.rules` restricts read/write on a project (and its tasks) to users whose email is in that project's `memberEmails`.
- **Hosting:** Vercel

## Features

- Email/password auth, unlimited accounts
- Create / edit / archive projects, ≥1 project per user
- Add cohort members to a project by email (grants task assignment + board access)
- Tasks with title, description, status (todo / in progress / done), assignee
- Kanban board per project, filterable by assignee
- Cross-project "My Tasks" view, filterable by project, status, and assignee

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com):
   - Enable **Authentication → Email/Password**
   - Enable **Firestore Database** (production mode)
   - Deploy `firestore.rules` (Firebase console → Firestore → Rules, or `firebase deploy --only firestore:rules`)
   - Copy the web app config into a `.env.local` (see `.env.local.example`)
3. Run the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Deployment

Deployed on Vercel with the same environment variables set as project env vars. Firestore data persists independently of the app deployment, so redeploys don't affect existing projects/tasks. Deploys currently run via `vercel --prod`; a GitHub-triggered auto-deploy hasn't been wired up yet.

## Seeding test accounts

For staff verification (30 distinct accounts requirement), bulk-create test users with the Firebase Admin SDK:

```bash
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json \
  npm run seed:accounts -- --count 30 --project <projectId>
```

Get `serviceAccountKey.json` from Firebase console → Project settings → Service accounts → Generate new private key. **Never commit this file** — it's already covered by `.gitignore`. Accounts are created as `cohort-test-01@example.com` … `cohort-test-30@example.com` with a shared password (see script output); pass `--project <projectId>` to also add them as members of an existing project.

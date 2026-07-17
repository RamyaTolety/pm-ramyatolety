# Waypoint

_Chart the course. Ship the work._

A project management platform built for Phase 1 Project 1 of the Hult Cohort Developer Program.

**The story:** every project is a route, every task a leg of the journey, and your team is the crew.
Finishing work should feel like logging a leg of a voyage, not just checking a box — that's the
thread behind the Focus widget, the Voyage Log, and the Conditions indicator below. The visual
theme follows suit: a light-blue sky/ocean gradient, a ship's helm mark, and nautical icons
(anchor, sailboat, waves) instead of emoji.

## Reviewer login

No need to sign up — use the seeded account to explore immediately:

```
Email:    ramyat500+test1@gmail.com
Password: testpass123
```

It already owns a project ("Cohort Sprint Board") with tasks in each status, a comment thread, and
a due date, so the board, filters, and Focus widget all have real data on first load.

## Architecture

- **Framework:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Auth:** Firebase Authentication (email + password)
- **Data:** Firestore
  - `projects/{projectId}` — `name`, `description`, `ownerId`, `ownerEmail`, `memberEmails[]`, `archived`, `createdAt`
  - `projects/{projectId}/tasks/{taskId}` — `title`, `description`, `status` (`todo` | `in_progress` | `done`), `assigneeEmail`, `dueDate`, `createdAt`, `updatedAt`
  - `projects/{projectId}/tasks/{taskId}/comments/{commentId}` — `authorEmail`, `text`, `createdAt`
  - `projects/{projectId}/tasks/{taskId}/checklistItems/{itemId}` — `text`, `done`, `createdAt`
- **Real-time:** all reads use Firestore `onSnapshot` listeners, so the board and dashboard update live across users without a refresh.
- **Access control:** `firestore.rules` restricts read/write on a project (and its tasks/comments) to users whose email is in that project's `memberEmails`. `ownerEmail` is immutable on update — found and fixed during self-review, since without it any member could reassign ownership to themselves and then delete the project (delete only checks `ownerEmail`).
- **Hosting:** Vercel

## Features

- Email/password auth, unlimited accounts
- Create / edit / archive projects, ≥1 project per user
- Add cohort members to a project by email (grants task assignment + board access)
- Tasks with title, description, status (todo / in progress / done), assignee, optional due date with overdue/due-soon color badges
- Kanban board per project — drag-and-drop cards between columns, or use the status dropdown; filterable by assignee
- Comment threads per task
- **Focus widget** on the dashboard: your single most urgent assigned task (earliest due date first), plus a "shipped this week" count — one clear next action instead of scanning three columns
- Live incomplete-task count badge next to "My Tasks" in the nav
- Confetti celebration when a task is marked done
- Keyboard shortcuts: press `n` to open "new task"; `⌘K`/`Ctrl+K` opens a command palette to jump to any project or page
- Colored task labels (Bug/Feature/Docs/Urgent/Design), filterable on the board
- Subtask checklists per task, with a progress bar
- Project templates on creation (Blank / Sprint Board / Bug Tracker) that pre-populate starter tasks
- Per-project **Insights** page: 7-day completion chart, average cycle time, breakdown by assignee, and a **Conditions** indicator ("Smooth sailing" / "Choppy waters" / "Storm warning") computed from the overdue ratio
- **Voyage Log**: a per-project activity timeline — tasks created/completed, comments, checklist items checked off — assembled chronologically from real data, not a synthetic feed
- A completion toast alongside the confetti when you finish a task
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

## Known limitations

Stated plainly rather than left for a reviewer to find:

- **No auto-deploy on push.** Vercel's GitHub integration reports "already connected" but no webhook actually exists on the repo (confirmed via the GitHub API) — deploys currently run manually via `vercel --prod`.
- **No notifications or email digests.** Assignment and due-date awareness is in-app only (Focus widget, badges); nothing pings you outside the app.
- **No points/leaderboard gamification** — a deliberate omission, not an oversight: ranking risks demotivating whoever's behind, which cuts against the cohort's actual goal.
- **Drag-and-drop is unverified by automated testing.** It's standard HTML5 `dragstart`/`dragover`/`drop`, but browser-automation tools can't simulate native drag events, so this was checked by code review, not a live test. The status dropdown is a fully-tested fallback for the same action.
- **Any project member can remove any other member** from `memberEmails` (including the owner) — collaborative-editing tradeoff, not currently restricted to the owner. `ownerEmail` itself is protected (see Architecture).
- **Any project member can delete any task**, not just their own or ones they created — intentional for a small trusted cohort team, but worth knowing.

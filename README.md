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
  - `projects/{projectId}` — `name`, `description`, `ownerId`, `ownerEmail`, `memberEmails[]`, `archived`, `createdAt`, `portIcon`, `portColor`, `anchorWatchDays`
  - `projects/{projectId}/tasks/{taskId}` — `title`, `description`, `status` (`todo` | `in_progress` | `done`), `assigneeEmail`, `dueDate`, `labels[]`, `priority` (`low`|`medium`|`high`|`urgent`), `recurrence` (`none`|`daily`|`weekly`), `createdAt`, `updatedAt`
  - `projects/{projectId}/tasks/{taskId}/comments/{commentId}` — `authorEmail`, `text`, `createdAt`
  - `projects/{projectId}/tasks/{taskId}/checklistItems/{itemId}` — `text`, `done`, `createdAt`
  - `users/{uid}` — `hasSeenIntro` (per-account onboarding state; requires the rules addition noted below — falls back to a localStorage flag until that rule is published)
- **Real-time:** all reads use Firestore `onSnapshot` listeners, so the board and dashboard update live across users without a refresh.
- **Access control:** `firestore.rules` restricts read/write on a project (and its tasks/comments) to users whose email is in that project's `memberEmails`. `ownerEmail` is immutable on update — found and fixed during self-review, since without it any member could reassign ownership to themselves and then delete the project (delete only checks `ownerEmail`).
- **Hosting:** Vercel

## Features

- Email/password auth, unlimited accounts
- Create / edit / archive projects, ≥1 project per user
- Add cohort members to a project by email (grants task assignment + board access)
- Tasks with title, description, status (todo / in progress / done), assignee, priority (Low/Medium/High/Urgent), optional due date with overdue/due-soon color badges, and optional recurrence — fully editable after creation (title/description/assignee/due date/labels/priority/recurrence), and deletable, both from the task card
- Kanban board per project — drag-and-drop cards between columns, or use the status dropdown; filterable by assignee (deep-linkable via `?assignee=` for cross-page filtering, e.g. from the Crew roster)
- **Recurring "standing watch" tasks**: mark a task Daily or Weekly, and completing it automatically spawns a fresh follow-up task with the due date advanced by the interval
- Comment threads per task, with **@mentions**: type `@` to autocomplete a project member's email, rendered highlighted in the thread (readability only — no notification is sent yet, see Known limitations)
- **Focus widget** on the dashboard: your single most urgent assigned task (earliest due date first), plus a "shipped this week" count — one clear next action instead of scanning three columns
- Live incomplete-task count badge next to "My Tasks" in the nav
- Confetti celebration when a task is marked done
- Keyboard shortcuts: press `n` to open "new task"; `⌘K`/`Ctrl+K` opens a command palette to jump to any project, page, or **task** (searches task titles across every project you're in, not just navigation)
- Colored task labels (Bug/Feature/Docs/Urgent/Design), filterable on the board
- Subtask checklists per task, with a progress bar
- Project templates on creation (Blank / Sprint Board / Bug Tracker) that pre-populate starter tasks
- Per-project **Insights** page: 7-day completion chart, average cycle time, breakdown by assignee, and a **Conditions** indicator ("Smooth sailing" / "Choppy waters" / "Storm warning") computed from the overdue ratio
- **Voyage Log**: a per-project activity timeline — tasks created/completed, comments, checklist items checked off — assembled chronologically from real data, not a synthetic feed
- A completion toast alongside the confetti when you finish a task
- Cross-project "My Tasks" view, filterable by project, status, and assignee
- **First-voyage onboarding carousel**: a 3-slide animated welcome sequence shown once right after sign-up, gated on a per-uid localStorage flag set at signup time so existing users never see it retroactively
- **Anchor Watch**: a muted badge on a task card when it's sat in To Do for longer than the project's configured threshold (default 3 days, editable per project via Edit), separate from the due-date badge since it's informational rather than urgent
- **Port customization**: pick an accent icon and color ("port") for a project at creation or via Edit; reflected on the project card, the dashboard, and the board header
- A compact **Conditions badge** (Smooth sailing / Choppy waters / Storm warning) on every project card on the dashboard itself, not just inside a project's Insights page
- **Crew roster page** (`/projects/[id]/crew`): per-member stats — tasks assigned, completed, and completion rate — reusing the same aggregation approach as the Insights "By assignee" breakdown. Includes members later removed from the project if they still have tasks assigned (labeled "former member"), so historical stats don't silently disappear. Click a member's row to jump to the board pre-filtered to their tasks.
- **7-day weather forecast** on the Insights page: the Conditions indicator extended into a row of 7 day-icons, each colored by the same Smooth sailing/Choppy waters/Storm warning thresholds applied to that day's due-task load against recent throughput ("Storm warning" requires genuine pile-up — at least 2 tasks due and a high load ratio — so a single due task on a quiet day never over-reads as a storm). Click a day to expand an inline list of what's actually due then.
- **Route Timeline** (`/projects/[id]/timeline`): due-dated tasks plotted like ports of call along a horizontal line, colored by status with a distinct overdue color. Drag a port to reschedule its due date; labels for closely-clustered due dates fan out into tiers instead of overlapping.
- **Night Watch**: a dark-navy theme toggle in the navbar and on the login page, class-based Tailwind dark mode persisted in localStorage, with automatic OS/browser dark-mode detection as the default when no preference has been saved yet

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
- **No notifications or email digests.** Assignment, due-date, and @mention awareness is in-app only (Focus widget, badges, highlighted mention text); nothing pings you outside the app. @mentions are readability-only for the same reason — no push/email is sent when you're mentioned.
- **No points/leaderboard gamification** — a deliberate omission, not an oversight: ranking risks demotivating whoever's behind, which cuts against the cohort's actual goal.
- **Drag-and-drop is unverified by automated testing**, on both the kanban board and the new Route Timeline reschedule interaction. Both use native pointer/HTML5 drag events, but browser-automation tools can't reliably synthesize continuous pointer movement, so these were checked by code review and manual dispatch of synthetic pointer events, not a literal click-and-drag in an automated test. The status dropdown is a fully-tested fallback for the kanban case; the task edit form's due-date field is the fallback for rescheduling.
- **Any project member can remove any other member** from `memberEmails` (including the owner) — collaborative-editing tradeoff, not currently restricted to the owner. `ownerEmail` itself is protected (see Architecture).
- **Any project member can delete any task**, not just their own or ones they created — intentional for a small trusted cohort team, but worth knowing. (This is now actually implemented in the UI — it previously described a Firestore rule permission with no button behind it.)
- **The onboarding carousel's Firestore sync requires a rules update the app owner hasn't published yet.** It now writes/reads a `hasSeenIntro` flag on `users/{uid}` so the "seen it" state syncs across devices, but until the rule below is live in the Firebase console, those reads/writes fail permission checks and the feature transparently falls back to its original per-device localStorage behavior — nothing breaks, it just isn't cross-device yet:
  ```
  // Per-user profile doc (e.g. cross-device onboarding state). Each user
  // may only read/write their own document.
  match /users/{userId} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
  ```
  Add this as a sibling to the existing `match /projects/{projectId}` block in `firestore.rules`, inside the same `match /databases/{database}/documents { ... }` wrapper, then publish via the Firebase console.
- **Recurring tasks only regenerate on-open.** A "standing watch" task's successor is spawned client-side the moment someone marks the current instance done — there's no server-side cron, so a recurring task with nobody around to complete it simply stays open past its due date rather than auto-advancing on a schedule.
- **@mention autocomplete matches on email substring only** — there's no display-name field to search, so mentioning someone means typing enough of their actual email to disambiguate.

# CLAUDE.md — Century Kumdo Club Website

Live site: https://www.centurykumdo.com  
Repo: d:\workspace\js\centurynew

## Saving Sessions

At the end of a work session run `/ingest` (no argument) in the zettelkasten vault (`D:\MJData\zettelkasten`). This exports a structured session summary to `raw/sessions/YYYY-MM-DD-<topic>.md` and promotes durable knowledge into `LLM/mireutech/century-kumdo-site.md`. The ingest command definition is at `D:\MJData\zettelkasten\.claude\commands\ingest.md`.

## Project Overview

Next.js website for Century Kendo Club (BC, Canada). Bilingual (English/Korean). Members-only section, event calendar, admin panel. Deployed to Vercel with Vercel Postgres as the database.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.4.8 (Pages Router) |
| Styling | Tailwind CSS 3.4.17 + DaisyUI 2.x |
| UI components | MUI 5 (date pickers only), react-big-calendar, react-icons |
| Forms | Formik |
| Auth | Firebase 10.x |
| Database | PostgreSQL via `pg` — Vercel Postgres in prod |
| Content | Markdown with frontmatter (`frontmatter-markdown-loader`) |
| Date utils | dayjs |
| Deployment | Vercel (with Speed Insights) |

## Environment Variables

```
# Production (Vercel Postgres)
VERCELDB_URL=

# ISR revalidation
REVALIDATE_SECRET=

# Local dev PostgreSQL (optional fallback)
DB_USER=
DB_HOST=
DB_DATABASE=
DB_PASSWORD=
DB_PORT=
```

Two DB utility files:
- [src/utils/vercelpostgres.js](src/utils/vercelpostgres.js) — used by all API routes (production)
- [src/utils/postgres.js](src/utils/postgres.js) — local dev direct connection

## Database Schema

### `centurymember`
```sql
member_id INTEGER PK (seq starts 1000)
name          VARCHAR(100)
img           VARCHAR(50)          -- filename in /public/profile/
hangeul       VARCHAR(50) NOT NULL -- Korean name
altname       VARCHAR(50)          -- display name override
address       VARCHAR(50)
phone         VARCHAR(15)
carrier       VARCHAR(10)
email         VARCHAR(20)
dob           DATE
start_date    DATE
level         VARCHAR(50)          -- e.g. "1 Dan", "2 Dan", "3 Kyu"
is_adult      BOOLEAN NOT NULL
is_active     BOOLEAN NOT NULL
guardian_id   INTEGER FK → centurymember(member_id)
last_update   TIMESTAMP DEFAULT now()
```

**Level → display group mapping:**
- `1 Dan` → `level2` (Shodan)
- `* Dan` (2+) → `level1` (Senior Dan)
- `* Kyu` → `level3`
- anything else / null → `level4` (Beginner)
- `is_active = false` → `level5` (Inactive — hidden from static render)

### `event`
```sql
event_id      INTEGER PK (seq starts 1000)
title         VARCHAR(50) NOT NULL
detail        VARCHAR(50) NOT NULL
time_duration VARCHAR(15)
start_date    DATE NOT NULL
end_date      DATE NOT NULL
color         VARCHAR(50)          -- hex color for calendar
last_update   TIMESTAMP DEFAULT now()
```

**Calendar color codes:**
- `#6495ED` Langley Lions Society
- `#8FBC8F` Coquitlam Harbour View
- `#DC143C` Holiday
- `#7FFF00` Special Events
- `#FF1493` New Coquitlam
- `#2F4F4F` Special Events (dark)

## Key Files

```
src/
  pages/
    _app.js              # App wrapper: AppContext provider + PrivateRoute
    index.js             # Landing page (uses Main component)
    members.js           # Member directory (ISR, getStaticProps)
    calendar.js          # Event calendar (react-big-calendar)
    admin.js             # Admin panel (protected)
    addCalendar.js       # Add event (protected)
    editCalendar.js      # Edit event (protected)
    manageCalendar.js    # Manage/delete events (protected)
    login.js             # Firebase login
    schedule.js          # Class schedule
    instructors.js       # Instructor profiles
    membership.js        # Pricing & membership info
    gallery.js           # Photo gallery
    api/
      members.js         # GET all members (live, for client refresh)
      submit.js          # POST create event
      delete.js          # POST delete event
      refresh-members.js # POST trigger ISR revalidate for /members
      revalidate.js      # POST generic ISR revalidate (REVALIDATE_SECRET required)
  components/
    AppContext.js        # Auth state + language state (Context)
    PrivateRoute.js      # Redirect to /login if not authenticated
    Layout.js            # Header + Footer wrapper
    Header.js            # Nav bar (bilingual)
    Main.js              # Landing page composition
    Schedule.js          # Class schedule display
    Gallery.js           # Photo gallery
    About.js             # About section
  content/
    home.md              # All bilingual static content (frontmatter YAML)
  utils/
    vercelpostgres.js    # pg Pool — Vercel Postgres (all API routes use this)
    postgres.js          # pg Pool — local direct connection
public/
  profile/              # Member profile photos (named by img column value)
table.sql               # Schema DDL
insert.sql              # Sample event inserts
```

## Architecture Patterns

### Auth (Firebase)
- Firebase handles sign-in. `AppContext` tracks `user` state via `onAuthStateChanged`.
- `PrivateRoute` wraps the entire app and redirects unauthenticated users away from protected routes: `/admin`, `/addCalendar`, `/manageCalendar`, `/editCalendar`.

### ISR (Incremental Static Regeneration)
- `/members` page is statically generated at build time (`getStaticProps`) and revalidates every 7 days (`revalidate: 604800`).
- After data changes, hit `POST /api/refresh-members` to force immediate revalidation.
- The page also has a "Refresh view" button that fetches live data from `GET /api/members` without triggering ISR — useful for admins to see changes immediately without a full revalidate.

### Bilingual Content
- `language` state (`'en'` | `'kr'`) lives in `AppContext`.
- Static content (headings, labels, nav) comes from `home.md` frontmatter YAML.
- Components read `language` from context and pick the right key (e.g., `levels.level1` vs `levels.klevel1`).

### Content Management
- All copy lives in [src/content/home.md](src/content/home.md) as YAML frontmatter.
- Loaded at build time via `frontmatter-markdown-loader` webpack config in `next.config.js`.
- Instructor bios, schedule info, membership pricing, nav labels — all in this file.

## Common Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server locally
npm run lint     # ESLint check
```

## Development Roadmap

Full feature roadmap and prioritized work plan:  
`D:\MJData\zettelkasten\projects\Century\roadmap.md`

**Phases at a glance:**
1. Bug fixes (P0 — immediate)
2. Auth upgrade — keyword-gated Google login + role system (P1)
3. Calendar management UX — unified add/edit/delete (P2)
4. Google Maps for practice locations (P3)
5. New membership sign-up form (P4)
6. PWA push notifications with admin compose page (P5)
7. XLSX member data import with diff preview (P6)
8. Admin file sharing via Vercel Blob (P7)
9. Library modernization — DaisyUI v4, MUI v7, etc. (P8)

## Known Bugs / Issues

1. **Dead `sortedMembers` variable in members.js** ([src/pages/members.js:150](src/pages/members.js#L150)): `sortedMembers` is computed on line 143 but the render at line 150 uses `groupedMembers[level]` directly (already sorted by the `useMemo`). The `sortMembers` function and its call are dead code — duplicates the memoized sort.

2. ~~**`level5` header undefined**~~ — resolved: `level5` removed from `levelOrder` and `levelLabels` entirely (no members in that category).

3. **addCalendar save does not work** — multiple issues in [src/pages/addCalendar.js](src/pages/addCalendar.js) and [src/pages/api/submit.js](src/pages/api/submit.js):
   - Missing `LocalizationProvider` + `AdapterDayjs` wrapper for MUI `DatePicker` — picker fails without it
   - `submit.js` uses `await req.body` but Pages Router body is synchronous; should be `req.body`
   - `NextResponse` imported from `next/server` in a Pages Router handler — unused, remove it
   - Client checks `if (result != null)` which is always true; should check `response.ok`
   - Form-level `onChange` cascade: changing color/time select triggers the else branch in `handleOnChange` and resets `time` to `'all day'`

## Admin Workflow

1. Log in at `/login` with Firebase credentials
2. Manage events at `/manageCalendar` (view, delete)
3. Add events at `/addCalendar`
4. Edit events at `/editCalendar`
5. After member DB changes, use the "Refresh view" button on `/members` or trigger ISR via `/api/refresh-members`

## Profile Images

- Store member photos in `/public/profile/` named exactly as the `img` column value in the DB.
- If `img` is null, falls back to `ui-avatars.com` generated avatar using the member's display name.

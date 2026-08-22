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
| Image processing | `sharp` — resize to 500×500, grayscale conversion |
| File uploads | `formidable` — multipart/form-data parsing in Pages Router API routes |
| Blob storage | `@vercel/blob` — profile photo storage (persists across deployments) |
| Deployment | Vercel (with Speed Insights) |

## Environment Variables

```
# Production (Vercel Postgres)
VERCELDB_URL=

# ISR revalidation
REVALIDATE_SECRET=

# Vercel Blob (profile photos + future file sharing)
BLOB_READ_WRITE_TOKEN=       # from Vercel dashboard → Storage → Blob store

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

## Active Migration — Phase 4.5

**[MIGRATION-Phase4.5-MemberDataModel.md](MIGRATION-Phase4.5-MemberDataModel.md) — read this before touching `centurymember` or any member API route.**

The schema below is the **current** state. Phase 4.5 extends it: a new `household` table, nine new `centurymember` columns, `email`/`phone` widened, and `status` replacing `is_active` as the source of truth (`is_active` becomes a generated column). The migration doc has the full DDL, the merge procedure against `raw/century/Century_Membership_List.xlsx`, and per-step verification.

Planning and rationale live in the vault: `D:\MJData\zettelkasten\projects\Century\MemberData-Model-Merge-WorkPackage.md`.

## Database Schema

### `centurymember`
```sql
member_id INTEGER PK (seq starts 1000)
name          VARCHAR(100)
img           VARCHAR(255)         -- legacy: bare filename served from /public/profile/
                                   -- new uploads: full Vercel Blob URL (starts with https://)
                                   -- profilePicture logic handles both: if startsWith('http') use as-is, else prepend /profile/
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
    admin.js             # Admin panel (protected) — tiles: Calendar, Send Message, Refresh DB, Manage Members
    addCalendar.js       # Add event (protected)
    editCalendar.js      # Edit event (protected)
    manageCalendar.js    # Manage/delete events (protected)
    manageMembers.js     # Search + edit member info + upload profile photo (protected)
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
      search-member.js   # GET /api/search-member?q= — name search, returns matching centurymember rows
      update-member.js   # POST multipart — update member fields + process/upload photo to Vercel Blob
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
  profile/              # Legacy member profile photos (bare filenames). New uploads go to Vercel Blob.
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
1. ✅ Bug fixes (complete 2026-06-21)
2. Auth upgrade — keyword-gated Google login + role system
3. Calendar management UX — unified add/edit/delete
4. Google Maps for practice locations
4.5. **Member data model + membership list merge** — [MIGRATION-Phase4.5-MemberDataModel.md](MIGRATION-Phase4.5-MemberDataModel.md). Blocks Phase 5.
5. New membership sign-up form (`/join`) — household + waiver, built on the Phase 4.5 model
6. PWA push notifications with admin compose page
7. XLSX member data import with diff preview — reuses the Phase 4.5 merge script's matching/precedence logic
8. Admin file sharing via Vercel Blob (Blob infrastructure already used by Manage Members photo upload)
9. Library modernization — DaisyUI v4, MUI v7, etc.

**Manage Members** (between Phase 1 and Phase 2, implemented 2026-06-21):
- `/admin` → new "Manage Members" tile → `/manageMembers`
- Search by name/Korean name/preferred name
- Edit all member fields inline
- Upload profile photo: auto-resized to 500×500 grayscale JPEG, stored in Vercel Blob
- Save triggers ISR revalidation of `/members` for immediate reflection

## Known Bugs / Issues

**OPEN — `manageMembers.js` silently rewrites ranks.** `LEVEL_OPTIONS` ([src/pages/manageMembers.js:3-13](src/pages/manageMembers.js#L3-L13)) offers `3 Dan` … `5 Kyu` only, but the live table also holds `4 Dan` (1 member), `6 Kyu` (4) and `7 Kyu` (7). Opening any of those 12 members and saving writes back the select's fallback value, destroying their rank. Fix is Step 1 of the Phase 4.5 migration — do it before any bulk member editing.

**OPEN — `email VARCHAR(20)` is truncating.** The longest live value is exactly 20 characters and the membership spreadsheet has addresses up to 26. Data has already been lost. Widened in Phase 4.5 Step 2.

**OPEN — `/api/members` fetches every row then filters in JS.** [api/members.js:14](src/pages/api/members.js#L14) and [members.js:157](src/pages/members.js#L157) both do `rows.filter(row => row.is_active)`. The endpoint is public and unauthenticated; once Phase 4.5 adds addresses, DOBs and phone numbers, this pattern is one careless edit away from leaking PII for 58 people, 25 of them minors. Move the filter into SQL — Phase 4.5 Step 7.

All Phase 1 bugs resolved as of 2026-06-21:
- ~~Dead `sortedMembers` variable~~ — removed; render uses `groupedMembers` directly
- ~~`level5` header undefined~~ — `level5` removed from `levelOrder` and `levelLabels`
- ~~addCalendar save broken~~ — `LocalizationProvider` added, `req.body` fix, `NextResponse` removed, `response.ok` check, `handleOnChange` guarded on `event.target.name !== 'title'`

## Admin Workflow

1. Log in at `/login` with Firebase credentials
2. Manage events at `/manageCalendar` (view, delete)
3. Add events at `/addCalendar`
4. Edit events at `/editCalendar`
5. Manage members at `/manageMembers` — search by name, edit fields, upload photo
6. After member DB changes, use the "Refresh view" button on `/members` or trigger ISR via `/api/refresh-members`

## Profile Images

**Legacy (existing photos):** bare filenames in `img` column (e.g., `derek lee.jpg`), served from `/public/profile/`.

**New uploads (Manage Members feature):** full Vercel Blob URL stored in `img` column. The `profilePicture` resolution guard in both `api/members.js` and `members.js` (getStaticProps) handles both:
```js
const profilePicture = row.img
  ? (row.img.startsWith('http') ? row.img : `/profile/${row.img}`)
  : `https://ui-avatars.com/api/?name=${encodeURIComponent(row.altname || row.name)}&background=random`;
```

**Upload pipeline (POST /api/update-member):**
1. `formidable` parses multipart/form-data → file buffer
2. `sharp` resizes to 500×500px, converts to grayscale JPEG
3. `@vercel/blob` `put()` uploads buffer with path `profile/firstname lastname.jpg` (lowercased, space-separated from `name`/`altname`)
4. Returned blob URL stored in `centurymember.img`
5. `res.revalidate('/members')` clears ISR cache so members page reflects the change immediately

**Blob path convention:** `profile/<firstname> <lastname>.jpg` — all lowercase, first+last of the display name (`altname` if set, else `name`).

# Migration — Phase 4.5: Member Data Model & Membership List Merge

**Status:** In progress (2026-08-22).

| Step | State |
|---|---|
| 0 — backup + baseline build | done. `backup/centurymember-20260822.sql`, 55 rows (no `pg_dump` on this machine — `scripts/backup-members.js` writes the same column-INSERT format). |
| 1 — `LEVEL_OPTIONS` | done. Ladder extended 5 Dan → 7 Kyu, plus a `levelOptions` guard that keeps an unrecognized stored rank selectable. |
| 2 — schema migration | done. `migrations/001_household_and_member_fields.sql` applied to Vercel Postgres by hand. Verified: status 47 active / 8 inactive, `is_active` `is_generated = ALWAYS` and agreeing, email 255 / phone 20, both check constraints and the household FK present, `household` empty. |
| 3 — merge dry run | done, re-run post-migration against the real columns: 46 matched, 291 field changes, 9 DB-only, 12 XLSX-only, 0 truncations. Report at `reports/merge-2026-08-22.md`. |
| 4 — adjudication | done. Recorded in `scripts/merge-overrides.json`: keep all 9 DB-only rows; insert all 12 XLSX-only rows including both 김하랑 (deliberately not paired to the existing 1044/1059 — the club dedupes by hand later); 박홍기 dob corrected 2025-08-25 → 1977-08-25; 유현규 recorded as adult (no dob on file). |
| 5 — apply | done. 46 updates + 12 inserts (member_id 1073–1084) in one transaction. Table now 67 rows / 59 active. dob 3→56, gender 0→56, email 4→23, phone 4→43, height 24, occupation 8. Every pre-existing rank preserved. Re-run is clean: 0 updates, 0 inserts. |
| 6 — households | not started. Clusters previewed in the report (27 addresses, 12 multi-member, 35 people); the plan requires the club to confirm them before they drive anything user-visible. |
| 7 — application changes | done. `npm run build` green against the migrated schema; `/members` prerenders 47 cards and the payload no longer carries `is_active`. Not yet deployed. |

**Only 2 of the 291 merged changes overwrote a populated DB value:** a phone reformatted
(`6043568893` → `604-356-8893`, same number) and one dob differing by ten days
(`1971-01-29` → `1971-01-19`, spreadsheet wins per the precedence table). The other 289 were
fills into empty columns.

**The workbook's other tabs are redundant, not additional.** `A` (52 rows) and `Family` (52) are
strict subsets of `ㄱ` (58) keyed on hangeul — zero rows in either that `ㄱ` lacks, while `ㄱ`
holds 5 people `A` omits (박윤희, 김이연, 김태이, 김하준, 김유훈). They are stale re-sorted views of
the same roster, so parsing `ㄱ` only loses nothing. `Sheet3` is empty.

**Correction to the profile below:** the dry run matches **46**, not 47. Excluding the doubled `김하랑` on each side gives 7 real DB-only and 10 real XLSX-only rows — exactly as stated below — but the matched count cannot also include a 김하랑 pair. 46 + 9 = 55 and 46 + 12 = 58 reconcile; 47 + 7 = 54 did not.

**Why:** the live `centurymember` table and `D:\MJData\zettelkasten\raw\century\Century_Membership_List.xlsx` hold complementary halves of the same ~58 people. The DB has rank, photo and status; the spreadsheet has address, phone, email, DOB, gender, height and occupation — most of which have no column to land in, and two of which do not fit the columns that exist. This migration extends the model, merges both sources, derives the household grouping the paper application implies, and leaves a schema the `/join` intake form can be built on.

**Planning context and the reasoning behind these choices:** `D:\MJData\zettelkasten\projects\Century\MemberData-Model-Merge-WorkPackage.md`. This file is the executable half; that one is the analysis.

---

## Profile as of 2026-08-22

Measured, not assumed — re-run the profile if significant time has passed.

| | Live DB | XLSX (`ㄱ` sheet) |
|---|---|---|
| rows | 55 (47 active, 28 adult, 10 with guardian) | 58 |
| `hangeul` | 55/55, 54 distinct | 58/58, 57 distinct |
| `level` / rank | 40/55 | 6/58 |
| `img` | 54/55 | — |
| email | 4/55 | 21/58 |
| phone / cell | 4/55 | 40/58 |
| address | 4/55 | 48/58 (+city, province, postal) |
| `dob` | 3/55 | 54/58 |
| gender / height / occupation | no column | 56 / 24 / 8 |

**Match on normalized `hangeul`: 47 matched, 7 DB-only (5 active), 10 XLSX-only.** Romanized-name matching rescues none of the 17 — they need human adjudication, not a better algorithm.

The `A` and `Family` sheets are the same 52 people re-sorted and are a strict subset of `ㄱ`. **Parse `ㄱ` only.** Headers are on **row 2**; data starts on **row 3**; `max_row` reports 140 but only 58 rows carry data.

---

## Step 0 — Preconditions

```bash
# From D:\workspace\js\centurynew
npm install            # ensure pg, openpyxl-equivalent (xlsx) available
npm run build          # confirm the tree is green BEFORE changing anything
```

Take a backup of the two tables you are about to touch. Vercel Postgres has PITR, but a local dump is faster to reason about:

```bash
pg_dump "$VERCELDB_URL" --table=centurymember --data-only --column-inserts > backup/centurymember-$(date +%Y%m%d).sql
```

Verify the backup is non-empty and contains 55 `INSERT` lines before continuing.

---

## Step 1 — Fix `LEVEL_OPTIONS` first (do not skip)

**File:** [src/pages/manageMembers.js](src/pages/manageMembers.js) lines 3–13.

The dropdown offers `3 Dan` down to `5 Kyu` only. The live table also contains **`4 Dan` (1 member), `6 Kyu` (4 members) and `7 Kyu` (7 members)** — 12 people whose rank the form cannot represent. Opening any of them and saving writes back whatever the select fell back to, silently destroying their rank.

This must land before anyone edits members during the merge, or the merge's own admin work corrupts data.

```js
const LEVEL_OPTIONS = [
  { value: '4 Dan', label: '4 Dan' },
  { value: '3 Dan', label: '3 Dan' },
  { value: '2 Dan', label: '2 Dan' },
  { value: '1 Dan', label: '1 Dan (Shodan)' },
  { value: '1 Kyu', label: '1 Kyu' },
  { value: '2 Kyu', label: '2 Kyu' },
  { value: '3 Kyu', label: '3 Kyu' },
  { value: '4 Kyu', label: '4 Kyu' },
  { value: '5 Kyu', label: '5 Kyu' },
  { value: '6 Kyu', label: '6 Kyu' },
  { value: '7 Kyu', label: '7 Kyu' },
  { value: '', label: 'Beginner / No rank' },
];
```

**Better still**, make this data-driven so it cannot drift again — derive the option list from `SELECT DISTINCT level FROM centurymember` merged with the canonical ladder, or move the ladder to `src/content/home.md`. At minimum, add a guard in `selectMember` that appends an unrecognized `member.level` as an extra option rather than dropping it.

**Verify:** open a `7 Kyu` member, save without changing anything, confirm `level` is still `7 Kyu` in the DB.

---

## Step 2 — Schema migration

Create `migrations/001_household_and_member_fields.sql` with the following. It is additive and safe to run with the site up; the one destructive-looking part (dropping `is_active`) is covered below.

```sql
BEGIN;

-- ---------------------------------------------------------------
-- household — one row per address, matching the paper application:
-- one street/city/province/postal, one primary contact, one signature
-- covering the whole family.
-- ---------------------------------------------------------------
CREATE SEQUENCE public.household_id_seq
    START WITH 100 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.household (
    household_id       integer NOT NULL DEFAULT nextval('household_id_seq'),
    street             VARCHAR(120),
    city               VARCHAR(60),
    province           VARCHAR(2) DEFAULT 'BC',
    postal_code        VARCHAR(10),
    primary_phone      VARCHAR(20),
    primary_email      VARCHAR(255),
    waiver_version     VARCHAR(20),
    waiver_accepted_at timestamp without time zone,
    waiver_signed_by   VARCHAR(100),
    last_update        timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT household_id_pk PRIMARY KEY (household_id)
);

ALTER SEQUENCE public.household_id_seq OWNED BY public.household.household_id;

-- last_updated() already exists (created in table.sql for the event table)
CREATE TRIGGER last_updated BEFORE UPDATE ON public.household
    FOR EACH ROW EXECUTE PROCEDURE last_updated();

-- ---------------------------------------------------------------
-- centurymember — new columns
-- ---------------------------------------------------------------
ALTER TABLE public.centurymember
    ADD COLUMN household_id   integer REFERENCES public.household(household_id) ON DELETE SET NULL,
    ADD COLUMN last_name      VARCHAR(60),
    ADD COLUMN first_name     VARCHAR(60),
    ADD COLUMN gender         CHAR(1),
    ADD COLUMN height_cm      smallint,
    ADD COLUMN occupation     VARCHAR(60),
    ADD COLUMN dan_issue_date DATE,
    ADD COLUMN applied_date   DATE,
    ADD COLUMN notes          TEXT,
    ADD COLUMN status         VARCHAR(20);

-- Widen the two columns that cannot hold real data.
-- email is ALREADY truncating: the longest live value is exactly 20 chars.
ALTER TABLE public.centurymember
    ALTER COLUMN email TYPE VARCHAR(255),
    ALTER COLUMN phone TYPE VARCHAR(20);

-- Backfill status from is_active BEFORE constraining it.
UPDATE public.centurymember
   SET status = CASE WHEN is_active THEN 'active' ELSE 'inactive' END;

ALTER TABLE public.centurymember
    ALTER COLUMN status SET NOT NULL,
    ALTER COLUMN status SET DEFAULT 'active';

ALTER TABLE public.centurymember
    ADD CONSTRAINT centurymember_status_chk
        CHECK (status IN ('active','inactive','pending')),
    ADD CONSTRAINT centurymember_gender_chk
        CHECK (gender IS NULL OR gender IN ('M','F'));

-- status becomes the source of truth; is_active is kept as a derived
-- column so every existing read query keeps working untouched.
ALTER TABLE public.centurymember DROP COLUMN is_active;
ALTER TABLE public.centurymember
    ADD COLUMN is_active boolean GENERATED ALWAYS AS (status = 'active') STORED;

CREATE INDEX idx_centurymember_household ON public.centurymember(household_id);
CREATE INDEX idx_centurymember_status    ON public.centurymember(status);

COMMIT;
```

### Why `status` replaces `is_active`

The intake form needs a third state (`pending`). A second boolean beside `is_active` would drift against it within a release. Making `status` authoritative and `is_active` generated means **read** queries — `api/members.js`, `members.js` `getStaticProps`, `api/search-member.js` — need no change at all. Only the single **writer** does (Step 6).

Dropping and re-adding `is_active` moves it to the end of the column order. That is safe here because every query in the repo names its columns explicitly; there is no `SELECT *`. Confirm that is still true before running:

```bash
grep -rn "SELECT \*" src/
```

### Why `applied_date` exists

The DB's `start_date` and the spreadsheet's `Date` column **disagree on 34 of the 47 matched rows**. The likeliest explanation is that they measure different things — application signing vs. first practice — in which case both are correct. Rather than force a ruling now and lose one of them, the migration keeps both: `start_date` stays as-is from the DB, and the spreadsheet's value lands in `applied_date`.

Decide later which one `/members` should display as "Since". Until then no data is lost either way.

**Note:** `centurymember` has no `last_updated` trigger (only `event` does); `update-member.js` sets `last_update = now()` by hand. Adding the trigger here would be an improvement but changes behaviour, so it is deliberately left out of this migration.

### Verify Step 2

```sql
\d public.household
\d public.centurymember
SELECT count(*) FROM centurymember;                        -- still 55
SELECT status, count(*) FROM centurymember GROUP BY status; -- active 47, inactive 8
SELECT count(*) FROM centurymember WHERE is_active;         -- 47 — generated column agrees
```

Then `npm run build` and load `/members` on a preview deployment. The member list must be byte-identical to before.

---

## Step 3 — Merge script (dry run)

Create `scripts/merge-membership-xlsx.js`. Node, uses the repo's existing `pg` plus `xlsx` (SheetJS — add it: `npm i -D xlsx`).

**Invocation:**

```bash
node scripts/merge-membership-xlsx.js --xlsx "D:\MJData\zettelkasten\raw\century\Century_Membership_List.xlsx"
# writes reports/merge-YYYY-MM-DD.md and touches nothing
node scripts/merge-membership-xlsx.js --xlsx "..." --apply
# applies, inside one transaction, only after the report is reviewed
```

### Parsing

Sheet `ㄱ` only, header row 2, data from row 3. Column order is fixed:

| Col | Header | Maps to |
|---|---|---|
| A | (row number) | ignore |
| B | Last Name | `last_name` |
| C | First Name | `first_name` |
| D | 이름 | `hangeul` — the match key |
| E | Address | `household.street` |
| F | City | `household.city` |
| G | Province | `household.province` |
| H | Postal Code | `household.postal_code` |
| I | Cell | `phone` (and `household.primary_phone`) |
| J | Email | `email` (and `household.primary_email`) |
| K | Occupation | `occupation` |
| L | Dan | `level` — **only if DB `level` is blank** |
| M | Issue Date of Dan | `dan_issue_date` |
| N | Hight (Cm) | `height_cm` |
| O | Birthday | `dob` |
| P | Gender | `gender` |
| Q | Date | `applied_date` |

Column L holds a bare number (`1`, `2`, `3`); render it as `"<n> Dan"` to match the DB's `level` format.

### Matching

Normalize `hangeul` by trimming and stripping internal whitespace, then match. **`김하랑` appears twice in both sources** — a duplicated key on either side must be reported as unmatched and never merged into an arbitrary one of the two. Confirm - she is the same person.

### Precedence

| Fields | Winner |
|---|---|
| `level`, `img`, `status`, `is_adult`, `guardian_id`, `altname` | **DB** — never overwritten by the spreadsheet |
| `last_name`, `first_name`, `gender`, `height_cm`, `occupation`, `dan_issue_date`, `dob`, `phone`, `email`, `applied_date`, household address fields | **XLSX** |
| `start_date` | **DB** — the spreadsheet's value goes to `applied_date` instead |

**A blank spreadsheet cell never overwrites a populated DB value.** This is the single rule that keeps the merge from destroying the DB's 4 existing emails and 40 populated ranks.

### Report format

`reports/merge-YYYY-MM-DD.md`, containing:

1. **Summary counts** — matched, to-update, unchanged, unmatched each way.
2. **Per-member field diffs** — one table per member: `field | DB value | XLSX value | action`. Include only fields that would change.
3. **Unmatched rows** — the 7 DB-only and 10 XLSX-only, each with enough identifying detail to adjudicate.
4. **Duplicate-key rows** — `김하랑` on both sides.
5. **Truncation warnings** — any value longer than its target column, which after Step 2 should be none.

### Verify Step 3

The dry run writes no rows: `SELECT max(last_update) FROM centurymember` is unchanged after running it. Report counts must reconcile — matched + DB-only = 55, matched + XLSX-only = 58.

---

## Step 4 — Adjudicate (human, blocking)

Nothing below this line runs until these are settled. Record the decisions in the work package's **Open decisions** section so they are not re-litigated.

1. **The 17 unmatched rows.** Are the 7 DB-only members (5 of them active) people never added to the spreadsheet, and the 10 XLSX-only members people never added to the DB? Each needs a call: create, retire, or manually pair.
2. **`김하랑` × 2 on both sides.** Two different people, or one person entered twice? > It is one person.
3. **`applied_date` vs `start_date`.** Confirm the interpretation above, or rule that one source wins and the other is discarded.

Feed the resolutions back as an explicit override file (`scripts/merge-overrides.json`) mapping spreadsheet row → member_id, so the apply pass is reproducible rather than depending on a one-off manual edit.

---

## Step 5 — Apply

```bash
node scripts/merge-membership-xlsx.js --xlsx "..." --overrides scripts/merge-overrides.json --apply
```

One transaction. On any per-row error, roll the whole thing back — a half-merged table is worse than an unmerged one.

**Verify:**

```sql
SELECT max(length(email)), max(length(phone)) FROM centurymember;  -- within the new caps
SELECT count(*) FROM centurymember WHERE dob IS NOT NULL;          -- ~46 (was 3)
SELECT count(*) FROM centurymember WHERE gender IS NOT NULL;       -- ~45
SELECT level, count(*) FROM centurymember GROUP BY level;          -- unchanged from Step 2
```

Then re-run the dry run: the report must come back empty. If it does not, the merge is not idempotent and something is being rewritten on every pass.

---

## Step 6 — Household derivation

Cluster spreadsheet rows on normalized `street` + `postal_code`. Expect **26 distinct addresses, 11 of them with more than one member** (three of 2, five of 3, three of 4 — 33 people total). 10 rows have no address and get no household.

Insert one `household` row per cluster, set `centurymember.household_id`, and copy the cluster's cell/email into `primary_phone` / `primary_email`.

Leave `waiver_*` NULL for existing members — they signed on paper, and back-dating a digital acceptance record would misrepresent what happened. Only `/join` submissions populate those fields.

**Have the club confirm the clusters before they drive anything user-visible.** A shared address is strong evidence of a family, not proof.

**Verify:** every member with an address has a `household_id`; the 11 multi-person households contain exactly 33 members.

```sql
SELECT h.household_id, count(m.member_id) AS members
FROM household h JOIN centurymember m USING (household_id)
GROUP BY 1 HAVING count(m.member_id) > 1 ORDER BY 2 DESC;
```

---

## Step 7 — Application changes

### `src/pages/api/update-member.js` — the only required change

Line 35 reads `is_active` from the form and lines 71–81 write it. `is_active` is now generated and **cannot be written** — this route will throw until it is changed.

- Replace the `is_active` field with `status`.
- Add the new editable fields: `last_name`, `first_name`, `gender`, `height_cm`, `occupation`, `dan_issue_date`, `household_id`, `notes`.
- Keep the existing `imgValue` conditional-append pattern; it extends cleanly.

### `src/pages/api/members.js` and `src/pages/members.js` — privacy hardening

Both run the same query ([api/members.js:11](src/pages/api/members.js#L11), [members.js:153](src/pages/members.js#L153)) and both then filter with `rows.filter(row => row.is_active)` in JavaScript.

That is now a data-exposure risk: `/api/members` is **public and unauthenticated**, and the table has just gained home addresses, dates of birth and phone numbers for 58 people, **25 of them minors**. Fetching every row and filtering in JS means one careless `SELECT *` or one added field in the returned object ships PII to the world.

Change both to filter in SQL and keep the explicit column list:

```sql
SELECT member_id, name, img, hangeul, altname, level,
       to_char(start_date::date, 'YYYY-MM-DD') AS start_date
FROM centurymember
WHERE status = 'active'
```

**The rule going forward: adding a column to `centurymember` must never widen a public endpoint.** Add a test that asserts the exact key set returned by `/api/members`, so a future field addition fails CI instead of leaking.

### `src/pages/api/search-member.js` and `src/pages/manageMembers.js` — admin surface

Add the new fields to the select list and the edit form, plus a household picker. This endpoint returns PII by design and must sit behind the Phase 2 auth work; until that lands, `manageMembers` is protected only by client-side `PrivateRoute`, which is bypassable. **Do not link it publicly.**

---

## Step 8 — `/join` intake form

Only after everything above is green. Roadmap Phase 5, rewritten against this model:

1. Public `/join` page, Google sign-in, no invite keyword.
2. **Household block, entered once:** street, city, province, postal, primary cell, primary email.
3. **Person block, repeatable** — applicant plus up to four family members, mirroring `CKC_Membership_V0.docx`: last name, first name, 한글, height, birthday, M/F.
4. **Waiver** — the bilingual liability release from the docx, verbatim in both English and Korean, explicit checkbox required. Record `waiver_version` and `waiver_accepted_at` on the household.
5. Submit → one `household` row + N `centurymember` rows at `status='pending'`.
6. `/admin` gains a Pending Members section: approve sets `status='active'`, reject deletes.

The waiver is the condition of membership, not decoration. Do not ship the form without it.

---

## Rollback

Step 2 is the only structurally irreversible step, and only because `is_active` is dropped and re-added. To reverse:

```sql
BEGIN;
ALTER TABLE public.centurymember DROP COLUMN is_active;
ALTER TABLE public.centurymember ADD COLUMN is_active boolean;
UPDATE public.centurymember SET is_active = (status = 'active');
ALTER TABLE public.centurymember ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE public.centurymember
    DROP COLUMN household_id, DROP COLUMN last_name, DROP COLUMN first_name,
    DROP COLUMN gender, DROP COLUMN height_cm, DROP COLUMN occupation,
    DROP COLUMN dan_issue_date, DROP COLUMN applied_date, DROP COLUMN notes,
    DROP COLUMN status;
DROP TABLE public.household;
COMMIT;
```

The widened `email` and `phone` types are left alone — narrowing them back would truncate data again.

Steps 5–6 are reversed from the Step 0 backup, not by script.

---

## Session handoff

At the end of a work session on this migration, run `/ingest` in the zettelkasten vault (`D:\MJData\zettelkasten`) to export the session and promote durable knowledge to `LLM/mireutech/century-kumdo-site.md`. Update the **Status** line at the top of this file and the work package's status before you do.

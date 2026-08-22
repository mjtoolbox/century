-- Instructors appear on /instructors (static content in src/content/home.md) and
-- should not also be listed in the member directory. A flag on the row, rather
-- than member ids hardcoded in the query, so the club can maintain it from
-- Manage Members without a deploy.
--
--   1075 박홍기 Hong Ki Park  → "Honggi Park" on the instructors page
--   1080 유현규 Hyun Gyu Ryu  → "Hyunkyu Ryu" on the instructors page
--
-- They stay active members: only the directory listing changes.

BEGIN;

ALTER TABLE public.centurymember
    ADD COLUMN is_instructor boolean NOT NULL DEFAULT false;

UPDATE public.centurymember
   SET is_instructor = true, last_update = now()
 WHERE member_id IN (1075, 1080);

CREATE INDEX idx_centurymember_instructor ON public.centurymember(is_instructor);

COMMIT;

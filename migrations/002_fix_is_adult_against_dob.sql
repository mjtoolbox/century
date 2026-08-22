-- Phase 4.5 Step 6a — correct is_adult where it contradicts the birthday imported
-- in Step 5. is_adult means legal age 18+ (confirmed 2026-08-22).
--
--   1026 김성희   born 1973-03-24, age 53 — was minor
--   1005 조아라미르 born 2007-03-13, age 19 — was minor (aged out, flag never updated)
--   1030 이소희   born 2016-10-03, age  9 — was adult
--
-- Scoped to rows with a known dob, so members without one keep their current flag.

BEGIN;

UPDATE public.centurymember
   SET is_adult = (date_part('year', age(dob)) >= 18),
       last_update = now()
 WHERE dob IS NOT NULL
   AND is_adult <> (date_part('year', age(dob)) >= 18);

COMMIT;

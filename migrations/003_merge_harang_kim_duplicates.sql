-- Phase 4.5 follow-up — resolve the four 김하랑 rows. Club adjudication 2026-08-22:
--   1059 (Harang Kim) and 1073 (Amy Harang Kim) are the SAME person.
--   1044 (Emma Kim) is a DIFFERENT person and is left untouched.
--   1084 (Kim) is incomplete data and is removed.
--
-- 1059 is kept as the survivor: it is the older row, it carries the profile photo
-- and the start_date, and 1073 has neither. 1073's spreadsheet-sourced fields are
-- folded into it first, then 1073 is deleted.
--
-- Neither 1073 nor 1084 is referenced as a guardian_id, so no repointing is needed.

BEGIN;

-- Fold 1073's data into 1059, without disturbing what 1059 already holds.
UPDATE public.centurymember AS keep
   SET last_name    = COALESCE(keep.last_name,    dup.last_name),
       first_name   = COALESCE(keep.first_name,   dup.first_name),
       gender       = COALESCE(keep.gender,       dup.gender),
       height_cm    = COALESCE(keep.height_cm,    dup.height_cm),
       occupation   = COALESCE(keep.occupation,   dup.occupation),
       dob          = COALESCE(keep.dob,          dup.dob),
       phone        = COALESCE(keep.phone,        dup.phone),
       email        = COALESCE(keep.email,        dup.email),
       applied_date = COALESCE(keep.applied_date, dup.applied_date),
       household_id = COALESCE(keep.household_id, dup.household_id),
       level        = COALESCE(keep.level,        dup.level),
       last_update  = now()
  FROM public.centurymember AS dup
 WHERE keep.member_id = 1059
   AND dup.member_id  = 1073;

DELETE FROM public.centurymember WHERE member_id = 1073;

-- Incomplete duplicate: hangeul and a birthday, nothing else.
DELETE FROM public.centurymember WHERE member_id = 1084;

COMMIT;

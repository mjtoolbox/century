-- Phase 2 — sign-in accounts and roles, kept separate from centurymember.
--
-- A user is whoever can log in; a member is whoever trains. They overlap but are
-- not the same set: a parent may hold the login for three children, and most
-- members never sign in at all. member_id links the two when it applies.
--
-- google_sub holds the Firebase uid (the `sub` claim of the ID token), which is
-- stable per account regardless of which provider issued it.

BEGIN;

CREATE TABLE public.centuryusers (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    name        VARCHAR(100),
    google_sub  VARCHAR(200) UNIQUE,
    role        VARCHAR(20) NOT NULL DEFAULT 'member',
    member_id   INTEGER REFERENCES public.centurymember(member_id) ON DELETE SET NULL,
    last_update TIMESTAMP DEFAULT now() NOT NULL,
    CONSTRAINT centuryusers_role_chk CHECK (role IN ('member', 'admin'))
);

CREATE INDEX idx_centuryusers_sub  ON public.centuryusers(google_sub);
CREATE INDEX idx_centuryusers_role ON public.centuryusers(role);

CREATE TRIGGER last_updated BEFORE UPDATE ON public.centuryusers
    FOR EACH ROW EXECUTE PROCEDURE last_updated();

COMMIT;

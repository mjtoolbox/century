-- Phase 4.5 Step 2 — household table + centurymember field extension.
-- See MIGRATION-Phase4.5-MemberDataModel.md. Additive except for is_active,
-- which is dropped and re-added as a generated column derived from status.
-- Rollback is in the migration doc.

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

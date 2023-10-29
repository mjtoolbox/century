
----------------------------------------------------
-- DEFINE SEQUENCE, TABLE, PRIMARY KEY CONSTRAINT --
----------------------------------------------------

-------------
-- Event --
-------------
-- Create Sequence. Create a sequence if we need to control start #
-- If no need to control, simple combination of "SERIAL PRIMARY KEY" will do
CREATE SEQUENCE public.event_id_seq
    START WITH 1000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Create Table
CREATE TABLE public.event (
    event_id integer NOT NULL DEFAULT nextval('event_id_seq'),
    title character varying(50) NOT NULL,
    detail character varying(50) NOT NULL,
    time_duration character varying(15) NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    color character varying(50),
    last_update timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT event_id_pk PRIMARY KEY (event_id)
);

-- Alter Table Owner to postgres
ALTER TABLE public.event OWNER TO postgres;

-- Alter Sequence Owned by the table primary key to make it more efficient
-- This means when event table is deleted, automatically delete this sequence.
ALTER SEQUENCE public.event_id_seq OWNED BY public.event.event_id;
-- END OF event --



------------------
-- { New Table} --
------------------
-- Create Sequence
-- Create a sequence if we need to control start #
-- If no need to control, simple combination of "SERIAL PRIMARY KEY" will do

-- Create Table

-- Alter Table Ownder to postgres

-- Alter Sequence Owned by the table primary key to make it more efficient

-- END OF {New Table}--




----------------------------------------------------
----------------- DEFINE RELATIONSHIP --------------
----------------------------------------------------
-- Define relationship after completing the table creation
-- Alter Table Add Foreign Key constraint, Reference, Delete Cascade
-- E.G. Deleting PK in event will delete event_contact record associated with

-- PK event.membershipt_id in event_contact.membershipt_id as FK
--ALTER TABLE ONLY public.event_contact
--    ADD CONSTRAINT event_id_pk FOREIGN KEY (event_id) REFERENCES public.event(event_id) ON DELETE CASCADE;

-- PK {table.pk} in {table.fk} as FK






---------------------------------------------------
---------------- DEFINE FUNCTION ------------------
---------------------------------------------------

--
-- Name: last_updated(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION last_updated() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.last_update = CURRENT_TIMESTAMP;
    RETURN NEW;
END $$;


ALTER FUNCTION public.last_updated() OWNER TO postgres;


---------------------------------------------------
--------------- DEFINE TRIGGER --------------------
---------------------------------------------------
--
-- Name: last_updated; Type: TRIGGER; Schema: public; Owner: postgres
--

-- Add last_updated column to all tables
CREATE TRIGGER last_updated BEFORE UPDATE ON event FOR EACH ROW EXECUTE PROCEDURE last_updated();

--color blue #6495ED (langley), green #8FBC8F (coquitlam), red #DC143C (holiday), neon green #7FFF00 (special event)

INSERT INTO public.event(
	 title, detail, time_duration, start_date, end_date, color)
	VALUES ( 'Langley Lions Society', 'Lions Society West Langley Hall', '7-9pm', '2023-11-01', '2023-11-01', '#6495ED');
INSERT INTO public.event(
	 title, detail, time_duration, start_date, end_date, color)
	VALUES ( 'Coq Harbour View', 'Coquitlam Harbour View Elementary', '7:30-9pm', '2023-11-03', '2023-11-03', '#8FBC8F');
INSERT INTO public.event(
	 title, detail, time_duration, start_date, end_date, color)
	VALUES ( 'BCKF Tornament', 'BCKF Tornament / 검도대회', 'all day', '2023-11-11', '2023-11-11', '#7FFF00');    
INSERT INTO public.event(
	 title, detail, time_duration, start_date, end_date, color)
	VALUES ( 'Remembrance Day', 'Remembrance Day', 'all day', '2023-11-13', '2023-11-13', '#DC143C');        
INSERT INTO public.event(
	 title, detail, time_duration, start_date, end_date, color)
	VALUES ( 'Langley Lions Society', 'Lions Society West Langley Hall', '7-9pm', '2023-11-15', '2023-11-15', '#6495ED');
INSERT INTO public.event(
	 title, detail, time_duration, start_date, end_date, color)
	VALUES ( 'Coq Harbour View', 'Coquitlam Harbour View Elementary', '7:30-9pm', '2023-11-17', '2023-11-17', '#8FBC8F');
INSERT INTO public.event(
	 title, detail, time_duration, start_date, end_date, color)
	VALUES ( 'Langley Lions Society', 'Lions Society West Langley Hall', '7-9pm', '2023-11-20', '2023-11-20', '#6495ED');
INSERT INTO public.event(
	 title, detail, time_duration, start_date, end_date, color)
	VALUES ( 'Langley Lions Society', 'Lions Society West Langley Hall', '7-9pm', '2023-11-22', '2023-11-22', '#6495ED');
INSERT INTO public.event(
	 title, detail, time_duration, start_date, end_date, color)
	VALUES ( 'Coq Harbour View', 'Coquitlam Harbour View Elementary', '7:30-9pm', '2023-11-24', '2023-11-24', '#8FBC8F');
INSERT INTO public.event(
	 title, detail, time_duration, start_date, end_date, color)
	VALUES ( 'Langley Lions Society', 'Lions Society West Langley Hall', '7-9pm', '2023-11-29', '2023-11-29', '#6495ED');

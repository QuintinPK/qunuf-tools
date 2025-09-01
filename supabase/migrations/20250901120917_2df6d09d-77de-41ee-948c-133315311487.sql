-- Drop travel-related tables
-- Drop events table first (has foreign key to trips)
DROP TABLE IF EXISTS public.events CASCADE;

-- Drop trips table
DROP TABLE IF EXISTS public.trips CASCADE;
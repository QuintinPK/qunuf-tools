-- Drop WhatsApp related tables
DROP TABLE IF EXISTS public.whatsapp_messages CASCADE;
DROP TABLE IF EXISTS public.whatsapp_chats CASCADE;
DROP TABLE IF EXISTS public.whatsapp_contacts CASCADE;

-- Drop WhatsApp related function
DROP FUNCTION IF EXISTS public.update_whatsapp_updated_at_column() CASCADE;
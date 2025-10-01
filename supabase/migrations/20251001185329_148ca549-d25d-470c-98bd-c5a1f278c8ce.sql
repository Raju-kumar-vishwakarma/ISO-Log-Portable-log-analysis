-- Fix security warnings by setting search_path for all functions

-- Update logs_search_trigger function with secure search_path
CREATE OR REPLACE FUNCTION logs_search_trigger() 
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.message, '') || ' ' || COALESCE(NEW.source_name, ''));
  RETURN NEW;
END;
$$;

-- Update update_updated_at_column function with secure search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update handle_new_user function with explicit search_path
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'VIEWER'
  );
  RETURN NEW;
END;
$$;
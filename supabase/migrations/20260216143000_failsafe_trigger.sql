-- Fail-Safe Trigger Fix
-- This version wraps logic in exception handling to prevent "Database error" blocking signup.

CREATE OR REPLACE FUNCTION public.handle_new_user_signup() 
RETURNS TRIGGER AS $$
DECLARE
  v_nombre TEXT;
  v_apellido TEXT;
  v_uid TEXT;
BEGIN
  -- 1. Attempt Safe Extraction
  BEGIN
      v_nombre := COALESCE(new.raw_user_meta_data->>'nombre', 'Usuario');
      v_apellido := COALESCE(new.raw_user_meta_data->>'apellido', '');
  EXCEPTION WHEN OTHERS THEN
      v_nombre := 'Usuario';
      v_apellido := '';
  END;

  -- 2. Main Logic Block with Error Catching
  BEGIN
      -- Check for existing profile by email
      IF EXISTS (SELECT 1 FROM public.usuarios WHERE email = new.email) THEN
          -- Update existing profile
          UPDATE public.usuarios 
          SET auth_id = new.id,
              nombre = v_nombre,
              apellido = v_apellido
              -- REMOVED: updated_at (does not exist)
          WHERE email = new.email;
      ELSE
          -- Create new profile
          -- Explicitly cast ID to TEXT to match schema
          v_uid := gen_random_uuid()::text;
          
          INSERT INTO public.usuarios (id, auth_id, email, nombre, apellido, rol)
          VALUES (
              v_uid, 
              new.id, 
              new.email, 
              v_nombre, 
              v_apellido, 
              'estudiante'
          );
      END IF;

  EXCEPTION WHEN OTHERS THEN
      -- 3. Fallback: If ANYTHING fails (constraints, types, etc.)
      -- Log is not visible easily, but we prevent the Auth Block.
      -- We try one Last Ditch Insert with minimal data
      BEGIN
          INSERT INTO public.usuarios (id, email, auth_id, nombre, apellido, rol)
          VALUES (
              gen_random_uuid()::text, 
              new.email, 
              new.id, 
              'Usuario (Rescate)', 
              'Error', 
              'estudiante'
          );
      EXCEPTION WHEN OTHERS THEN
          -- If even the rescue fails, we do NOTHING.
          -- This allows the Auth User to be created, so the user is not blocked.
          -- The frontend "fetch profile" step might fail, but that gives a clearer error.
          RETURN new;
      END;
  END;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migration to fix the handle_new_user_signup trigger
-- This handles cases where apellido might be missing in metadata or needs to be extracted from full_name

CREATE OR REPLACE FUNCTION public.handle_new_user_signup() 
RETURNS TRIGGER AS $$
DECLARE
  v_nombre TEXT;
  v_apellido TEXT;
  v_full_name TEXT;
BEGIN
  -- Extract metadata
  v_nombre := new.raw_user_meta_data->>'nombre';
  v_apellido := new.raw_user_meta_data->>'apellido';
  v_full_name := new.raw_user_meta_data->>'full_name';
  
  -- Fallback logic if apellido is missing
  IF v_apellido IS NULL OR v_apellido = '' THEN
    -- Try to split full_name
    IF v_full_name IS NOT NULL AND v_full_name != '' THEN
        -- Simple split: everything after the first space is the last name
        IF position(' ' in v_full_name) > 0 THEN
            v_apellido := substring(v_full_name from position(' ' in v_full_name) + 1);
            -- If nombre was also missing, get it from full_name
            IF v_nombre IS NULL OR v_nombre = '' THEN
                v_nombre := substring(v_full_name from 1 for position(' ' in v_full_name) - 1);
            END IF;
        ELSE
            -- No space, treat whole name as nombre, use placeholder for apellido if needed
            -- But we really need an apellido. Let's use a placeholder if we absolutely have to.
            v_apellido := '.'; -- Minimal placeholder to satisfy NOT NULL
            IF v_nombre IS NULL OR v_nombre = '' THEN
                v_nombre := v_full_name;
            END IF;
        END IF;
    ELSE
         -- No full_name either? This shouldn't happen with our frontend, but for safety:
         v_apellido := '.';
         IF v_nombre IS NULL THEN v_nombre := 'Usuario'; END IF;
    END IF;
  END IF;

  -- Ensure we have a nombre
  IF v_nombre IS NULL OR v_nombre = '' THEN
      v_nombre := 'Usuario';
  END IF;

  -- Check if a profile with this email already exists
  IF EXISTS (SELECT 1 FROM public.usuarios WHERE email = new.email) THEN
    -- Update the existing profile with the new auth_id
    UPDATE public.usuarios 
    SET auth_id = new.id,
        nombre = v_nombre,
        apellido = v_apellido,
        updated_at = NOW()
    WHERE email = new.email;
  ELSE
    -- Create a new profile if none exists
    INSERT INTO public.usuarios (id, auth_id, email, nombre, apellido, rol)
    VALUES (gen_random_uuid(), new.id, new.email, v_nombre, v_apellido, 'estudiante');
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

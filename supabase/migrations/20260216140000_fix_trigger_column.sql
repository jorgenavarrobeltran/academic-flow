-- Fix for "Database error" caused by missing 'updated_at' column in 'usuarios' table.

CREATE OR REPLACE FUNCTION public.handle_new_user_signup() 
RETURNS TRIGGER AS $$
DECLARE
  v_nombre TEXT;
  v_apellido TEXT;
BEGIN
  -- Extract metadata
  v_nombre := new.raw_user_meta_data->>'nombre';
  v_apellido := new.raw_user_meta_data->>'apellido';
  
  -- Fallback if nombre is null
  IF v_nombre IS NULL OR v_nombre = '' THEN
      v_nombre := 'Usuario';
  END IF;

  -- Check if a profile with this email already exists
  IF EXISTS (SELECT 1 FROM public.usuarios WHERE email = new.email) THEN
    -- Update the existing profile with the new auth_id
    -- REMOVED: updated_at = NOW() because the column does not exist!
    UPDATE public.usuarios 
    SET auth_id = new.id,
        nombre = v_nombre,
        apellido = v_apellido
    WHERE email = new.email;
  ELSE
    -- Create a new profile if none exists
    -- Cast gen_random_uuid() to text because usuarios.id is TEXT
    INSERT INTO public.usuarios (id, auth_id, email, nombre, apellido, rol)
    VALUES (gen_random_uuid()::text, new.id, new.email, v_nombre, v_apellido, 'estudiante');
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Relax the constraint (Safety Net)
-- This ensures that even if apellido is missing, the insert won't fail.
ALTER TABLE public.usuarios ALTER COLUMN apellido DROP NOT NULL;

-- 2. Update the trigger to actually save the data correctly
CREATE OR REPLACE FUNCTION public.handle_new_user_signup() 
RETURNS TRIGGER AS $$
DECLARE
  v_nombre TEXT;
  v_apellido TEXT;
BEGIN
  -- Extract metadata sent by the frontend
  v_nombre := new.raw_user_meta_data->>'nombre';
  v_apellido := new.raw_user_meta_data->>'apellido';
  
  -- Fallback: If nombre is null, default to 'Usuario'
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

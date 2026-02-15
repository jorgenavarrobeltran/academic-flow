-- Migration to decouple public.usuarios from auth.users
-- This allows creating "profile" records for students (e.g. from Excel import) 
-- BEFORE they have actually signed up (auth.users record).

-- 1. Drop the strict foreign key on ID (we want ID to be independent)
ALTER TABLE public.usuarios 
  DROP CONSTRAINT IF EXISTS usuarios_id_fkey;

-- 2. Make ID just a UUID primary key (if not already defaulting to gen_random_uuid, we set it)
ALTER TABLE public.usuarios 
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. Add a new column to link to auth.users (nullable)
ALTER TABLE public.usuarios 
  ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_email_key') THEN
    ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_email_key UNIQUE (email);
  END IF;
END $$;

-- 5. Update RLS policies to work with the new structure
-- Drop old policies first to be clean
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.usuarios;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Users can update own profile" ON public.usuarios;

-- Re-create policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.usuarios
  FOR SELECT USING (true);

-- Allow inserting if you are admin or if accessing your own (future proofing) 
-- For imports, we'll likely use a function or rely on the fact that 'teachers' can insert?
-- Actually, let's allow authenticated users (teachers) to insert students
CREATE POLICY "Authenticated users can insert profiles" ON public.usuarios
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own linked profile" ON public.usuarios
  FOR UPDATE USING (auth_id = auth.uid());

-- 6. Trigger to automatically link auth.users to generated public.usuarios on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_signup() 
RETURNS TRIGGER AS $$
BEGIN
  -- Check if a profile with this email already exists
  IF EXISTS (SELECT 1 FROM public.usuarios WHERE email = new.email) THEN
    -- Update the existing profile with the new auth_id
    UPDATE public.usuarios 
    SET auth_id = new.id,
        updated_at = NOW()
    WHERE email = new.email;
  ELSE
    -- Create a new profile if none exists
    INSERT INTO public.usuarios (id, auth_id, email, nombre, rol)
    VALUES (gen_random_uuid(), new.id, new.email, new.raw_user_meta_data->>'nombre', 'estudiante');
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger (it might be same name, but good to ensure it uses the new logic)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

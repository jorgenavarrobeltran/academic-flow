-- Create a whitelist table for pre-loaded students in a course
CREATE TABLE IF NOT EXISTS public.course_whitelist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_course_whitelist_course_id ON public.course_whitelist(course_id);

-- RLS Policies
ALTER TABLE public.course_whitelist ENABLE ROW LEVEL SECURITY;

-- Teachers can manage the whitelist
CREATE POLICY "Teachers can manage whitelist" ON public.course_whitelist
    FOR ALL
    USING (auth.uid() IN (
        SELECT docente_id FROM public.cursos WHERE id = course_id
    ));

-- Public read access (for the registration form)
CREATE POLICY "Public can read whitelist" ON public.course_whitelist
    FOR SELECT
    USING (true);


const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uzcxsugqrqzmgkabpmli.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6Y3hzdWdxcnF6bWdrYWJwbWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzQxMzQsImV4cCI6MjA4NjUxMDEzNH0.Aa6y-ptoMSKtqly93NYZco5XzADCSkbmaSr9OdL2LsU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const courses = [
    'cur-zisia',
    'cur-ziindia',
    'cur-aisvb',
    'cur-zcpixa',
    'cur-zcpva',
    'cur-zcpvtia',
    'cur-aiindiia',
    'cur-aisia'
];

async function populateWhitelist() {
    console.log('Populating whitelist for all courses...');

    for (const courseId of courses) {
        // 1. Get current students
        const { data: students, error } = await supabase
            .from('inscripciones')
            .select(`
        estudiante_id,
        usuarios (
          nombre,
          apellido
        )
      `)
            .eq('curso_id', courseId);

        if (error) {
            console.error(`Error fetching for ${courseId}:`, error);
            continue;
        }

        console.log(`Processing ${courseId}: ${students.length} students`);

        for (const s of students) {
            if (!s.usuarios) continue;

            const fullName = `${s.usuarios.nombre} ${s.usuarios.apellido || ''}`.trim();

            // Check if already in whitelist
            const { data: existing } = await supabase
                .from('course_whitelist')
                .select('id')
                .eq('course_id', courseId)
                .eq('full_name', fullName)
                .limit(1);

            if (existing && existing.length > 0) {
                console.log(`  Skipping ${fullName} (exists)`);
                continue;
            }

            // Add to whitelist
            const { error: insertError } = await supabase
                .from('course_whitelist')
                .insert({
                    course_id: courseId,
                    full_name: fullName,
                    claimed: false
                });

            if (insertError) {
                console.error(`  Error inserting ${fullName}:`, insertError);
            } else {
                console.log(`  Added ${fullName}`);
            }
        }
    }
}

populateWhitelist();

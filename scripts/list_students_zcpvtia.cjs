
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uzcxsugqrqzmgkabpmli.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6Y3hzdWdxcnF6bWdrYWJwbWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzQxMzQsImV4cCI6MjA4NjUxMDEzNH0.Aa6y-ptoMSKtqly93NYZco5XzADCSkbmaSr9OdL2LsU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const courseId = 'cur-zcpvtia';

async function listStudents() {
    const { data: inscripciones, error } = await supabase
        .from('inscripciones')
        .select(`
      estudiante_id,
      usuarios (
        id,
        nombre,
        apellido,
        email
      )
    `)
        .eq('curso_id', courseId);

    if (error) {
        console.error('Error fetching students:', error);
        return;
    }

    console.log(`Students in ${courseId}: ${inscripciones.length}`);
    inscripciones.forEach(i => {
        const u = i.usuarios;
        if (u) {
            console.log(`- ${u.nombre} ${u.apellido} (${u.email})`);
        } else {
            console.log(`- User not found for ID ${i.estudiante_id}`);
        }
    });
}

listStudents();

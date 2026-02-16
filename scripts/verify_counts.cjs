
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uzcxsugqrqzmgkabpmli.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6Y3hzdWdxcnF6bWdrYWJwbWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzQxMzQsImV4cCI6MjA4NjUxMDEzNH0.Aa6y-ptoMSKtqly93NYZco5XzADCSkbmaSr9OdL2LsU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyCounts() {
    const { data: cursos, error: cursosError } = await supabase
        .from('cursos')
        .select('id, nombre, codigo, grupo');

    if (cursosError) {
        console.error(cursosError);
        return;
    }

    console.log('Course ID | Code | Group | Student Count');
    console.log('--- | --- | --- | ---');

    for (const curso of cursos) {
        const { count, error: countError } = await supabase
            .from('inscripciones')
            .select('*', { count: 'exact', head: true })
            .eq('curso_id', curso.id);

        if (countError) {
            console.error(`Error counting for ${curso.id}:`, countError);
        } else {
            console.log(`${curso.id} | ${curso.codigo} | ${curso.grupo} | ${count}`);
        }
    }
}

verifyCounts();

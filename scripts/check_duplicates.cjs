
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uzcxsugqrqzmgkabpmli.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6Y3hzdWdxcnF6bWdrYWJwbWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzQxMzQsImV4cCI6MjA4NjUxMDEzNH0.Aa6y-ptoMSKtqly93NYZco5XzADCSkbmaSr9OdL2LsU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDuplicateEnrollments() {
    const { data: inscripciones, error } = await supabase
        .from('inscripciones')
        .select(`
      estudiante_id,
      curso_id,
      usuarios (
        id,
        nombre,
        apellido,
        email
      ),
      cursos (
        nombre
      )
    `);

    if (error) {
        console.error(error);
        return;
    }

    // Group by student ID
    const studentMap = {};
    inscripciones.forEach(i => {
        const id = i.estudiante_id;
        if (!studentMap[id]) {
            studentMap[id] = {
                name: `${i.usuarios.nombre} ${i.usuarios.apellido}`,
                courses: []
            };
        }
        studentMap[id].courses.push(i.cursos.nombre);
    });

    // Filter for students with > 1 course
    let found = false;
    for (const id in studentMap) {
        if (studentMap[id].courses.length > 1) {
            console.log(`Student: ${studentMap[id].name}`);
            console.log(`  Enrolled in: ${studentMap[id].courses.join(', ')}`);
            found = true;
        }
    }

    if (!found) {
        console.log('No students found enrolled in multiple courses.');
    }
}

checkDuplicateEnrollments();


const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uzcxsugqrqzmgkabpmli.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6Y3hzdWdxcnF6bWdrYWJwbWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzQxMzQsImV4cCI6MjA4NjUxMDEzNH0.Aa6y-ptoMSKtqly93NYZco5XzADCSkbmaSr9OdL2LsU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listCourses() {
    const { data, error } = await supabase
        .from('cursos')
        .select('id, nombre, codigo, asignatura, grupo');

    if (error) {
        console.error('Error fetching courses:', error);
        return;
    }

    console.log('Available Courses:');
    data.forEach(course => {
        console.log(`- ID: ${course.id}, Name: ${course.nombre}, Code: ${course.codigo}, Group: ${course.grupo}`);
    });
}

listCourses();

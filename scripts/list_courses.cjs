
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseAnonKey = envConfig.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Supabase URL or Anon Key not found in .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listCourses() {
    const { data, error } = await supabase
        .from('cursos')
        .select('id, nombre, codigo, asignatura, grupo, semestre');

    if (error) {
        console.error('Error fetching courses:', error);
        return;
    }

    console.log('Available Courses:');
    data.forEach(course => {
        console.log(`- ID: ${course.id}, Name: ${course.nombre}, Code: ${course.codigo}, Subject: ${course.asignatura}, Group: ${course.grupo}`);
    });
}

listCourses();

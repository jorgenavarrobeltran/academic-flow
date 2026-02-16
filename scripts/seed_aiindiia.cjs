
const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

const supabaseUrl = 'https://uzcxsugqrqzmgkabpmli.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6Y3hzdWdxcnF6bWdrYWJwbWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzQxMzQsImV4cCI6MjA4NjUxMDEzNH0.Aa6y-ptoMSKtqly93NYZco5XzADCSkbmaSr9OdL2LsU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const courseId = 'cur-aiindiia'; // ID for AIINDIIA

const students = [
    "Caliz Catalan Jhaider Jhoell",
    "Diaz Vence Luis Jose",
    "Garizabalo Polo Camilo Andres",
    "Montiel Nuvaez Jesias Adriel",
    "Scott Gonzalez Deimar Andres",
    "Serrano Ruiz Jarith Nicoll",
    "Silva Meriño Pablo Cesar"
];

async function seedStudents() {
    console.log(`Seeding students for course ID: ${courseId}`);

    for (const fullName of students) {
        let parts = fullName.trim().split(/\s+/);

        // Default: First 2 are surnames
        let surnameTokens = parts.slice(0, 2);
        let nameTokens = parts.slice(2);

        const apellido = surnameTokens.join(' ');
        const nombre = nameTokens.join(' ');

        // Email generation
        const firstSurnameWord = surnameTokens[0];
        const baseEmail = `${nombre.charAt(0).toLowerCase()}${firstSurnameWord.toLowerCase()}`;
        const randomSuffix = Math.floor(Math.random() * 1000);
        const email = `${baseEmail}${randomSuffix}@cuc.edu.co`
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/ñ/g, 'n');

        const codigo = `2026${Math.floor(10000 + Math.random() * 90000)}`;

        console.log(`Processing: ${apellido} | ${nombre} -> ${email}`);

        // Check existence
        let userId;
        const { data: existingUsers } = await supabase
            .from('usuarios')
            .select('id')
            .eq('nombre', nombre)
            .eq('apellido', apellido)
            .limit(1);

        if (existingUsers && existingUsers.length > 0) {
            userId = existingUsers[0].id;
            console.log(`User already exists: ${userId}`);
        } else {
            const { data: newUser, error: createError } = await supabase
                .from('usuarios')
                .insert({
                    id: randomUUID(),
                    nombre,
                    apellido,
                    email,
                    codigo,
                    rol: 'estudiante',
                    programa: 'Ingeniería Industrial', // Asumido AIIND -> Industrial
                    semestre: 1,
                    foto_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
                })
                .select()
                .single();

            if (createError) {
                console.error(`Error creating user ${fullName}:`, createError);
                continue;
            }
            userId = newUser.id;
            console.log(`Created user: ${userId}`);
        }

        // Enroll
        const { error: enrollError } = await supabase
            .from('inscripciones')
            .insert({
                curso_id: courseId,
                estudiante_id: userId
            });

        if (enrollError) {
            if (enrollError.code !== '23505') {
                console.error(`Error enrolling ${fullName}:`, enrollError);
            } else {
                console.log(`Already enrolled.`);
            }
        } else {
            console.log(`Enrolled successfully.`);
        }
    }
}

seedStudents();

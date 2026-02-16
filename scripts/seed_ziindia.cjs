
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uzcxsugqrqzmgkabpmli.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6Y3hzdWdxcnF6bWdrYWJwbWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzQxMzQsImV4cCI6MjA4NjUxMDEzNH0.Aa6y-ptoMSKtqly93NYZco5XzADCSkbmaSr9OdL2LsU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const courseId = 'cur-ziindia'; // ID for ZIINDIA

const students = [
    "Alemán Maiguel Daniel Andres",
    "Barrios Pescador Adriana Lucia",
    "Barroso Domínguez Angie Lilianys",
    "Cantillo De La Cruz Olga Patricia",
    "Garcia Rodelo Fabian Jesid",
    "Guillen Caro Moises De Jesus",
    "Maury Gómez Alishon Yaneth",
    "Mejia De Moya Sebastian David",
    "Muñoz Machacon Jesus David",
    "Pacheco Abad Martha Liliana",
    "Padilla Padilla Luzneyvis",
    "Pua Sandoval Jesus Alberto",
    "Rodríguez Conrado Wilmar De Jesús",
    "Sandoval Yepes Paula Andrea"
];

async function seedStudents() {
    console.log(`Seeding students for course ID: ${courseId}`);

    for (const fullName of students) {
        let parts = fullName.trim().split(/\s+/);

        // Special handling for known composite surnames if needed
        // "Cantillo De La Cruz Olga Patricia" -> Cantillo De La Cruz | Olga Patricia
        // Heuristic: If "De" "La" appears, it might be part of surname.
        // But simplistic approach: First 2 tokens are surnames unless specified.

        let surnameTokens = parts.slice(0, 2);
        let nameTokens = parts.slice(2);

        // Manual Fixes for specific cases if detected
        if (fullName.includes("Cantillo De La Cruz")) {
            surnameTokens = ["Cantillo", "De La Cruz"];
            nameTokens = ["Olga", "Patricia"];
        } else if (fullName.includes("Mejia De Moya")) {
            surnameTokens = ["Mejia", "De Moya"];
            nameTokens = ["Sebastian", "David"];
        }

        // Default formatting
        const apellido = surnameTokens.join(' '); // "Barrios Pescador" or "Cantillo De La Cruz" (if fixed above)
        // Wait, join(' ') on ["Cantillo", "De La Cruz"] -> "Cantillo De La Cruz"

        const nombre = nameTokens.join(' ');

        // Generate email
        // firstletterOfName + firstSurname + random
        // nameTokens[0] might be "Olga"
        const firstSurname = surnameTokens[0].replace(/ /g, '');
        const baseEmail = `${nombre.charAt(0).toLowerCase()}${firstSurname.toLowerCase()}`;
        const randomSuffix = Math.floor(Math.random() * 1000);
        const email = `${baseEmail}${randomSuffix}@cuc.edu.co`
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
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
                    id: require('crypto').randomUUID(),
                    nombre,
                    apellido,
                    email,
                    codigo,
                    rol: 'estudiante',
                    programa: 'Ingeniería Industrial', // Asumido ZIINDIA -> Industrial
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

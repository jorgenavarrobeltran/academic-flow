
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uzcxsugqrqzmgkabpmli.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6Y3hzdWdxcnF6bWdrYWJwbWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzQxMzQsImV4cCI6MjA4NjUxMDEzNH0.Aa6y-ptoMSKtqly93NYZco5XzADCSkbmaSr9OdL2LsU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const courseId = 'cur-zisia'; // ID from previous list_courses output

const students = [
    "Arrieta Vasquez Santiago Elias",
    "Brochero Polo Aldair Jose",
    "Bru Tapia Mayerlis Paola",
    "Castro Rodriguez Juan Felipe",
    "Cervantes Ariza Ferney Jose",
    "Contreras Ahumada Henrry Andres",
    "Daza Polo Oscar Daniel",
    "Gutierrez Ariza Anderson David",
    "Leal Hoyos Alexander Andres",
    "Quintero Barrios Juan Sebastian",
    "Santiago Urbay Juan Esteban",
    "Vargas Ortiz Sebastian",
    "Yenery Narváez Vanessa Lorena"
];

async function seedStudents() {
    console.log(`Seeding students for course ID: ${courseId}`);

    for (const fullName of students) {
        // Heuristic: First 2 words are Surnames, rest are Names.
        const parts = fullName.trim().split(/\s+/);

        if (parts.length < 2) {
            console.warn(`Skipping invalid name format: ${fullName}`);
            continue;
        }

        // Default strategy: 2 surnames
        let surnameTokens = parts.slice(0, 2);
        let nameTokens = parts.slice(2);

        // If only 2 or 3 parts, adjust.
        // e.g. "Vargas Ortiz Sebastian" -> Surnames: Vargas Ortiz, Name: Sebastian. (Correct)
        // e.g. "SingleSurname Name" -> Surnames: Single, Name: Name.
        if (parts.length === 2) {
            surnameTokens = [parts[0]];
            nameTokens = [parts[1]];
        } else if (parts.length === 3) {
            // e.g. "Surname1 Surname2 Name" vs "Surname Name1 Name2"
            // Colombian usually has 2 surnames.
            surnameTokens = parts.slice(0, 2);
            nameTokens = parts.slice(2);
        }

        const apellido = surnameTokens.join(' ');
        const nombre = nameTokens.join(' ');

        // Generate email: firstletterOfName + firstSurname + random @cuc.edu.co
        const baseEmail = `${nombre.charAt(0).toLowerCase()}${surnameTokens[0].toLowerCase()}`;
        const randomSuffix = Math.floor(Math.random() * 1000);
        const email = `${baseEmail}${randomSuffix}@cuc.edu.co`.replace(/ñ/g, 'n').replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u');

        // Code
        const codigo = `2026${Math.floor(10000 + Math.random() * 90000)}`;

        console.log(`Processing: ${apellido} | ${nombre} -> ${email}`);

        // Check if user exists (by email, roughly) or create new
        // For simplicity in this seed, we create new or update if exact match logic was here. 
        // But since emails are random, we likely create duplicates if we run multiple times.
        // We check by name combination to avoid creating "Arrieta Vasquez Santiago Elias" twice if he exists.

        let userId;

        // Try to find existing user by checking partial name match or email? 
        // Since email is random, we can't search by it easily unless we stored it.
        // Let's search by full Name + Surname combo?
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
                    programa: 'Ingeniería de Sistemas', // Asumido
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

        // Enroll in course
        const { error: enrollError } = await supabase
            .from('inscripciones')
            .insert({
                curso_id: courseId,
                estudiante_id: userId
            });

        if (enrollError) {
            // Ignore unique constraint violation (already enrolled)
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

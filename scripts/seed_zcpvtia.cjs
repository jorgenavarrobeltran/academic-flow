
const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

const supabaseUrl = 'https://uzcxsugqrqzmgkabpmli.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6Y3hzdWdxcnF6bWdrYWJwbWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzQxMzQsImV4cCI6MjA4NjUxMDEzNH0.Aa6y-ptoMSKtqly93NYZco5XzADCSkbmaSr9OdL2LsU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const courseId = 'cur-zcpvtia'; // ID for ZCPVTIA (Anteproyecto)

const students = [
    "Amortegui Villa Maryuris Paola",
    "Bernal Mendoza Yaiza Yeray",
    "Bernal Osorio Andres Felipe",
    "Blanco Bustos Heidy Del Carmen",
    "Bula Pertuz Leisy Julieth",
    "Camargo Vergara Angie Julieth",
    "Campo Nieves Cesar Augusto",
    "Campo Wilches Nicole Julieth",
    "Cañate Hernandez Maryuris Luz",
    "Castellano Pabon Yessica Paola",
    "Castro Barraza Maria Fernanda",
    "Castro Madera Nelvys",
    "Chamorro Benavidez Jose Daniel",
    "De Leon Pino Katerine",
    "Echeverría Sanchez Juan David",
    "Ferrer Feria Luis Keyner",
    "Herrera Carrillo Jose David",
    "Hurtado Montes Adela Milena",
    "Leon Guette Dayrlin Yuranis",
    "Marquez Rosillo Michael Yordan",
    "Marriaga Castillo Julitza Paola",
    "Martinez Mercado Alfonso Mario",
    "Miranda Martinez Nayerlys Rebeca",
    "Montaño Marin Yennifer",
    "Monterrosa Ochoa Adriana Paola",
    "Moreno Patiño Yisela Fernanda",
    "Mosquera Chala Yuverlys",
    "Negrete Sanabria Ana Eliodora",
    "Parejo Arzuza Alejandro Yair",
    "Pinzon Cabarique Yolanda",
    "Polo Reyes Maria Fernanda",
    "Riquett Polo Yisela Paola",
    "Rivera Villa Emerson Steven",
    "Romero Correa Gina Paola",
    "Suárez Jessurum Olga Lucia",
    "Torres San Juan Beatriz Elena",
    "Velasquez Perez Lina Marcela"
];

async function seedStudents() {
    console.log(`Seeding students for course ID: ${courseId}`);

    for (const fullName of students) {
        let parts = fullName.trim().split(/\s+/);

        let surnameTokens, nameTokens;

        // Special handling
        if (fullName.includes("De Leon Pino")) {
            surnameTokens = ["De", "Leon", "Pino"];
            nameTokens = ["Katerine"];
        } else if (fullName.includes("Torres San Juan")) {
            surnameTokens = ["Torres", "San", "Juan"];
            nameTokens = ["Beatriz", "Elena"];
        } else {
            // Default: First 2 are surnames
            surnameTokens = parts.slice(0, 2);
            nameTokens = parts.slice(2);
        }

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
                    programa: 'Contaduría Pública', // Asumido ZCP -> Contaduría
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


const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

const supabaseUrl = 'https://uzcxsugqrqzmgkabpmli.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6Y3hzdWdxcnF6bWdrYWJwbWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzQxMzQsImV4cCI6MjA4NjUxMDEzNH0.Aa6y-ptoMSKtqly93NYZco5XzADCSkbmaSr9OdL2LsU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const courseId = 'cur-zcpixa'; // ID for ZCPiXA

const students = [
    "Ariza Araujo Edwin Ariel",
    "Barreto Baldovino Carlos Andres",
    "Bolivar Molina Benjamin Joseph",
    "Cantillo Torres Cristian De Jesus",
    "Carmona Moreno Milena Paola",
    "Colon Peralta Katty Julieth",
    "De La Cruz De La Hoz Julio Cesar",
    "Escorcia Vega Aaron De Jesus",
    "Escorcia Villarreal Yainer Jose",
    "Garcia Mendoza Gloria Esthefany",
    "Gomez Avila Sebastián Andres",
    "Granado Castro Duber Enrique",
    "Guette Beltran Jostin Josue",
    "Hernandez Torres Jesus David",
    "Jaimes Gonzalez Andrea Valentina",
    "Lopez Cantillo Daylin Merlene",
    "Lopez Rocha Linda Esther",
    "Mata Mejia Angie Orlanys",
    "Mejía Cervantes Andrea Camila",
    "Mendoza Varela Jesus Daniel",
    "Miranda Orozco Yasbleidy Andrea",
    "Moreno Peluffo Luis Alberto",
    "Narvaez Ojeda Jaime De Jesus",
    "Navarro Rodriguez Karla Maria",
    "Olaya Bolaños Esneider",
    "Ordoñez De Oro Vanessa Alejandra",
    "Palma Jiménez Clarisa Alejandra",
    "Piñeres Rodriguez Stefania Julieth",
    "Rivera Castro Dayana Paola",
    "Rodriguez Audivet Emmanuel David",
    "Rodriguez Orozco Yolanis Prisila",
    "Rodriguez Salcedo Mayerlis",
    "Torregrosa Berdugo Natalia",
    "Valeta Reyes Eva Maria",
    "Vargas Beleño Jonathan De Jesus",
    "Vasquez Ariza Carlos David",
    "Villa Herrera Yeimy Patricia",
    "Zapa Pardo Neyla Ines"
];

async function seedStudents() {
    console.log(`Seeding students for course ID: ${courseId}`);

    for (const fullName of students) {
        let parts = fullName.trim().split(/\s+/);

        let surnameTokens, nameTokens;

        // Special handling
        if (fullName.includes("De La Cruz De La Hoz")) {
            // De La Cruz De La Hoz | Julio Cesar
            surnameTokens = ["De", "La", "Cruz", "De", "La", "Hoz"];
            nameTokens = ["Julio", "Cesar"];
        } else if (fullName.includes("Ordoñez De Oro")) {
            // Ordoñez De Oro | Vanessa Alejandra
            surnameTokens = ["Ordoñez", "De", "Oro"];
            nameTokens = ["Vanessa", "Alejandra"];
        } else {
            // Default: First 2 are surnames
            // Handle single surname cases if any? No, all seem to have 2 surnames or composite.
            surnameTokens = parts.slice(0, 2);
            nameTokens = parts.slice(2);
        }

        const apellido = surnameTokens.join(' ');
        const nombre = nameTokens.join(' ');

        // Email generation
        // First letter of Name + First word of Surname
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

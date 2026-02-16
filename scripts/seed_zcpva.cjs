
const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

const supabaseUrl = 'https://uzcxsugqrqzmgkabpmli.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6Y3hzdWdxcnF6bWdrYWJwbWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzQxMzQsImV4cCI6MjA4NjUxMDEzNH0.Aa6y-ptoMSKtqly93NYZco5XzADCSkbmaSr9OdL2LsU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const courseId = 'cur-zcpva'; // ID for ZCPVA

const students = [
    "Albear Guete Aldemar Rafael",
    "Algarin Monroy Liceth Patricia",
    "Altamar Bonivento Valentina Isabel",
    "Alvarez Ruiz Jhon Freddy",
    "Ariza Romero Adelys",
    "Borré Arrieta Ghiordin Luis",
    "Cabrera Martinez Erika Virgelina",
    "Camargo Varon Alejandra Patricia",
    "Castro Barraza Maria Fernanda",
    "Castro Peña Juan David",
    "Collante Trujillo Kevin Eleiser",
    "Escorcia Mendoza Yeisis Alejandra",
    "Estrada Jiménez Miguel Enrique",
    "Garcia Fragozo Zandy Karolay",
    "González Diaz Mateo De Jesús",
    "Gonzalez Tilano Samuel David",
    "Hernandez Franco Natalia De Jesus",
    "Herrera Gonzalez Angie Paola",
    "Lopez Camargo Heydi Luz",
    "Martinez Arrieta Luis Carlos",
    "Martinez Hernandez Dayana Isabel",
    "Martinez Perez Jendys Breageth",
    "Mauri Montenegro Yandri Paola",
    "Meza Carpintero Mary Luz",
    "Navarro Ramirez Andrea Alexandra",
    "Olaya De La Cruz Isaac Daniel",
    "Paez Ayala Martín Andres",
    "Paez Aycardi Jhon Alexander",
    "Palmera Reyes Fabio Rafael Ahmed",
    "Polo Cuello Maicol Alberto",
    "Polo Narvaez Javier David",
    "Polo Reyes Maria Fernanda",
    "Santiago De Avila Loraine Judith",
    "Tamara Rochell Suleyma Patricia",
    "Torres Pacheco Gabriel Andres",
    "Vega Molinarez Adriana Lucia",
    "Villa Paez Elian Jose",
    "Yancy Fontalvo Greys Yulieth",
    "Zapata Rodriguez Johsman Alberto"
];

async function seedStudents() {
    console.log(`Seeding students for course ID: ${courseId}`);

    for (const fullName of students) {
        let parts = fullName.trim().split(/\s+/);

        let surnameTokens, nameTokens;

        // Special handling
        if (fullName.includes("Olaya De La Cruz")) {
            surnameTokens = ["Olaya", "De", "La", "Cruz"];
            nameTokens = ["Isaac", "Daniel"];
        } else if (fullName.includes("Santiago De Avila")) {
            surnameTokens = ["Santiago", "De", "Avila"];
            nameTokens = ["Loraine", "Judith"];
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
                    programa: 'Contaduría Pública', // Asumido ZCPVA usually Contaduría given ZCP code prefix (maybe?)
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

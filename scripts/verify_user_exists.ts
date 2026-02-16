
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uzcxsugqrqzmgkabpmli.supabase.co';
// WARNING: Hardcoding for this temporary script only. 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6Y3hzdWdxcnF6bWdrYWJwbWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzQxMzQsImV4cCI6MjA4NjUxMDEzNH0.Aa6y-ptoMSKtqly93NYZco5XzADCSkbmaSr9OdL2LsU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkUser() {
    console.log("🔍 Searching for user 'prueba'...");

    // Search by nombre OR apellido containing 'prueba'
    const { data: users, error } = await supabase
        .from('usuarios')
        .select('*')
        .or('nombre.ilike.%prueba%,apellido.ilike.%prueba%,email.ilike.%prueba%');

    if (error) {
        console.error("❌ Error querying database:", error.message);
        return;
    }

    if (!users || users.length === 0) {
        console.log("⚠️  No user found with name/email containing 'prueba'.");
    } else {
        console.log(`✅ Found ${users.length} user(s):`);
        users.forEach(u => {
            console.log("------------------------------------------------");
            console.log(`ID: ${u.id}`);
            console.log(`Email: ${u.email}`);
            console.log(`Nombre: ${u.nombre}`);
            console.log(`Apellido: ${u.apellido}`);
            console.log(`Rol: ${u.rol}`);
            console.log(`Fecha Registro: ${u.fecha_registro}`);
            console.log("------------------------------------------------");
        });
    }
}

checkUser();

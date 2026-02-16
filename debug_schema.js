
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uzcxsugqrqzmgkabpmli.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6Y3hzdWdxcnF6bWdrYWJwbWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzQxMzQsImV4cCI6MjA4NjUxMDEzNH0.Aa6y-ptoMSKtqly93NYZco5XzADCSkbmaSr9OdL2LsU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking usuarios table schema...');
    const { data, error } = await supabase
        .from('usuarios')
        .select('genero, facultad, es_homologante, ha_visto_clase_antes, biografia, semestre')
        .limit(1);

    if (error) {
        console.error('Error querying columns:', JSON.stringify(error, null, 2));
    } else {
        console.log('Success! Columns exist. Data sample:', data);
    }
}

checkSchema();

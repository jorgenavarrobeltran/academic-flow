
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uzcxsugqrqzmgkabpmli.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6Y3hzdWdxcnF6bWdrYWJwbWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzQxMzQsImV4cCI6MjA4NjUxMDEzNH0.Aa6y-ptoMSKtqly93NYZco5XzADCSkbmaSr9OdL2LsU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanDemoStudents() {
    console.log('Cleaning demo students with email ending in @cul.edu.co ...');

    // 1. Get IDs of demo users
    const { data: demoUsers, error: fetchError } = await supabase
        .from('usuarios')
        .select('id, email')
        .ilike('email', '%@cul.edu.co');

    if (fetchError) {
        console.error('Error fetching demo users:', fetchError);
        return;
    }

    if (!demoUsers || demoUsers.length === 0) {
        console.log('No demo students found.');
        return;
    }

    const userIds = demoUsers.map(u => u.id);
    console.log(`Found ${userIds.length} demo students. Deleting enrollments...`);

    // 2. Delete enrollments
    const { error: deleteEnrollmentsError } = await supabase
        .from('inscripciones')
        .delete()
        .in('estudiante_id', userIds);

    if (deleteEnrollmentsError) {
        console.error('Error deleting enrollments:', deleteEnrollmentsError);
        return;
    }

    console.log('Enrollments deleted. Deleting users...');

    // 3. Delete users
    const { error: deleteUsersError } = await supabase
        .from('usuarios')
        .delete()
        .in('id', userIds);

    if (deleteUsersError) {
        console.error('Error deleting users:', deleteUsersError);
        return; // Might be restricted by other keys, but enrollments gone is enough for course lists.
    }

    console.log('Demo students deleted successfully.');
}

cleanDemoStudents();

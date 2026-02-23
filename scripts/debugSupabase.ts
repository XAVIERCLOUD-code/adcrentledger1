import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceAddEmail() {
    console.log("Checking structure...");

    // Quick test: Try to insert a dummy row with an email to see if it throws "column does not exist"
    const { error } = await supabase.from('tenants').insert([{
        id: 'temp_debug_row_9999',
        name: 'Debug',
        rentGross: 100,
        email: 'test@debug.com',
        floor: 1,
        unit: "1"
    }]);

    if (error) {
        console.error("Insert failed:", error.message);
    } else {
        console.log("Insert Succeeded! The email column DOES exist.");
        await supabase.from('tenants').delete().eq('id', 'temp_debug_row_9999');
    }

    // Let's also check if there is some weird caching happening locally
    const { data } = await supabase.from('tenants').select('*').limit(1);
    console.log("First row returned from DB:", data);
}

forceAddEmail();

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''; // Needs service role key to alter table, but lets see if anon works with RLS disabled.

const supabase = createClient(supabaseUrl, supabaseKey);

async function addEmailColumn() {
    console.log("Attempting to add email column via RPC or Raw SQL");

    // We can't directly execute DDL (ALTER TABLE) with the anon key via standard supabase-js .select() calls.
    // We will need to create a new placeholder row with an email address to see if the column exists or error out.
    const check = await supabase.from('tenants').select('email').limit(1);
    if (check.error && check.error.message.includes('column "email" does not exist')) {
        console.log("Column email is missing. YOU MUST ADD IT MANUALLY IN THE SUPABASE SQL EDITOR:");
        console.log("ALTER TABLE tenants ADD COLUMN IF NOT EXISTS email text;");
    } else {
        console.log("Column 'email' exists! Or other error:", check.error);
    }
}

addEmailColumn();

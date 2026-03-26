import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: bills, error: billsError } = await supabase.from('bills').select('*').eq('month', '2026-03');
    console.log('March 2026 Bills Count:', bills?.length);
    console.log('Error:', billsError);

    const { data: tenants, error: tenantsError } = await supabase.from('tenants').select('*');
    console.log('Tenants Count:', tenants?.length);
    console.log('Error:', tenantsError);
}

main().catch(console.error);

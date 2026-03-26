import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Searching for ATTY KAENA...');
    const { data: tenants, error } = await supabase
        .from('tenants')
        .select('*')
        .ilike('name', '%ATTY%KAENA%');

    if (error) {
        console.error('Error finding tenant:', error);
        return;
    }

    if (!tenants || tenants.length === 0) {
        console.log('No tenant found matching ATTY KAENA');
        return;
    }

    const tenant = tenants[0];
    console.log(`Found tenant: ${tenant.name} (ID: ${tenant.id})`);

    const { error: updateError } = await supabase
        .from('tenants')
        .update({ name: 'MORE LAW' })
        .eq('id', tenant.id);

    if (updateError) {
        console.error('Failed to update tenant:', updateError);
    } else {
        console.log('Successfully updated tenant name to MORE LAW!');
    }
}

main().catch(console.error);

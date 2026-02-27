import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function run() {
    console.log("Testing finance_totals...");
    const result: any = {};

    const { data: selectData, error: selectError } = await supabase.from('finance_totals').select('*');
    result.select = { data: selectData, error: selectError };

    // Test insert
    const { data: insertData, error: insertError } = await supabase.from('finance_totals').insert([{ cash_in_bank: 100, total_receipts: 200, total_disbursements: 50, is_manual_override: true }]).select();
    result.insert = { data: insertData, error: insertError };

    fs.writeFileSync('finance-test-results.json', JSON.stringify(result, null, 2));
    console.log("Done.");
}
run();

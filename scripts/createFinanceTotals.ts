import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createFinanceTotalsTable() {
    console.log('Creating finance_totals table...');
    const { error } = await supabase.rpc('execute_sql', {
        sql_string: `
      CREATE TABLE IF NOT EXISTS finance_totals (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        cash_in_bank NUMERIC NOT NULL DEFAULT 0,
        total_receipts NUMERIC NOT NULL DEFAULT 0,
        total_disbursements NUMERIC NOT NULL DEFAULT 0,
        is_manual_override BOOLEAN DEFAULT false,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Insert default row if empty
      INSERT INTO finance_totals (cash_in_bank, total_receipts, total_disbursements)
      SELECT 0, 0, 0
      WHERE NOT EXISTS (SELECT 1 FROM finance_totals);
    `
    });

    if (error) {
        if (error.message.includes('execute_sql')) {
            console.log('Unable to use RPC to create table. Please run this SQL in your Supabase SQL Editor:');
            console.log(`
CREATE TABLE IF NOT EXISTS finance_totals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cash_in_bank NUMERIC NOT NULL DEFAULT 0,
  total_receipts NUMERIC NOT NULL DEFAULT 0,
  total_disbursements NUMERIC NOT NULL DEFAULT 0,
  is_manual_override BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO finance_totals (cash_in_bank, total_receipts, total_disbursements)
SELECT 0, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM finance_totals);
        `);
        } else {
            console.error('Error creating table:', error);
        }
    } else {
        console.log('Successfully created finance_totals table and seeded default row.');
    }
}

createFinanceTotalsTable();

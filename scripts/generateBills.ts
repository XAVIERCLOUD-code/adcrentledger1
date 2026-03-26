import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Generating March 2026 bills...');
    const currentMonth = '2026-03';

    // Fetch current tenants and bills fresh from supabase
    const [tenantsRes, billsRes] = await Promise.all([
        supabase.from('tenants').select('*'),
        supabase.from('bills').select('*').eq('month', currentMonth),
    ]);

    if (tenantsRes.error) throw tenantsRes.error;
    if (billsRes.error) throw billsRes.error;

    const tenants: any[] = tenantsRes.data || [];
    const existingBillTenantIds = new Set((billsRes.data || []).map((b: any) => b.tenantId));

    const newBills: any[] = [];
    for (const tenant of tenants) {
        if (existingBillTenantIds.has(tenant.id)) continue; // Bill already exists

        const billAmount = tenant.totalDue ?? tenant.rentGross ?? 0;

        newBills.push({
            id: crypto.randomUUID(),
            tenantId: tenant.id,
            month: currentMonth,
            totalBill: billAmount,
            isPaid: false,
            createdAt: new Date().toISOString(),
            rent: tenant.rentGross ?? 0,
        });
    }

    if (newBills.length > 0) {
        const { error: insertError } = await supabase.from('bills').insert(newBills);
        if (insertError) {
            console.error('Insert error details:', insertError.message, insertError.details);
            throw insertError;
        }
        console.log(`[ADC] Successfully generated ${newBills.length} bill(s) for ${currentMonth}`);
    } else {
        console.log(`[ADC] Bills for ${currentMonth} already exist for all ${tenants.length} tenants.`);
    }
}

main().catch(console.error);

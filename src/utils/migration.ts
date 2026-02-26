import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function runLocalStorageMigration() {
    console.log("Starting Migration from LocalStorage to Supabase...");
    let successCount = 0;
    let errorCount = 0;

    // 1. Staff
    try {
        const staffData = localStorage.getItem("adc_staff_v2");
        if (staffData) {
            const parsed = JSON.parse(staffData);
            if (parsed.length > 0) {
                console.log(`Found ${parsed.length} staff records. Migrating...`);
                // Format to match Supabase schema 
                const formatted = parsed.map((s: any) => ({
                    // omit ID to let Supabase generate a proper UUID if desired, 
                    // OR keep it if it's already a valid UUID. The old IDs were just "1", "2", etc which are NOT valid UUIDs.
                    name: s.name,
                    role: s.role,
                    info: s.info || [],
                    iconName: s.iconName || 'User',
                    color: s.color || 'text-gray-500',
                    bg: s.bg || 'bg-gray-500/10',
                    imageUrl: s.imageUrl || null,
                    email: s.email || null,
                    phone: s.phone || null
                }));

                const { error } = await supabase.from('staff').insert(formatted);
                if (error) throw error;
                console.log("✅ Staff migrated successfully!");
                successCount++;
            }
        }
    } catch (e: any) {
        console.error("❌ Error migrating Staff:", e.message);
        errorCount++;
    }

    // 2. Requirements
    try {
        const reqData = localStorage.getItem("adc_reminders_v2"); // Or whatever the key was
        if (reqData) {
            const parsed = JSON.parse(reqData);
            if (parsed.length > 0) {
                console.log(`Found ${parsed.length} requirements. Migrating...`);
                const formatted = parsed.map((r: any) => ({
                    name: r.name,
                    issuedDate: r.issuedDate,
                    validityYears: r.validityYears || 1,
                    expiryDate: r.expiryDate,
                    status: r.status || 'Active',
                    activationDate: r.activationDate || null,
                    documentUrl: r.documentUrl || null
                }));

                const { error } = await supabase.from('requirements').insert(formatted);
                if (error) throw error;
                console.log("✅ Requirements migrated successfully!");
                successCount++;
            }
        }
    } catch (e: any) {
        console.error("❌ Error migrating Requirements:", e.message);
        errorCount++;
    }

    // 3. Events
    try {
        const eventData = localStorage.getItem("adc_events");
        if (eventData) {
            const parsed = JSON.parse(eventData);
            // We only stored custom events in localStorage, not holidays
            if (parsed.length > 0) {
                console.log(`Found ${parsed.length} events. Migrating...`);
                const formatted = parsed.map((e: any) => ({
                    title: e.title,
                    date: e.date,
                    type: e.type || 'event',
                    description: e.description || null
                }));

                const { error } = await supabase.from('events').insert(formatted);
                if (error) throw error;
                console.log("✅ Events migrated successfully!");
                successCount++;
            }
        }
    } catch (e: any) {
        console.error("❌ Error migrating Events:", e.message);
        errorCount++;
    }

    // 4. Cash Transactions
    try {
        const cashData = localStorage.getItem("adc_cash_transactions");
        if (cashData) {
            const parsed = JSON.parse(cashData);
            if (parsed.length > 0) {
                console.log(`Found ${parsed.length} cash transactions. Migrating...`);
                const formatted = parsed.map((c: any) => ({
                    date: c.date,
                    type: c.type,
                    amount: c.amount,
                    category: c.category || 'Uncategorized',
                    description: c.description || '',
                    referenceNo: c.referenceNo || null
                }));

                const { error } = await supabase.from('cash_transactions').insert(formatted);
                if (error) throw error;
                console.log("✅ Cash Transactions migrated successfully!");
                successCount++;
            }
        }
    } catch (e: any) {
        console.error("❌ Error migrating Cash Transactions:", e.message);
        errorCount++;
    }

    if (errorCount === 0 && successCount > 0) {
        console.log("🎉 ALL MIGRATIONS COMPLETED SUCCESSFULLY!");
        alert("Migration Complete! Please check your Supabase dashboard to verify the data is there.");
    } else if (successCount === 0 && errorCount === 0) {
        console.log("⚠️ No data found in LocalStorage to migrate.");
        alert("No local data found to migrate. This is normal if you haven't created anything yet!");
    } else {
        console.log(`⚠️ Migration finished with ${errorCount} errors. Check console.`);
        alert(`Migration finished with ${errorCount} errors. Please check the Developer Console.`);
    }
}

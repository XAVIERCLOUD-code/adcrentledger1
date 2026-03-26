-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
-- Create the function to generate monthly bills
CREATE OR REPLACE FUNCTION generate_monthly_bills() RETURNS void AS $$
DECLARE current_month text;
tenant_record record;
bill_amount numeric;
BEGIN -- Format current month as YYYY-MM
current_month := to_char(CURRENT_DATE, 'YYYY-MM');
-- Loop through all active tenants
FOR tenant_record IN
SELECT *
FROM tenants LOOP -- Check if a bill already exists for this tenant and month
    IF NOT EXISTS (
        SELECT 1
        FROM bills
        WHERE "tenantId" = tenant_record.id
            AND month = current_month
    ) THEN -- Calculate the bill amount (totalDue fallback to rentGross)
    bill_amount := COALESCE(
        tenant_record."totalDue",
        tenant_record."rentGross",
        0
    );
-- Insert the new bill
INSERT INTO bills (
        id,
        "tenantId",
        month,
        "totalBill",
        "isPaid",
        rent,
        "createdAt"
    )
VALUES (
        gen_random_uuid(),
        tenant_record.id,
        current_month,
        bill_amount,
        false,
        COALESCE(tenant_record."rentGross", 0),
        now()
    );
RAISE NOTICE 'Generated bill for tenant % for month %',
tenant_record.id,
current_month;
END IF;
END LOOP;
END;
$$ LANGUAGE plpgsql;
-- Schedule the function to run at midnight (UTC) on the 1st of every month
-- Unschedule first to avoid duplicates if re-running script (ignore error if it doesn't exist)
DO $$ BEGIN PERFORM cron.unschedule('monthly_billing_job');
EXCEPTION
WHEN OTHERS THEN -- Ignore error if job doesn't exist yet
END;
$$;
SELECT cron.schedule(
        'monthly_billing_job',
        '0 0 1 * *',
        -- At 00:00 on day-of-month 1. (Standard cron format)
        'SELECT generate_monthly_bills();'
    );
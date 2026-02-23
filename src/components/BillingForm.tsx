import { useState, useEffect } from "react";
import { BillRecord, Tenant } from "@/data/types";
import { useAppStore } from "@/data/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface BillingFormProps {
  tenant: Tenant;
  onSuccess: () => void;
  onCancel: () => void;
}

const BillingForm = ({ tenant, onSuccess, onCancel }: BillingFormProps) => {
  const { toast } = useToast();
  const { addBill, isLoading } = useAppStore();
  const [amount, setAmount] = useState<string>("");
  const [month, setMonth] = useState<string>("");

  useEffect(() => {
    // Auto-fill generic total due
    if (tenant.totalDue) {
      setAmount(tenant.totalDue.toString());
    } else {
      setAmount(tenant.rentGross.toString());
    }

    // Default to current month
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    setMonth(currentMonth);
  }, [tenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !month) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const currentBills = useAppStore.getState().bills;
    const existingBill = currentBills.find(
      (b) => b.tenantId === tenant.id && b.month === month
    );

    if (existingBill) {
      toast({
        title: "Bill Exists",
        description: `A bill for ${month} already exists for this tenant.`,
        variant: "destructive",
      });
      return;
    }

    const newBill: BillRecord = {
      id: `bill-${Date.now()}`,
      tenantId: tenant.id,
      month,
      totalBill: parseFloat(amount),
      isPaid: false,
      createdAt: new Date().toISOString().split("T")[0],
    };

    await addBill(newBill);

    toast({
      title: "Bill Created",
      description: `Bill for ${month} has been created.`,
    });

    onSuccess();
  };

  const totalBill = parseFloat(amount) || 0;

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="month" className="text-xs text-muted-foreground">Billing Month</Label>
          <Input
            id="month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="mt-1 font-mono"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-xs text-muted-foreground">Total Amount Due (₱)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 font-mono"
            required
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-lg bg-secondary p-3">
        <span className="text-sm font-semibold text-secondary-foreground">Total Bill</span>
        <span className="text-lg font-bold font-mono text-primary">₱{totalBill.toLocaleString()}</span>
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : "Create Bill"}
        </Button>
      </div>
    </form>
  );
};

export default BillingForm;

import { useState } from "react";
import { Tenant } from "@/data/types";
import { useAppStore } from "@/data/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { UserPlus, X, Loader2 } from "lucide-react";

interface AddTenantFormProps {
  onAdded: () => void;
  onClose: () => void;
}

const AddTenantForm = ({ onAdded, onClose }: AddTenantFormProps) => {
  const { addTenant, isLoading } = useAppStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [unit, setUnit] = useState("");
  const [floor, setFloor] = useState<string>("");
  const [contactNumber, setContactNumber] = useState("");
  const [rent, setRent] = useState("");
  const [escalationRate, setEscalationRate] = useState("");
  const [vatPercent, setVatPercent] = useState("");
  const [ewtPercent, setEwtPercent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !unit.trim() || !floor || !contactNumber.trim() || !rent) {
      toast({ title: "Missing fields", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    const rentAmount = parseFloat(rent);
    if (isNaN(rentAmount) || rentAmount <= 0) {
      toast({ title: "Invalid Rent", description: "Please enter a valid positive number for rent.", variant: "destructive" });
      return;
    }

    const tenant: Tenant = {
      id: `t_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      unit: unit.trim(),
      floor: Number(floor) as 1 | 2 | 3,
      contactNumber: contactNumber.trim(),
      rentGross: rentAmount,
      totalDue: rentAmount, // Default to gross rent
      escalationRate: escalationRate ? parseFloat(escalationRate) : undefined,
      vatPercent: vatPercent ? parseFloat(vatPercent) : undefined,
      ewtPercent: ewtPercent ? parseFloat(ewtPercent) : undefined,
    };

    await addTenant(tenant);
    toast({ title: "Tenant added", description: `${tenant.name} has been added to Unit ${tenant.unit}.` });
    onAdded();
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
          <UserPlus className="h-4 w-4 text-primary" />
          Add New Tenant
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label className="text-xs text-muted-foreground">Company / Tenant Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Manila Trading Co." className="mt-1" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tenant@email.com" className="mt-1" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Contact Number</Label>
          <Input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="09171234567" className="mt-1" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Unit Number</Label>
          <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. 103" className="mt-1" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Floor</Label>
          <Select value={floor} onValueChange={setFloor}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select floor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1st Floor</SelectItem>
              <SelectItem value="2">2nd Floor</SelectItem>
              <SelectItem value="3">3rd Floor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Monthly Rent (₱)</Label>
          <Input
            type="number"
            step="0.01"
            value={rent}
            onChange={(e) => setRent(e.target.value)}
            placeholder="0.00"
            className="mt-1 font-mono"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Escalation Rate (%)</Label>
          <Input
            type="number"
            step="0.1"
            value={escalationRate}
            onChange={(e) => setEscalationRate(e.target.value)}
            placeholder="e.g. 5"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">VAT Rate (%)</Label>
          <Input
            type="number"
            step="0.1"
            value={vatPercent}
            onChange={(e) => setVatPercent(e.target.value)}
            placeholder="e.g. 12"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">EWT Rate (%)</Label>
          <Input
            type="number"
            step="0.1"
            value={ewtPercent}
            onChange={(e) => setEwtPercent(e.target.value)}
            placeholder="e.g. 5"
            className="mt-1"
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" className="btn-transition w-full gap-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding Tenant...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Add Tenant
              </>
            )}
          </Button>
        </div>
      </form >
    </div >
  );
};

export default AddTenantForm;

import { useState, useMemo, useEffect } from "react";
import { Tenant, BillRecord } from "@/data/types";
import { ArrowLeft, User, MapPin, Mail, Phone, Plus, History, Bell, Receipt, CheckCircle2, AlertCircle, Edit, Filter } from "lucide-react";
import { getCurrentUser } from "@/data/store";
import { useAppStore } from "@/data/useAppStore";
import StatusBadge, { BillTypeIndicators } from "./StatusBadge";
import BillingForm from "./BillingForm";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { sendTenantNotification, EmailTemplateParams } from "@/utils/emailService";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


interface TenantProfileProps {
  tenant: Tenant;
  onBack: () => void;
}

const TenantProfile = ({ tenant, onBack }: TenantProfileProps) => {
  const { bills, updateTenant, toggleBillPaid, fetchData } = useAppStore();

  // Filter bills just for this tenant
  const tenantBills = useMemo(() =>
    bills.filter((b) => b.tenantId === tenant.id).sort((a, b) => b.month.localeCompare(a.month))
    , [bills, tenant.id]);

  const [showBillingForm, setShowBillingForm] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  // Edit Contact State
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editContactName, setEditContactName] = useState(tenant.contactPerson || "");
  const [editEmail, setEditEmail] = useState(tenant.email || "");

  // Edit Lease State
  const [isEditingLease, setIsEditingLease] = useState(false);
  const [editRent, setEditRent] = useState(tenant.rentGross.toString());
  const [editLeaseStart, setEditLeaseStart] = useState(tenant.leaseStart || "");
  const [editLeaseEnd, setEditLeaseEnd] = useState(tenant.leaseEnd || "");
  const [editEscalationRate, setEditEscalationRate] = useState(tenant.escalationRate?.toString() || "");
  const [editEscalationDetails, setEditEscalationDetails] = useState(tenant.escalationDetails || "");
  const [editVat, setEditVat] = useState(tenant.vatPercent?.toString() || "");
  const [editEwt, setEditEwt] = useState(tenant.ewtPercent?.toString() || "");

  // Year Filter State
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const user = getCurrentUser();
  const isViewer = user?.role === 'viewer';

  const handleSaveContact = async () => {
    const updatedTenant = {
      ...tenant,
      contactPerson: editContactName,
      email: editEmail,
    };
    await updateTenant(updatedTenant);
    setIsEditingContact(false);
    toast({ title: "Contact Details Updated", description: "Tenant contact information has been saved." });
  };

  const handleSaveLease = async () => {
    const rentAmount = parseFloat(editRent);
    if (isNaN(rentAmount) || rentAmount <= 0) {
      toast({ title: "Invalid Rent", description: "Please enter a valid positive number for rent.", variant: "destructive" });
      return;
    }

    const updatedTenant = {
      ...tenant,
      rentGross: rentAmount,
      totalDue: rentAmount,
      leaseStart: editLeaseStart || undefined,
      leaseEnd: editLeaseEnd || undefined,
      escalationRate: editEscalationRate ? parseFloat(editEscalationRate) : undefined,
      escalationDetails: editEscalationDetails || undefined,
      vatPercent: editVat ? parseFloat(editVat) : undefined,
      ewtPercent: editEwt ? parseFloat(editEwt) : undefined,
    };

    await updateTenant(updatedTenant);
    setIsEditingLease(false);
    toast({ title: "Lease Details Updated", description: "Tenant lease information has been saved." });
  };

  const handleNotify = async (bill: BillRecord) => {
    if (!tenant.email) {
      toast({
        title: "No Email Address",
        description: "This tenant has no email address saved. Please add one in Contact Details.",
        variant: "destructive"
      });
      return;
    }

    setLoadingEmail(bill.id);
    const templateParams: EmailTemplateParams = {
      to_name: tenant.name,
      to_email: tenant.email,
      month: bill.month,
      unit: tenant.unit,
      rent: (bill.rent || bill.totalBill).toLocaleString(),
      electric_bill: (bill.electricBill || 0).toLocaleString(),
      water_bill: (bill.waterBill || 0).toLocaleString(),
      total_amount: bill.totalBill.toLocaleString(),
      electric_usage: (bill.electricUsage || 0).toString(),
      water_usage: (bill.waterUsage || 0).toString(),
    };

    const successResponse = await sendTenantNotification(templateParams);
    const success = successResponse.success;

    if (success) {
      toast({ title: "Email Sent", description: `Notification sent to ${tenant.email}` });
    } else {
      toast({ title: "Email Failed", description: "Could not send email.", variant: "destructive" });
    }
    setLoadingEmail(null);
  };

  const handleTogglePaid = async (billId: string, currentStatus: boolean) => {
    await toggleBillPaid(billId);
    const newStatus = !currentStatus ? "Paid" : "Unpaid";
    toast({ title: "Status Updated", description: `Bill marked as ${newStatus}` });
  };

  // Filter Logic
  const uniqueYears = useMemo(() => {
    const years = new Set(tenantBills.map((b) => b.month.split("-")[0]));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [tenantBills]);

  const filteredBills = useMemo(() => {
    if (selectedYear === "all") return tenantBills;
    return tenantBills.filter((b) => b.month.startsWith(selectedYear));
  }, [tenantBills, selectedYear]);

  return (
    <div className="space-y-6 animate-fade-in pb-20 p-2 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="rounded-full h-10 w-10 p-0 hover:bg-muted/80">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{tenant.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary/50 px-2 py-0.5 text-xs font-medium text-secondary-foreground border border-border">
              Unit {tenant.unit}
            </span>
            <span className="text-xs">•</span>
            <span className="text-sm">Tenant Profile</span>
          </p>
        </div>
        {!isViewer && (
          <Button onClick={() => setShowBillingForm(true)} className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" /> New Bill
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Info Cards */}
        <div className="space-y-6 lg:col-span-1">
          {/* Contact Info */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Contact Details</h3>
              </div>
              {!isEditingContact && !isViewer && (
                <Button variant="ghost" size="icon" onClick={() => setIsEditingContact(true)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>

            {!isEditingContact ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</p>
                    <p className="text-sm font-medium">{tenant.email || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone / Contact</p>
                    <p className="text-sm font-medium">{tenant.contactPerson || "—"}</p>
                    {tenant.contactNumber && <p className="text-xs text-muted-foreground">{tenant.contactNumber}</p>}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Unit</p>
                    <p className="text-sm font-medium">Unit {tenant.unit}, {tenant.floor === 0 ? "G/F" : `${tenant.floor}${tenant.floor === 1 ? 'st' : tenant.floor === 2 ? 'nd' : 'rd'} Floor`}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="space-y-2">
                  <Label htmlFor="contact-person" className="text-xs">Contact Person</Label>
                  <Input
                    id="contact-person"
                    value={editContactName}
                    onChange={(e) => setEditContactName(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="text-xs">Email Address</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditingContact(false)} className="h-7 text-xs">Cancel</Button>
                  <Button size="sm" onClick={handleSaveContact} className="h-7 text-xs">Save</Button>
                </div>
              </div>
            )}
          </div>

          {/* Lease Info */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Receipt className="h-4 w-4 text-indigo-500" />
                </div>
                <h3 className="font-semibold text-lg">Lease Information</h3>
              </div>
              {!isEditingLease && !isViewer && (
                <Button variant="ghost" size="icon" onClick={() => setIsEditingLease(true)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>

            {!isEditingLease ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Monthly Rent</span>
                  <span className="font-mono font-bold text-lg">₱{(tenant.totalDue || tenant.rentGross).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Lease Start</span>
                  <span className="text-sm font-medium">{tenant.leaseStart || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Lease End</span>
                  <span className="text-sm font-medium">{tenant.leaseEnd || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Escalation Rate</span>
                  <span className="text-sm font-medium">{tenant.escalationRate ? `${tenant.escalationRate}%` : "—"}</span>
                </div>
                <div className="flex flex-col py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Escalation Details</span>
                  <span className="text-sm font-medium mt-1">{tenant.escalationDetails || "—"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">VAT Rate</span>
                  <span className="text-sm font-medium">{tenant.vatPercent ? `${tenant.vatPercent}%` : "—"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">EWT Rate</span>
                  <span className="text-sm font-medium">{tenant.ewtPercent ? `${tenant.ewtPercent}%` : "—"}</span>
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground px-2 py-1 bg-muted/50 rounded-md">
                    <AlertCircle className="h-3 w-3" />
                    <span>Contract active until {tenant.leaseEnd || "N/A"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="space-y-2">
                  <Label htmlFor="lease-rent" className="text-xs">Monthly Rent (₱)</Label>
                  <Input
                    id="lease-rent"
                    type="number"
                    value={editRent}
                    onChange={(e) => setEditRent(e.target.value)}
                    className="h-8 text-sm font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lease-start" className="text-xs">Lease Start</Label>
                    <Input
                      id="lease-start"
                      type="date"
                      value={editLeaseStart}
                      onChange={(e) => setEditLeaseStart(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lease-end" className="text-xs">Lease End</Label>
                    <Input
                      id="lease-end"
                      type="date"
                      value={editLeaseEnd}
                      onChange={(e) => setEditLeaseEnd(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lease-esc-rate" className="text-xs">Escalation Rate (%)</Label>
                    <Input
                      id="lease-esc-rate"
                      type="number"
                      step="0.1"
                      value={editEscalationRate}
                      onChange={(e) => setEditEscalationRate(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lease-vat" className="text-xs">VAT Rate (%)</Label>
                    <Input
                      id="lease-vat"
                      type="number"
                      step="0.1"
                      value={editVat}
                      onChange={(e) => setEditVat(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lease-ewt" className="text-xs">EWT Rate (%)</Label>
                  <Input
                    id="lease-ewt"
                    type="number"
                    step="0.1"
                    value={editEwt}
                    onChange={(e) => setEditEwt(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lease-esc-details" className="text-xs">Escalation Details</Label>
                  <Input
                    id="lease-esc-details"
                    value={editEscalationDetails}
                    onChange={(e) => setEditEscalationDetails(e.target.value)}
                    placeholder="e.g. 10% on 3rd year"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditingLease(false)} className="h-7 text-xs">Cancel</Button>
                  <Button size="sm" onClick={handleSaveLease} className="h-7 text-xs">Save</Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Billing History */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-border/50 flex items-center justify-between glass-card-header">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <History className="h-4 w-4 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-lg">Billing History</h3>
              </div>

              {/* Year Filter */}
              <div className="w-[140px]">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="h-8 text-xs bg-background/50 border-dashed">
                    <div className="flex items-center gap-2">
                      <Filter className="h-3 w-3 text-muted-foreground" />
                      <SelectValue placeholder="Filter Year" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    {uniqueYears.map((year) => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {filteredBills.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Receipt className="h-12 w-12 opacity-20 mb-3" />
                  <p>No billing records found for this period.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 text-left">Period</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                      <th className="px-6 py-3 text-center">Status</th>
                      <th className="px-6 py-3 text-center">Breakdown</th>
                      {!isViewer && <th className="px-6 py-3 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredBills.map((bill) => (
                      <tr key={bill.id} className="group hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-medium">
                          {bill.month}
                          {bill.paidDate && (
                            <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                              Paid {bill.paidDate}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold">
                          ₱{bill.totalBill.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            <StatusBadge isPaid={bill.isPaid} />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <BillTypeIndicators bill={bill} />
                          </div>
                        </td>
                        {!isViewer && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={bill.isPaid}
                                  onCheckedChange={(checked) => handleTogglePaid(bill.id, checked)}
                                  className="scale-75 data-[state=checked]:bg-emerald-500"
                                />
                                <Label className="text-xs text-muted-foreground font-normal">
                                  {bill.isPaid ? "Paid" : "Unpaid"}
                                </Label>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs gap-1 ml-2 border-dashed"
                                onClick={() => handleNotify(bill)}
                                disabled={!!loadingEmail}
                              >
                                {loadingEmail === bill.id ? (
                                  <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                                ) : (
                                  <Bell className="h-3 w-3" />
                                )}
                                Notify
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {showBillingForm && (
        <BillingForm
          tenant={tenant}
          onSuccess={() => { fetchData(); setShowBillingForm(false); }}
          onCancel={() => setShowBillingForm(false)}
        />
      )}
    </div>
  );
};

export default TenantProfile;

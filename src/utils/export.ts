import { BillRecord, Tenant } from "@/data/types";

export function exportToCSV(bills: BillRecord[], tenants: Tenant[], filename: string = "adc_building_report") {
  const tenantMap = new Map(tenants.map((t) => [t.id, t]));

  const headers = [
    "Tenant", "Unit", "Floor", "Month", "Rent",
    "Electric (kWh)", "Electric Bill", "Water (cu.m)", "Water Bill",
    "Total Bill", "Status", "Paid Date"
  ];

  const rows = bills.map((b) => {
    const tenant = tenantMap.get(b.tenantId);
    return [
      tenant?.name ?? "Unknown",
      tenant?.unit ?? "",
      tenant?.floor ?? "",
      b.month,
      b.rent,
      b.electricCurrentReading - b.electricPrevReading,
      b.electricBill,
      b.waterCurrentReading - b.waterPrevReading,
      b.waterBill,
      b.totalBill,
      b.isPaid ? "Paid" : "Unpaid",
      b.paidDate ?? "",
    ].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

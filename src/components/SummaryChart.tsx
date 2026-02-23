import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { BillRecord } from "@/data/types";
import { useMemo } from "react";

interface SummaryChartProps {
  bills: BillRecord[];
}

const SummaryChart = ({ bills }: SummaryChartProps) => {
  const data = useMemo(() => {
    const grouped = new Map<string, { paid: number; unpaid: number }>();

    bills.forEach((b) => {
      const existing = grouped.get(b.month) || { paid: 0, unpaid: 0 };
      if (b.isPaid) {
        existing.paid += (b.totalBill || 0);
      } else {
        existing.unpaid += (b.totalBill || 0);
      }
      grouped.set(b.month, existing);
    });

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, vals]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        Paid: vals.paid,
        Unpaid: vals.unpaid,
      }));
  }, [bills]);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-card-foreground">Monthly Collection Overview</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number) => [`₱${value.toLocaleString()}`, undefined]}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Bar dataKey="Paid" fill="#10b981" radius={[4, 4, 0, 0]} name="Paid" />
          <Bar dataKey="Unpaid" fill="#ef4444" radius={[4, 4, 0, 0]} name="Unpaid" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SummaryChart;

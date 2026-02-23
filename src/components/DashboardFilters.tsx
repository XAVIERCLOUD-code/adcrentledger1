import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

interface DashboardFiltersProps {
    selectedMonth: string;
    setSelectedMonth: (month: string) => void;
    selectedYear: string;
    setSelectedYear: (year: string) => void;
    uniqueYears: string[];
}

const DashboardFilters = ({ selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, uniqueYears }: DashboardFiltersProps) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Overview of building performance</p>
            </div>
            <div className="flex gap-2">
                <div className="w-[140px]">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="h-9 bg-background/50 border-dashed">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Month" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Months</SelectItem>
                            {Array.from({ length: 12 }, (_, i) => {
                                const monthNum = (i + 1).toString().padStart(2, '0');
                                const monthName = new Date(2000, i, 1).toLocaleString('default', { month: 'short' });
                                return <SelectItem key={monthNum} value={monthNum}>{monthName}</SelectItem>;
                            })}
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-[140px]">
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="h-9 bg-background/50 border-dashed">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Year" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Years</SelectItem>
                            {uniqueYears.map((year) => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
};

export default DashboardFilters;

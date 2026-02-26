import { useState, useEffect } from "react";
import { Plus, Wallet, ArrowUpRight, ArrowDownRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CashTransaction } from "@/data/types";
import { useAppStore } from "@/data/useAppStore";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function Finance() {
    const { cashTransactions: transactions, financeTotals: totals, addCashTransaction, deleteCashTransaction, user } = useAppStore();

    const isAdmin = user?.role === 'admin';

    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [isDisbursementModalOpen, setIsDisbursementModalOpen] = useState(false);

    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [referenceNo, setReferenceNo] = useState("");

    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleAddTransaction = async (type: "receipt" | "disbursement") => {
        const val = parseFloat(amount);
        if (!val || !date || !category || !description) return;

        await addCashTransaction({
            id: `cash-${Date.now()}`, // Will be overwritten by UUID in store, but good for typing if required
            date,
            type,
            amount: val,
            category,
            description,
            referenceNo,
        });

        // Reset form
        setAmount("");
        setCategory("");
        setDescription("");
        setReferenceNo("");
        setDate(new Date().toISOString().split("T")[0]);

        if (type === "receipt") setIsReceiptModalOpen(false);
        if (type === "disbursement") setIsDisbursementModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this transaction?")) {
            await deleteCashTransaction(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Finance & Ledger</h1>
                    <p className="text-muted-foreground mt-2">
                        Track cash receipts, disbursements, and monitor your cash in bank.
                    </p>
                </div>
                {isAdmin && (
                    <div className="flex gap-2">
                        <Button onClick={() => setIsReceiptModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                            <Plus className="mr-2 h-4 w-4" /> Add Receipt
                        </Button>
                        <Button onClick={() => setIsDisbursementModalOpen(true)} variant="destructive">
                            <Plus className="mr-2 h-4 w-4" /> Add Disbursement
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cash in Bank</CardTitle>
                        <Wallet className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totals.cashInBank)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Manual running balance
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-500">{formatCurrency(totals.totalReceipts)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            All time incoming
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Disbursements</CardTitle>
                        <ArrowDownRight className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{formatCurrency(totals.totalDisbursements)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            All time expenses
                        </p>
                    </CardContent>
                </Card>
            </div>

            {isAdmin && (
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Ref No.</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                                        No transactions found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedTransactions.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell>{formatDate(t.date)}</TableCell>
                                        <TableCell>
                                            <Badge variant={t.type === 'receipt' ? 'default' : 'destructive'} className={t.type === 'receipt' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : ''}>
                                                {t.type === 'receipt' ? 'Receipt' : 'Disbursement'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{t.category}</TableCell>
                                        <TableCell>{t.description}</TableCell>
                                        <TableCell className="text-muted-foreground">{t.referenceNo || '-'}</TableCell>
                                        <TableCell className={`text-right font-medium ${t.type === 'receipt' ? 'text-emerald-500' : 'text-destructive'}`}>
                                            {t.type === 'receipt' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {isAdmin && (
                <>
                    {/* Receipt Modal */}
                    <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Cash Receipt</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Amount (₱)</Label>
                                        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Rent Payment">Rent Payment</SelectItem>
                                            <SelectItem value="Security Deposit">Security Deposit</SelectItem>
                                            <SelectItem value="Utility Payment">Utility Payment</SelectItem>
                                            <SelectItem value="Other Income">Other Income</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Rent for Feb - The Coffee Table" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Reference No. / OR No.</Label>
                                    <Input value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} placeholder="Optional" />
                                </div>
                                <Button onClick={() => handleAddTransaction("receipt")} className="w-full bg-emerald-600 hover:bg-emerald-700">Save Receipt</Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Disbursement Modal */}
                    <Dialog open={isDisbursementModalOpen} onOpenChange={setIsDisbursementModalOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Cash Disbursement</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Amount (₱)</Label>
                                        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Payroll">Payroll</SelectItem>
                                            <SelectItem value="Utilities (Meralco/Water)">Utilities (Meralco/Water)</SelectItem>
                                            <SelectItem value="Maintenance & Repairs">Maintenance & Repairs</SelectItem>
                                            <SelectItem value="Taxes & Permits">Taxes & Permits</SelectItem>
                                            <SelectItem value="Other Expense">Other Expense</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Feb Payroll - Security" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Voucher / Check No.</Label>
                                    <Input value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} placeholder="Optional" />
                                </div>
                                <Button onClick={() => handleAddTransaction("disbursement")} className="w-full" variant="destructive">Save Disbursement</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </div>
    );
}

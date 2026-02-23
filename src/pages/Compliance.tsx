import { useState, useEffect } from "react";
import { getRequirements, updateRequirement, toggleRequirementStatus, getCurrentUser } from "@/data/store";
import ComplianceWidget from "@/components/ComplianceWidget";
// import { PlusCircle } from "lucide-react"; // Unused for now
import { Button } from "@/components/ui/button";

const Compliance = () => {
    useEffect(() => {
        console.log("Compliance component mounted");
    }, []);
    // In a real app, we might want state to refresh when items are added/edited
    const [requirements, setRequirements] = useState(getRequirements());

    const handleRenew = (id: string, validityYears: number) => {
        const req = requirements.find(r => r.id === id);
        if (!req) return;

        const today = new Date();
        const nextExpiry = new Date(today);
        nextExpiry.setFullYear(today.getFullYear() + validityYears);

        const updatedReq = {
            ...req,
            issuedDate: today.toISOString().split("T")[0],
            expiryDate: nextExpiry.toISOString().split("T")[0],
            status: "Active" as const,
            activationDate: today.toISOString().split("T")[0] // Also set activation date on renew
        };

        updateRequirement(updatedReq);
        setRequirements(getRequirements()); // Refresh list
    };

    const handleToggle = (id: string) => {
        console.log("Toggling ID:", id);
        toggleRequirementStatus(id);
        setRequirements(getRequirements());
    };

    const user = getCurrentUser();
    const isViewer = user?.role === 'viewer';

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Compliance & Renewals</h2>
                    <p className="text-muted-foreground">Manage ongoing building requirements, permits, and licenses.</p>
                </div>
            </div>

            {/* Compliance Widget */}
            <div className="grid gap-6">
                <ComplianceWidget
                    requirements={requirements}
                    onRenew={isViewer ? undefined : handleRenew}
                    onToggle={isViewer ? undefined : handleToggle}
                />
            </div>
        </div>
    );
};

export default Compliance;

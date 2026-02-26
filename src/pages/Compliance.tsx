import { useState, useEffect } from "react";
import { useAppStore } from "@/data/useAppStore";
import ComplianceWidget from "@/components/ComplianceWidget";
import { RenewComplianceModal } from "@/components/RenewComplianceModal";
import { BuildingRequirement } from "@/data/types";
import { Button } from "@/components/ui/button";
import { supabase } from "@/utils/supabaseClient";
import { toast } from "sonner";

const Compliance = () => {
    const { requirements, updateRequirement, toggleRequirementStatus, user } = useAppStore();
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
    const [selectedRequirement, setSelectedRequirement] = useState<BuildingRequirement | null>(null);

    const handleRenewClick = (id: string, validityYears: number) => {
        const req = requirements.find(r => r.id === id);
        if (req) {
            setSelectedRequirement(req);
            setIsRenewModalOpen(true);
        }
    };

    const handleConfirmRenew = async (updatedReq: BuildingRequirement) => {
        await updateRequirement(updatedReq);
        setIsRenewModalOpen(false);
        setSelectedRequirement(null);
    };

    const handleRemoveDocument = async (id: string, url: string) => {
        const req = requirements.find(r => r.id === id);
        if (!req) return;

        try {
            const urlParts = url.split('/');
            const fileName = urlParts[urlParts.length - 1];

            if (fileName) {
                await supabase.storage
                    .from('compliance_documents')
                    .remove([`compliance-docs/${fileName}`]);
            }
        } catch (err) {
            console.error("Failed to delete from storage:", err);
        }

        const updatedReq = {
            ...req,
            documentUrl: undefined
        };
        await updateRequirement(updatedReq);
        toast.info("Document removed successfully.");
    };

    const handleToggle = async (id: string) => {
        console.log("Toggling ID:", id);
        await toggleRequirementStatus(id);
    };

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
                    onRenew={isViewer ? undefined : handleRenewClick}
                    onToggle={isViewer ? undefined : handleToggle}
                    onRemoveDocument={isViewer ? undefined : handleRemoveDocument}
                />
            </div>

            <RenewComplianceModal
                requirement={selectedRequirement}
                isOpen={isRenewModalOpen}
                onClose={() => setIsRenewModalOpen(false)}
                onRenew={handleConfirmRenew}
            />
        </div>
    );
};

export default Compliance;

import { useState } from "react";
import { format, addYears } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BuildingRequirement } from "@/data/types";
import { supabase } from "@/utils/supabaseClient";
import { toast } from "sonner";
import { CalendarIcon, UploadCloud, Loader2 } from "lucide-react";

interface RenewComplianceModalProps {
    requirement: BuildingRequirement | null;
    isOpen: boolean;
    onClose: () => void;
    onRenew: (updatedReq: BuildingRequirement) => void;
}

export function RenewComplianceModal({
    requirement,
    isOpen,
    onClose,
    onRenew,
}: RenewComplianceModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // If no requirement is selected, don't render anything meaningful
    if (!requirement) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!requirement) return;

        let documentUrl = requirement.documentUrl;

        if (file) {
            setIsUploading(true);
            try {
                const fileExt = file.name.split(".").pop();
                const fileName = `${requirement.id}-${Date.now()}.${fileExt}`;
                const filePath = `compliance-docs/${fileName}`;

                // Upload to Supabase Storage
                const { error: uploadError } = await supabase.storage
                    .from("compliance_documents")
                    .upload(filePath, file);

                if (uploadError) {
                    throw uploadError;
                }

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from("compliance_documents")
                    .getPublicUrl(filePath);

                documentUrl = publicUrl;
            } catch (error: any) {
                console.error("Upload Error:", error);
                toast.error("Failed to upload document", {
                    description: error.message || "An unknown error occurred during upload.",
                });
                setIsUploading(false);
                return; // Stop the renewal process if upload fails
            }
        }

        const today = new Date();
        const nextExpiry = addYears(today, requirement.validityYears);

        const updatedReq: BuildingRequirement = {
            ...requirement,
            issuedDate: format(today, "yyyy-MM-dd"),
            expiryDate: format(nextExpiry, "yyyy-MM-dd"),
            status: "Active",
            activationDate: format(today, "yyyy-MM-dd"),
            documentUrl: documentUrl, // This will be the new URL if a file was uploaded, or the old one if not
        };

        onRenew(updatedReq);
        setIsUploading(false);
        setFile(null); // Reset file
        onClose();
    };

    const nextExpiryPreview = addYears(new Date(), requirement.validityYears);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] glass-panel border-border/50">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-xl">Renew Requirement</DialogTitle>
                        <DialogDescription>
                            Upload the new certificate to renew {requirement.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-6">
                        <div className="space-y-4 rounded-xl border border-border/50 bg-muted/30 p-4 shadow-inner">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Current Expiry</span>
                                <span className="text-sm font-bold text-destructive">{requirement.expiryDate}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">New Expiry</span>
                                <div className="flex items-center gap-1.5 text-paid font-bold">
                                    <CalendarIcon className="h-4 w-4" />
                                    <span>{format(nextExpiryPreview, "yyyy-MM-dd")}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="document" className="text-sm font-semibold">
                                Upload New Certificate (PDF/Image)
                            </Label>
                            <div className="relative group">
                                <Input
                                    id="document"
                                    type="file"
                                    accept=".pdf,image/*"
                                    onChange={handleFileChange}
                                    className="pl-10 h-11 border-border/50 bg-background/50 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-primary cursor-pointer hover:bg-muted/50 transition-colors"
                                />
                                <UploadCloud className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            {file && (
                                <p className="text-xs text-muted-foreground pl-1">
                                    Selected: <span className="font-medium text-foreground">{file.name}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isUploading || !file} // Require file for renewal in this context
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                "Upload & Renew"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

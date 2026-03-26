import { useState, useEffect } from "react";
import { Shield, User, Briefcase, Users, Mail, Phone, CalendarDays, Edit2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/data/useAppStore";
import { useStaff, useUpdateStaff } from "@/data/queries/staff";
import { Staff as StaffType } from "@/data/types";

// Helper to map string icon names back to Lucide components
const getIcon = (iconName: string) => {
    switch (iconName) {
        case "Briefcase": return Briefcase;
        case "Shield": return Shield;
        default: return User;
    }
};

const Staff = () => {
    const { user } = useAppStore();
    const { data: staffList = [] } = useStaff();
    const updateStaffMutation = useUpdateStaff();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<StaffType | null>(null);

    const isAdmin = user?.role === 'admin';

    const handleEditClick = (staff: StaffType) => {
        setEditData({ ...staff });
        setEditingId(staff.id);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData(null);
    };

    const handleSaveEdit = async () => {
        if (editData) {
            await updateStaffMutation.mutateAsync(editData);
            setEditingId(null);
            setEditData(null);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <Users className="h-6 w-6 text-primary" />
                        Building Staff
                    </h2>
                    <p className="text-muted-foreground mt-1">Directory of key personnel and security team.</p>
                </div>
            </div>

            {/* Staff Grid - Premium Horizontal Cards */}
            <div className="grid gap-6 sm:grid-cols-1 xl:grid-cols-2">
                {staffList.map((staff, i) => {
                    const IconComponent = getIcon(staff.iconName);
                    const isEditing = editingId === staff.id;
                    const displayData = isEditing && editData ? editData : staff;

                    return (
                        <div
                            key={staff.id}
                            className="group relative flex flex-col md:flex-row p-6 glass-card-horizontal rounded-2xl hover:border-primary/50 transition-all duration-300 animate-fade-in overflow-hidden gap-6 items-start"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            {/* Glowing Background Accent */}
                            <div className={`absolute top-0 right-0 w-64 h-full ${displayData.bg} opacity-10 blur-[80px] pointer-events-none rounded-r-2xl`}></div>

                            {/* Left Side: Avatar Container */}
                            <div className="relative z-10 flex flex-col items-center justify-center shrink-0 w-full md:w-auto">
                                <div className={`flex items-center justify-center w-32 h-32 md:w-28 md:h-28 rounded-full ${displayData.bg} ${displayData.color} ring-4 ring-background shadow-xl overflow-hidden bg-background mb-4 transition-transform duration-300 ${!isEditing && 'group-hover:scale-105'}`}>
                                    {displayData.imageUrl ? (
                                        <img src={displayData.imageUrl} alt={displayData.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <img
                                            src={`/${displayData.name.split(' ')[0].toLowerCase()}-avatar.jpg`}
                                            alt={displayData.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement?.querySelector('svg')?.style.setProperty('display', 'block');
                                            }}
                                        />
                                    )}
                                    <IconComponent className="w-10 h-10 hidden" />
                                </div>

                                {!isEditing && (
                                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border ${displayData.bg} border-current opacity-80 backdrop-blur-sm shadow-sm flex items-center gap-1.5 whitespace-nowrap`}>
                                        {displayData.role}
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Information Body */}
                            <div className="relative z-10 flex flex-col flex-1 w-full min-w-0">
                                {/* Header Row */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-full pr-4">
                                        {isEditing ? (
                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    value={displayData.name}
                                                    onChange={(e) => setEditData({ ...displayData, name: e.target.value })}
                                                    className="w-full text-xl font-bold bg-background/50 border border-border/50 rounded-md px-3 py-2"
                                                    placeholder="Full Name"
                                                />
                                                <input
                                                    type="text"
                                                    value={displayData.role}
                                                    onChange={(e) => setEditData({ ...displayData, role: e.target.value })}
                                                    className="w-full text-sm font-semibold uppercase tracking-wider text-primary bg-background/50 border border-border/50 rounded-md px-3 py-2"
                                                    placeholder="Role Title"
                                                />
                                            </div>
                                        ) : (
                                            <h3 className="text-2xl font-bold text-foreground truncate tracking-tight">{displayData.name}</h3>
                                        )}
                                    </div>
                                    {isAdmin && !isEditing && (
                                        <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-muted-foreground hover:text-primary rounded-full hover:bg-primary/10 transition-colors" onClick={() => handleEditClick(staff)}>
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>

                                {/* Contact Pills */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {isEditing ? (
                                        <div className="w-full space-y-2">
                                            <input type="email" value={displayData.email || ''} onChange={(e) => setEditData({ ...displayData, email: e.target.value })} className="w-full bg-background/50 border border-border/50 rounded-md px-3 py-2 text-sm" placeholder="Email Address" />
                                            <input type="text" value={displayData.phone || ''} onChange={(e) => setEditData({ ...displayData, phone: e.target.value })} className="w-full bg-background/50 border border-border/50 rounded-md px-3 py-2 text-sm" placeholder="Phone Number" />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/40 border border-border/50 text-sm font-medium shadow-sm hover:bg-background/80 transition-colors cursor-default">
                                                <Mail className="w-3.5 h-3.5 text-primary" />
                                                <span className="truncate max-w-[200px]">{displayData.email || "No email"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/40 border border-border/50 text-sm font-medium shadow-sm hover:bg-background/80 transition-colors cursor-default">
                                                <Phone className="w-3.5 h-3.5 text-primary" />
                                                <span>{displayData.phone || "No phone"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/40 border border-border/50 text-sm font-medium shadow-sm hover:bg-background/80 transition-colors cursor-default">
                                                <CalendarDays className="w-3.5 h-3.5 text-primary" />
                                                <span>Joined: {displayData.id === "1" ? "2015" : "2022"}</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Responsibilities Tags */}
                                <div className="mt-auto">
                                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                        Responsibilities <span className="h-px bg-border/50 flex-1"></span>
                                    </h4>
                                    {isEditing ? (
                                        <textarea
                                            value={displayData.info.join(', ')}
                                            onChange={(e) => setEditData({ ...displayData, info: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                            className="w-full bg-background/50 border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px]"
                                            placeholder="Comma separated tags..."
                                        />
                                    ) : (
                                        displayData.info && displayData.info.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {displayData.info.map((infoText, idx) => (
                                                    <span key={idx} className="text-xs font-medium bg-secondary/80 text-secondary-foreground border border-border/50 shadow-sm px-2.5 py-1 rounded-md hover:bg-secondary transition-colors cursor-default">
                                                        {infoText}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground italic">None specified</p>
                                        )
                                    )}
                                </div>

                                {/* Edit Actions */}
                                {isAdmin && isEditing && (
                                    <div className="mt-6 pt-4 border-t border-border/50 flex gap-2 justify-end bg-background/20 -mx-6 -mb-6 p-4 rounded-b-2xl">
                                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                                        <Button size="sm" onClick={handleSaveEdit}>Save Changes</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Staff;

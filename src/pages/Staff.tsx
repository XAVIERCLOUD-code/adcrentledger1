import { useState, useEffect } from "react";
import { Shield, User, Briefcase, Users, Mail, Phone, CalendarDays, Edit2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/data/useAppStore";
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
    const { staff: staffList, updateStaff, user } = useAppStore();
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
            await updateStaff(editData);
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

            {/* Staff Grid - Wider cards */}
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {staffList.map((staff, i) => {
                    const IconComponent = getIcon(staff.iconName);
                    const isEditing = editingId === staff.id;
                    const displayData = isEditing && editData ? editData : staff;

                    return (
                        <div
                            key={staff.id}
                            className="group relative flex flex-col pt-16 px-6 pb-6 bg-card border border-border/50 rounded-2xl hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 animate-fade-in overflow-hidden"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            {/* Decorative Header Background */}
                            <div className={`absolute top-0 left-0 right-0 h-24 ${displayData.bg} opacity-50 z-0`}></div>

                            {/* Transparent ADC Logo Background */}
                            <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.04]">
                                <img src="/favicon.ico" alt="" className="w-64 h-64 object-contain grayscale" />
                            </div>

                            {/* Avatar */}
                            <div className="relative z-10 flex justify-center -mt-16 mb-4">
                                <div className="relative group/avatar">
                                    <div className={`flex items-center justify-center w-32 h-32 rounded-full ${displayData.bg} ${displayData.color} ring-4 ring-background shadow-xl overflow-hidden bg-background transition-transform duration-300 ${!isEditing && 'group-hover:scale-105'}`}>
                                        {displayData.imageUrl ? (
                                            <img src={displayData.imageUrl} alt={displayData.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <img
                                                src={`/${displayData.name.split(' ')[0].toLowerCase()}-avatar.jpg`}
                                                alt={displayData.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    // Fallback to icon if image not found in public folder
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.parentElement?.querySelector('svg')?.style.setProperty('display', 'block');
                                                }}
                                            />
                                        )}
                                        {/* Hidden fallback icon shown if image fails to load */}
                                        <IconComponent className="w-12 h-12 hidden" />
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="relative z-10 flex flex-col flex-1">
                                {/* Name and Role */}
                                <div className="text-center mb-6">
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={displayData.name}
                                                onChange={(e) => setEditData({ ...displayData, name: e.target.value })}
                                                className="w-full text-center text-xl font-bold bg-background/50 border border-border/50 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="Full Name"
                                            />
                                            <input
                                                type="text"
                                                value={displayData.role}
                                                onChange={(e) => setEditData({ ...displayData, role: e.target.value })}
                                                className="w-full text-center text-sm font-semibold uppercase tracking-wider text-primary bg-background/50 border border-border/50 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="Role Title"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="text-xl font-bold text-foreground truncate">{displayData.name}</h3>
                                            <p className="text-sm font-bold uppercase tracking-wider text-primary mt-0.5">{displayData.role}</p>
                                        </>
                                    )}
                                </div>

                                {/* Contact Details */}
                                <div className="space-y-3 p-4 bg-muted/20 rounded-xl border border-border/50 mb-6 flex-1">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={displayData.email || ''}
                                                onChange={(e) => setEditData({ ...displayData, email: e.target.value })}
                                                className="flex-1 bg-background/50 border border-border/50 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full"
                                                placeholder="Email Address"
                                            />
                                        ) : (
                                            <span className="text-sm text-foreground truncate">{displayData.email || "No email provided"}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={displayData.phone || ''}
                                                onChange={(e) => setEditData({ ...displayData, phone: e.target.value })}
                                                className="flex-1 bg-background/50 border border-border/50 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full"
                                                placeholder="Phone Number"
                                            />
                                        ) : (
                                            <span className="text-sm text-foreground truncate">{displayData.phone || "No phone provided"}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
                                        <span className="text-sm text-foreground">Joined: {displayData.id === "1" ? "2015" : "2022"}</span>
                                    </div>
                                </div>

                                {/* Responsibilities Tags */}
                                <div className="mb-6">
                                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Responsibilities</h4>
                                    {isEditing ? (
                                        <textarea
                                            value={displayData.info.join(', ')}
                                            onChange={(e) => setEditData({ ...displayData, info: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                            className="w-full bg-background/50 border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px]"
                                            placeholder="Comma separated tags..."
                                        />
                                    ) : (
                                        displayData.info && displayData.info.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {displayData.info.map((infoText, idx) => (
                                                    <span key={idx} className="text-[10px] font-semibold bg-secondary text-secondary-foreground border border-border/50 px-2 py-1 rounded-md">
                                                        {infoText}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground italic">None specified</p>
                                        )
                                    )}
                                </div>

                                {/* Card Footer Actions */}
                                {isAdmin && (
                                    <div className="mt-auto pt-4 border-t border-border/50 flex gap-2 justify-end">
                                        {isEditing ? (
                                            <>
                                                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                                                <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                                            </>
                                        ) : (
                                            <Button variant="outline" size="sm" className="w-full relative z-10" onClick={(e) => { e.stopPropagation(); handleEditClick(staff); }}>
                                                <Edit2 className="w-3.5 h-3.5 mr-2" />
                                                Edit Profile
                                            </Button>
                                        )}
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

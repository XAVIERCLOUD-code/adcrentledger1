import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, MapPin, Calendar as CalendarIcon, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarEvent, } from "@/data/types";
import { useAppStore } from "@/data/useAppStore";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const Calendar = () => {
    const { toast } = useToast();
    const { events, addEvent, deleteEvent, user } = useAppStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showEventDialog, setShowEventDialog] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    // Form State
    const [newEventTitle, setNewEventTitle] = useState("");
    const [newEventDesc, setNewEventDesc] = useState("");
    const [eventType, setEventType] = useState<CalendarEvent["type"]>("meeting");
    const [eventTime, setEventTime] = useState("09:00");

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const isViewer = user?.role === 'viewer';

    // ... existing code ...

    const handleDayClick = (day: Date) => {
        if (isViewer) return;
        setSelectedDate(day);
        setShowAddDialog(true);
        setNewEventTitle("");
        setNewEventDesc("");
        setEventType("meeting");
        setEventTime("09:00");
    };

    const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
        e.stopPropagation();
        setSelectedEvent(event);
        setShowEventDialog(true);
    };

    const handleSaveEvent = async () => {
        if (!newEventTitle || !selectedDate) {
            toast({ title: "Title Required", variant: "destructive" });
            return;
        }

        const newEvent: CalendarEvent = {
            id: `evt-${Date.now()}`,
            title: newEventTitle,
            date: format(selectedDate, "yyyy-MM-dd"),
            type: eventType,
            description: newEventDesc + (eventTime ? ` @ ${eventTime}` : "")
        };

        await addEvent(newEvent);
        setShowAddDialog(false);
        toast({ title: "Event Added", description: `${newEventTitle} on ${format(selectedDate, "MMM d")}` });
    };

    const handleDeleteEvent = async () => {
        if (!selectedEvent) return;
        await deleteEvent(selectedEvent.id);
        setShowEventDialog(false);
        toast({ title: "Event Deleted" });
    };

    return (
        <div className="h-full flex flex-col space-y-4 animate-fade-in p-2 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <CalendarIcon className="h-6 w-6" />
                        Company Calendar
                    </h1>
                    <div className="flex items-center rounded-md border bg-background shadow-sm">
                        <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="min-w-[120px] text-center font-semibold">
                            {format(currentDate, "MMMM yyyy")}
                        </span>
                        <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button variant="outline" size="sm" onClick={goToToday}>Today</Button>
                </div>
                {!isViewer && (
                    <Button onClick={() => { setSelectedDate(new Date()); setShowAddDialog(true); }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Event
                    </Button>
                )}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 rounded-lg border bg-card shadow-sm overflow-hidden flex flex-col">
                {/* Week Days */}
                <div className="grid grid-cols-7 border-b bg-muted/40">
                    {weekDays.map(d => (
                        <div key={d} className="p-3 text-center text-sm font-medium text-muted-foreground">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-auto">
                    {days.map((day, idx) => {
                        const dayEvents = events.filter(e => e.date === format(day, "yyyy-MM-dd"));
                        const isCurrentMonth = isSameMonth(day, monthStart);

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => handleDayClick(day)}
                                className={cn(
                                    "min-h-[100px] border-b border-r p-2 transition-colors relative group",
                                    !isViewer ? "hover:bg-muted/30 cursor-pointer" : "",
                                    !isCurrentMonth && "bg-muted/10 text-muted-foreground",
                                    isToday(day) && "bg-primary/5"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                                        isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground/70"
                                    )}>
                                        {format(day, "d")}
                                    </span>
                                    {/* Short add button on hover */}
                                    {!isViewer && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-1"
                                            onClick={(e) => { e.stopPropagation(); handleDayClick(day); }}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>

                                <div className="mt-1 space-y-1">
                                    {dayEvents.map(event => (
                                        <div
                                            key={event.id}
                                            onClick={(e) => handleEventClick(e, event)}
                                            className={cn(
                                                "text-xs p-1 rounded px-1.5 truncate cursor-pointer transition-colors font-medium border-l-2",
                                                event.type === 'holiday' ? "bg-rose-100 text-rose-800 border-rose-500 dark:bg-rose-900/30 dark:text-rose-200" :
                                                    event.type === 'meeting' ? "bg-blue-100 text-blue-800 border-blue-500 dark:bg-blue-900/30 dark:text-blue-200" :
                                                        "bg-emerald-100 text-emerald-800 border-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-200"
                                            )}
                                        >
                                            {event.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add Event Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                {/* ... existing dialog content ... */}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Event for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Event Title</Label>
                            <Input value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} placeholder="e.g. Board Meeting" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Type</Label>
                                <Select value={eventType} onValueChange={(v: any) => setEventType(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="meeting">Meeting</SelectItem>
                                        <SelectItem value="event">Event</SelectItem>
                                        <SelectItem value="holiday">Holiday</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Time (Optional)</Label>
                                <Input type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <Textarea value={newEventDesc} onChange={e => setNewEventDesc(e.target.value)} placeholder="Additional details..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                        <Button onClick={handleSaveEvent}>Save Event</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View/Delete Event Dialog */}
            <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedEvent?.title}
                            <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full uppercase border",
                                selectedEvent?.type === 'holiday' ? "bg-rose-100 text-rose-800 border-rose-200" :
                                    selectedEvent?.type === 'meeting' ? "bg-blue-100 text-blue-800 border-blue-200" :
                                        "bg-emerald-100 text-emerald-800 border-emerald-200"
                            )}>
                                {selectedEvent?.type}
                            </span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{selectedEvent?.date && format(new Date(selectedEvent.date), "EEEE, MMMM d, yyyy")}</span>
                        </div>
                        {selectedEvent?.description && (
                            <div className="p-3 rounded-lg bg-muted/50 text-sm">
                                {selectedEvent.description}
                            </div>
                        )}
                    </div>
                    <DialogFooter className="gap-2 sm:justify-between">
                        {!isViewer && selectedEvent?.type !== 'holiday' ? (
                            <Button variant="destructive" onClick={handleDeleteEvent} className="gap-2">
                                <Trash2 className="h-4 w-4" /> Delete
                            </Button>
                        ) : (
                            <div className="text-xs text-muted-foreground italic flex items-center">
                                {selectedEvent?.type === 'holiday' ? "Cannot delete public holidays" : isViewer ? "Read-only access" : ""}
                            </div>
                        )}
                        <Button variant="secondary" onClick={() => setShowEventDialog(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Calendar;

import { useState } from 'react'
import { Plus, Calendar, Clock, Rocket, Star, Gift, Flame, Sparkles, Trophy, Edit2, Trash2 } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
import { Modal } from './modal'
import { Label } from './label'
import { Textarea } from './textarea'
import { Toggle, Checkbox } from './checkbox'
import { cn } from '@panel/lib/utils'
import { GameEvent, EventIcon } from '@panel/lib/api'
import { PrioritySelector } from './number-input'
import { CalendarModal } from './calendar-modal'

const EVENT_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
    '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
    '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
];

const EVENT_ICONS: { value: EventIcon; label: string; icon: typeof Rocket }[] = [
    { value: 'rocket', label: 'Rocket', icon: Rocket },
    { value: 'star', label: 'Star', icon: Star },
    { value: 'calendar', label: 'Calendar', icon: Calendar },
    { value: 'clock', label: 'Clock', icon: Clock },
    { value: 'gift', label: 'Gift', icon: Gift },
    { value: 'fire', label: 'Fire', icon: Flame },
    { value: 'sparkles', label: 'Sparkles', icon: Sparkles },
    { value: 'trophy', label: 'Trophy', icon: Trophy },
];

const EVENT_TYPES = [
    { value: 'countdown', label: 'Countdown', description: 'Count down to a specific date' },
    { value: 'event', label: 'Event', description: 'Event with start and end dates' },
    { value: 'announcement', label: 'Announcement', description: 'Simple announcement badge' },
];

interface EventEditorProps {
    events: GameEvent[];
    onChange: (events: GameEvent[]) => void;
    className?: string;
}

export function EventEditor({ events, onChange, className }: EventEditorProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Partial<GameEvent> | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const openCreate = () => {
        setEditingEvent({
            id: `event-${Date.now()}`,
            type: 'countdown',
            title: '',
            color: EVENT_COLORS[4],
            icon: 'rocket',
            showOnCard: true,
            showOnHero: false,
            showCountdown: true,
            active: true,
            priority: 0,
        });
        setEditingIndex(null);
        setIsModalOpen(true);
    };

    const openEdit = (event: GameEvent, index: number) => {
        setEditingEvent({ ...event });
        setEditingIndex(index);
        setIsModalOpen(true);
    };

    const saveEvent = () => {
        if (!editingEvent?.title) return;

        const newEvent = editingEvent as GameEvent;
        const updated = [...events];

        if (editingIndex !== null) {
            updated[editingIndex] = newEvent;
        } else {
            updated.push(newEvent);
        }

        // Sort by priority (higher first)
        updated.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        onChange(updated);
        setIsModalOpen(false);
        setEditingEvent(null);
        setEditingIndex(null);
    };

    const deleteEvent = (index: number) => {
        const updated = [...events];
        updated.splice(index, 1);
        onChange(updated);
    };

    const toggleActive = (index: number) => {
        const updated = [...events];
        updated[index] = { ...updated[index], active: !updated[index].active };
        onChange(updated);
    };

    const getEventIcon = (iconName?: EventIcon) => {
        const found = EVENT_ICONS.find(i => i.value === iconName);
        return found ? found.icon : Rocket;
    };

    const formatDateRange = (event: GameEvent) => {
        if (!event.startDate) return 'No date set';
        const start = new Date(event.startDate).toLocaleDateString();
        if (event.type === 'event' && event.endDate) {
            const end = new Date(event.endDate).toLocaleDateString();
            return `${start} → ${end}`;
        }
        return start;
    };

    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex items-center justify-between">
                <Label className="text-slate-200">Events & Countdowns</Label>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 gap-1"
                    onClick={openCreate}
                >
                    <Plus size={14} />
                    <span className="text-xs">Add Event</span>
                </Button>
            </div>

            {events.length === 0 ? (
                <div className="p-4 border border-dashed border-slate-700 rounded-lg text-center">
                    <p className="text-sm text-slate-500">No events configured</p>
                    <p className="text-xs text-slate-600 mt-1">Add countdowns, events, or announcements</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {events.map((event, index) => {
                        const Icon = getEventIcon(event.icon);
                        return (
                            <div
                                key={event.id}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg border transition-all",
                                    event.active
                                        ? "border-slate-700 bg-slate-800/50"
                                        : "border-slate-800 bg-slate-900/30 opacity-60"
                                )}
                            >
                                <div
                                    className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: `${event.color}20`, color: event.color }}
                                >
                                    <Icon size={18} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-200 truncate">{event.title}</span>
                                        <span className={cn(
                                            "text-[10px] px-1.5 py-0.5 rounded uppercase font-bold",
                                            event.type === 'countdown' && "bg-amber-500/20 text-amber-400",
                                            event.type === 'event' && "bg-blue-500/20 text-blue-400",
                                            event.type === 'announcement' && "bg-purple-500/20 text-purple-400",
                                        )}>
                                            {event.type}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                                        {formatDateRange(event)}
                                    </p>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                    <Toggle
                                        checked={event.active}
                                        onChange={() => toggleActive(index)}
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 hover:bg-slate-700"
                                        onClick={() => openEdit(event, index)}
                                    >
                                        <Edit2 size={12} className="text-slate-400" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 hover:bg-red-900/30 hover:text-red-400"
                                        onClick={() => deleteEvent(index)}
                                    >
                                        <Trash2 size={12} />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Event Editor Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingEvent(null);
                    setEditingIndex(null);
                }}
                title={editingIndex !== null ? "Edit Event" : "Create Event"}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button
                            onClick={saveEvent}
                            disabled={!editingEvent?.title}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {editingIndex !== null ? 'Save Changes' : 'Create Event'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-5">
                    {/* Event Type */}
                    <div className="space-y-2">
                        <Label>Event Type</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {EVENT_TYPES.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setEditingEvent(p => ({ ...p!, type: type.value as any }))}
                                    className={cn(
                                        "p-3 rounded-lg border-2 text-left transition-all",
                                        editingEvent?.type === type.value
                                            ? "border-indigo-500 bg-indigo-500/10"
                                            : "border-slate-700 hover:border-slate-600"
                                    )}
                                >
                                    <span className="text-sm font-medium text-slate-200 block">{type.label}</span>
                                    <span className="text-[10px] text-slate-500 block mt-0.5">{type.description}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input
                            value={editingEvent?.title || ''}
                            onChange={e => setEditingEvent(p => ({ ...p!, title: e.target.value }))}
                            placeholder="e.g. Beta Launch, Summer Event, Update 1.5"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label>Description (Optional)</Label>
                        <Textarea
                            value={editingEvent?.description || ''}
                            onChange={e => setEditingEvent(p => ({ ...p!, description: e.target.value }))}
                            placeholder="Additional details about the event..."
                            className="h-20"
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <CalendarModal
                            label={editingEvent?.type === 'event' ? 'Start Date' : 'Date'}
                            value={editingEvent?.startDate ? new Date(editingEvent.startDate) : null}
                            onChange={(date) => setEditingEvent(p => ({ ...p!, startDate: date?.toISOString() || '' }))}
                            placeholder="Pick a date..."
                            showTime={true}
                        />
                        {editingEvent?.type === 'event' && (
                            <CalendarModal
                                label="End Date"
                                value={editingEvent?.endDate ? new Date(editingEvent.endDate) : null}
                                onChange={(date) => setEditingEvent(p => ({ ...p!, endDate: date?.toISOString() || '' }))}
                                placeholder="Pick end date..."
                                showTime={true}
                                minDate={editingEvent?.startDate ? new Date(editingEvent.startDate) : undefined}
                            />
                        )}
                    </div>

                    {/* Color & Icon */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="grid grid-cols-8 gap-1.5">
                                {EVENT_COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setEditingEvent(p => ({ ...p!, color }))}
                                        className={cn(
                                            "h-7 w-7 rounded-md transition-all hover:scale-110",
                                            editingEvent?.color === color && "ring-2 ring-white ring-offset-2 ring-offset-slate-950"
                                        )}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Icon</Label>
                            <div className="grid grid-cols-4 gap-1.5">
                                {EVENT_ICONS.map(icon => {
                                    const IconComp = icon.icon;
                                    return (
                                        <button
                                            key={icon.value}
                                            type="button"
                                            onClick={() => setEditingEvent(p => ({ ...p!, icon: icon.value }))}
                                            className={cn(
                                                "h-9 rounded-md flex items-center justify-center transition-all",
                                                editingEvent?.icon === icon.value
                                                    ? "bg-indigo-500/20 text-indigo-400"
                                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                            )}
                                        >
                                            <IconComp size={16} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Display Options */}
                    <div className="space-y-3 pt-4 border-t border-slate-800">
                        <Label className="text-slate-300">Display Options</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Checkbox
                                checked={editingEvent?.showOnCard ?? true}
                                onChange={v => setEditingEvent(p => ({ ...p!, showOnCard: v }))}
                                label="Show on Game Card"
                                description="Display badge on game cards"
                                size="sm"
                            />
                            <Checkbox
                                checked={editingEvent?.showOnHero ?? false}
                                onChange={v => setEditingEvent(p => ({ ...p!, showOnHero: v }))}
                                label="Show in Hero"
                                description="Feature in hero section"
                                size="sm"
                            />
                            {editingEvent?.type !== 'announcement' && (
                                <Checkbox
                                    checked={editingEvent?.showCountdown ?? true}
                                    onChange={v => setEditingEvent(p => ({ ...p!, showCountdown: v }))}
                                    label="Show Countdown"
                                    description="Display countdown timer"
                                    size="sm"
                                />
                            )}
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Priority</Label>
                            <span className="text-xs text-slate-500">Higher values show first</span>
                        </div>
                        <PrioritySelector
                            value={editingEvent?.priority || 0}
                            onChange={(val) => setEditingEvent(p => ({ ...p!, priority: val }))}
                            max={5}
                        />
                    </div>

                    {/* Preview */}
                    <div className="pt-4 border-t border-slate-800">
                        <Label className="text-slate-400 mb-3 block">Preview</Label>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                            {editingEvent?.icon && (
                                <div
                                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: `${editingEvent.color}20`, color: editingEvent.color }}
                                >
                                    {(() => {
                                        const Icon = getEventIcon(editingEvent.icon);
                                        return <Icon size={18} />;
                                    })()}
                                </div>
                            )}
                            <div>
                                <span
                                    className="text-sm font-bold"
                                    style={{ color: editingEvent?.color }}
                                >
                                    {editingEvent?.title || 'Event Title'}
                                </span>
                                {editingEvent?.description && (
                                    <p className="text-xs text-slate-500 mt-0.5">{editingEvent.description}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

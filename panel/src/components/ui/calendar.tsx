import * as React from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@panel/lib/utils"
import { Button } from "./button"

interface CalendarProps {
    value?: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    className?: string;
    minDate?: Date;
    maxDate?: Date;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function Calendar({ value, onChange, placeholder = "Select date...", className, minDate, maxDate }: CalendarProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [viewDate, setViewDate] = React.useState(value || new Date());
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Close on outside click
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const days: { date: Date; isCurrentMonth: boolean }[] = [];

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, daysInPrevMonth - i),
                isCurrentMonth: false
            });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true
            });
        }

        // Next month days
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false
            });
        }

        return days;
    };

    const isDateDisabled = (date: Date) => {
        if (minDate && date < minDate) return true;
        if (maxDate && date > maxDate) return true;
        return false;
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const isToday = (date: Date) => isSameDay(date, new Date());

    const navigateMonth = (direction: 'prev' | 'next') => {
        setViewDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
            return newDate;
        });
    };

    const handleDateSelect = (date: Date) => {
        if (isDateDisabled(date)) return;
        onChange(date);
        setIsOpen(false);
    };

    const days = getDaysInMonth(viewDate);

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm transition-all duration-200",
                    "hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-slate-950",
                    isOpen && "border-indigo-600 ring-2 ring-indigo-600 ring-offset-2 ring-offset-slate-950"
                )}
            >
                <span className={cn(value ? "text-slate-100" : "text-slate-500")}>
                    {value ? value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : placeholder}
                </span>
                <CalendarIcon size={16} className="text-slate-400" />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-[300px] mt-2 p-4 rounded-xl border border-slate-800 bg-slate-950 shadow-xl shadow-black/50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => navigateMonth('prev')}
                        >
                            <ChevronLeft size={16} />
                        </Button>
                        <span className="font-semibold text-slate-100">
                            {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => navigateMonth('next')}
                        >
                            <ChevronRight size={16} />
                        </Button>
                    </div>

                    {/* Days header */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS.map(day => (
                            <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, i) => {
                            const isSelected = value && isSameDay(day.date, value);
                            const disabled = isDateDisabled(day.date);
                            const today = isToday(day.date);

                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleDateSelect(day.date)}
                                    disabled={disabled}
                                    className={cn(
                                        "h-9 w-9 rounded-lg text-sm font-medium transition-all duration-150 relative overflow-hidden",
                                        !day.isCurrentMonth && "text-slate-600",
                                        day.isCurrentMonth && !isSelected && "text-slate-300 hover:bg-slate-800",
                                        isSelected && "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25",
                                        disabled && "opacity-30 cursor-not-allowed",
                                        today && !isSelected && "ring-1 ring-indigo-500/50"
                                    )}
                                >
                                    {day.date.getDate()}
                                    {today && !isSelected && (
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-indigo-500" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick actions */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-slate-400"
                            onClick={() => {
                                onChange(null);
                                setIsOpen(false);
                            }}
                        >
                            Clear
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-indigo-400"
                            onClick={() => handleDateSelect(new Date())}
                        >
                            Today
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

// DateTime version of the calendar
interface DateTimePickerProps extends Omit<CalendarProps, 'onChange'> {
    value?: Date | null;
    onChange: (date: Date | null) => void;
    showTime?: boolean;
}

export function DateTimePicker({ value, onChange, showTime = true, ...props }: DateTimePickerProps) {
    const [time, setTime] = React.useState(value ? `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}` : '12:00');

    const handleDateChange = (date: Date | null) => {
        if (!date) {
            onChange(null);
            return;
        }
        const [hours, minutes] = time.split(':').map(Number);
        date.setHours(hours, minutes, 0, 0);
        onChange(date);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = e.target.value;
        setTime(newTime);
        if (value) {
            const [hours, minutes] = newTime.split(':').map(Number);
            const newDate = new Date(value);
            newDate.setHours(hours, minutes, 0, 0);
            onChange(newDate);
        }
    };

    return (
        <div className="flex gap-2">
            <Calendar {...props} value={value} onChange={handleDateChange} className="flex-1" />
            {showTime && (
                <input
                    type="time"
                    value={time}
                    onChange={handleTimeChange}
                    className="h-10 w-28 rounded-lg border border-slate-800 bg-slate-950 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
            )}
        </div>
    )
}

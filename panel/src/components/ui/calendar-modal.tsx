import * as React from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, X, Check } from "lucide-react"
import { cn } from "@panel/lib/utils"
import { Button } from "./button"
import { Modal } from "./modal"

interface CalendarModalProps {
    value?: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    className?: string;
    minDate?: Date;
    maxDate?: Date;
    showTime?: boolean;
    label?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function CalendarModal({
    value,
    onChange,
    placeholder = "Select date...",
    className,
    minDate,
    maxDate,
    showTime = true,
    label
}: CalendarModalProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [viewDate, setViewDate] = React.useState(value || new Date());
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(value || null);
    const [viewMode, setViewMode] = React.useState<'days' | 'months' | 'years'>('days');
    const [time, setTime] = React.useState(() => {
        if (value) {
            return {
                hours: value.getHours(),
                minutes: value.getMinutes()
            };
        }
        return { hours: 12, minutes: 0 };
    });

    // Sync when external value changes
    React.useEffect(() => {
        if (value) {
            setSelectedDate(value);
            setViewDate(value);
            setTime({
                hours: value.getHours(),
                minutes: value.getMinutes()
            });
        }
    }, [value]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const days: { date: Date; isCurrentMonth: boolean }[] = [];

        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, daysInPrevMonth - i),
                isCurrentMonth: false
            });
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true
            });
        }

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

    const navigateYear = (direction: 'prev' | 'next') => {
        setViewDate(prev => {
            const newDate = new Date(prev);
            newDate.setFullYear(prev.getFullYear() + (direction === 'next' ? 1 : -1));
            return newDate;
        });
    };

    const handleDateSelect = (date: Date) => {
        if (isDateDisabled(date)) return;
        const newDate = new Date(date);
        if (showTime) {
            newDate.setHours(time.hours, time.minutes, 0, 0);
        }
        setSelectedDate(newDate);
    };

    const handleMonthSelect = (month: number) => {
        setViewDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(month);
            return newDate;
        });
        setViewMode('days');
    };

    const handleYearSelect = (year: number) => {
        setViewDate(prev => {
            const newDate = new Date(prev);
            newDate.setFullYear(year);
            return newDate;
        });
        setViewMode('months');
    };

    const handleTimeChange = (type: 'hours' | 'minutes', direction: 'up' | 'down') => {
        setTime(prev => {
            let newValue = prev[type];
            const max = type === 'hours' ? 23 : 59;

            if (direction === 'up') {
                newValue = (newValue + 1) % (max + 1);
            } else {
                newValue = newValue === 0 ? max : newValue - 1;
            }

            const newTime = { ...prev, [type]: newValue };

            // Update selected date if one exists
            if (selectedDate) {
                const updated = new Date(selectedDate);
                updated.setHours(newTime.hours, newTime.minutes);
                setSelectedDate(updated);
            }

            return newTime;
        });
    };

    const handleConfirm = () => {
        onChange(selectedDate);
        setIsOpen(false);
    };

    const handleClear = () => {
        onChange(null);
        setSelectedDate(null);
        setIsOpen(false);
    };

    const formatDisplayValue = (date: Date) => {
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        if (showTime) {
            const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            return `${dateStr} at ${timeStr}`;
        }
        return dateStr;
    };

    const days = getDaysInMonth(viewDate);
    const yearStart = Math.floor(viewDate.getFullYear() / 12) * 12;
    const years = Array.from({ length: 12 }, (_, i) => yearStart + i);

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    {label}
                </label>
            )}

            {/* Trigger button */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all duration-200",
                    "border-slate-800 bg-slate-950",
                    "hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-slate-950"
                )}
            >
                <span className={cn(
                    "flex items-center gap-2",
                    value ? "text-slate-100" : "text-slate-500"
                )}>
                    <CalendarIcon size={16} className="text-slate-400" />
                    {value ? formatDisplayValue(value) : placeholder}
                </span>
                {value && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange(null);
                        }}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        <X size={14} />
                    </button>
                )}
            </button>

            {/* Modal */}
            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Select Date & Time"
                footer={
                    <>
                        <Button variant="ghost" onClick={handleClear}>Clear</Button>
                        <Button
                            onClick={handleConfirm}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Check size={16} className="mr-2" />
                            Confirm
                        </Button>
                    </>
                }
            >
                <div className="space-y-6">
                    {/* Header Navigation */}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => viewMode === 'years' ? navigateYear('prev') : navigateMonth('prev')}
                        >
                            <ChevronLeft size={18} />
                        </Button>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setViewMode(viewMode === 'months' ? 'days' : 'months')}
                                className="px-3 py-1.5 rounded-lg font-semibold text-slate-100 hover:bg-slate-800 transition-colors"
                            >
                                {MONTHS[viewDate.getMonth()]}
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode(viewMode === 'years' ? 'days' : 'years')}
                                className="px-3 py-1.5 rounded-lg font-semibold text-slate-100 hover:bg-slate-800 transition-colors"
                            >
                                {viewDate.getFullYear()}
                            </button>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => viewMode === 'years' ? navigateYear('next') : navigateMonth('next')}
                        >
                            <ChevronRight size={18} />
                        </Button>
                    </div>

                    {/* Days View */}
                    {viewMode === 'days' && (
                        <div className="space-y-2">
                            {/* Day headers */}
                            <div className="grid grid-cols-7 gap-1">
                                {DAYS.map(day => (
                                    <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {days.map((day, i) => {
                                    const isSelected = selectedDate && isSameDay(day.date, selectedDate);
                                    const disabled = isDateDisabled(day.date);
                                    const today = isToday(day.date);

                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handleDateSelect(day.date)}
                                            disabled={disabled}
                                            className={cn(
                                                "h-10 w-10 rounded-xl text-sm font-medium transition-all duration-150 relative",
                                                !day.isCurrentMonth && "text-slate-600",
                                                day.isCurrentMonth && !isSelected && "text-slate-300 hover:bg-slate-800",
                                                isSelected && "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30",
                                                disabled && "opacity-30 cursor-not-allowed",
                                                today && !isSelected && "ring-2 ring-indigo-500/40"
                                            )}
                                        >
                                            {day.date.getDate()}
                                            {today && !isSelected && (
                                                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-indigo-500" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Months View */}
                    {viewMode === 'months' && (
                        <div className="grid grid-cols-3 gap-2">
                            {MONTHS_SHORT.map((month, i) => {
                                const isSelected = selectedDate && selectedDate.getMonth() === i && selectedDate.getFullYear() === viewDate.getFullYear();
                                const isCurrent = new Date().getMonth() === i && new Date().getFullYear() === viewDate.getFullYear();

                                return (
                                    <button
                                        key={month}
                                        type="button"
                                        onClick={() => handleMonthSelect(i)}
                                        className={cn(
                                            "py-3 rounded-xl text-sm font-medium transition-all duration-150",
                                            isSelected
                                                ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg"
                                                : "text-slate-300 hover:bg-slate-800",
                                            isCurrent && !isSelected && "ring-2 ring-indigo-500/40"
                                        )}
                                    >
                                        {month}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Years View */}
                    {viewMode === 'years' && (
                        <div className="grid grid-cols-3 gap-2">
                            {years.map((year) => {
                                const isSelected = selectedDate && selectedDate.getFullYear() === year;
                                const isCurrent = new Date().getFullYear() === year;

                                return (
                                    <button
                                        key={year}
                                        type="button"
                                        onClick={() => handleYearSelect(year)}
                                        className={cn(
                                            "py-3 rounded-xl text-sm font-medium transition-all duration-150",
                                            isSelected
                                                ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg"
                                                : "text-slate-300 hover:bg-slate-800",
                                            isCurrent && !isSelected && "ring-2 ring-indigo-500/40"
                                        )}
                                    >
                                        {year}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Time Picker */}
                    {showTime && viewMode === 'days' && (
                        <div className="pt-4 border-t border-slate-800">
                            <div className="flex items-center justify-center gap-4">
                                <div className="flex items-center gap-1 text-slate-400">
                                    <Clock size={16} />
                                    <span className="text-sm">Time</span>
                                </div>

                                <div className="flex items-center gap-1 bg-slate-900 rounded-xl p-1">
                                    {/* Hours */}
                                    <div className="flex flex-col">
                                        <button
                                            type="button"
                                            onClick={() => handleTimeChange('hours', 'up')}
                                            className="px-3 py-1 text-slate-400 hover:text-slate-200 transition-colors"
                                        >
                                            <ChevronLeft size={14} className="rotate-90" />
                                        </button>
                                        <div className="w-12 text-center font-mono text-lg font-bold text-slate-100 py-1">
                                            {String(time.hours).padStart(2, '0')}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleTimeChange('hours', 'down')}
                                            className="px-3 py-1 text-slate-400 hover:text-slate-200 transition-colors"
                                        >
                                            <ChevronLeft size={14} className="-rotate-90" />
                                        </button>
                                    </div>

                                    <span className="text-2xl font-bold text-slate-500">:</span>

                                    {/* Minutes */}
                                    <div className="flex flex-col">
                                        <button
                                            type="button"
                                            onClick={() => handleTimeChange('minutes', 'up')}
                                            className="px-3 py-1 text-slate-400 hover:text-slate-200 transition-colors"
                                        >
                                            <ChevronLeft size={14} className="rotate-90" />
                                        </button>
                                        <div className="w-12 text-center font-mono text-lg font-bold text-slate-100 py-1">
                                            {String(time.minutes).padStart(2, '0')}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleTimeChange('minutes', 'down')}
                                            className="px-3 py-1 text-slate-400 hover:text-slate-200 transition-colors"
                                        >
                                            <ChevronLeft size={14} className="-rotate-90" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800">
                        <QuickButton onClick={() => handleDateSelect(new Date())}>
                            Today
                        </QuickButton>
                        <QuickButton onClick={() => {
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            handleDateSelect(tomorrow);
                        }}>
                            Tomorrow
                        </QuickButton>
                        <QuickButton onClick={() => {
                            const nextWeek = new Date();
                            nextWeek.setDate(nextWeek.getDate() + 7);
                            handleDateSelect(nextWeek);
                        }}>
                            Next Week
                        </QuickButton>
                        <QuickButton onClick={() => {
                            const nextMonth = new Date();
                            nextMonth.setMonth(nextMonth.getMonth() + 1);
                            handleDateSelect(nextMonth);
                        }}>
                            Next Month
                        </QuickButton>
                    </div>

                    {/* Selected Date Preview */}
                    {selectedDate && (
                        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
                            <p className="text-xs text-slate-400 mb-1">Selected</p>
                            <p className="text-lg font-semibold text-slate-100">
                                {formatDisplayValue(selectedDate)}
                            </p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}

function QuickButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 bg-slate-800/50 hover:bg-slate-800 hover:text-slate-200 transition-all duration-150"
        >
            {children}
        </button>
    );
}

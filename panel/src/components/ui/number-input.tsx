import * as React from "react"
import { Minus, Plus } from "lucide-react"
import { cn } from "@panel/lib/utils"

interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    suffix?: string;
    prefix?: string;
    disabled?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    showSlider?: boolean;
}

export function NumberInput({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    label,
    suffix,
    prefix,
    disabled = false,
    className,
    size = 'md',
    showSlider = false
}: NumberInputProps) {
    const [isFocused, setIsFocused] = React.useState(false);
    const [isDragging, setIsDragging] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const sizes = {
        sm: { container: 'h-8', button: 'w-7', input: 'text-xs', icon: 12 },
        md: { container: 'h-10', button: 'w-9', input: 'text-sm', icon: 14 },
        lg: { container: 'h-12', button: 'w-11', input: 'text-base', icon: 16 }
    };

    const s = sizes[size];

    const clamp = (n: number) => Math.max(min, Math.min(max, n));
    const percentage = ((value - min) / (max - min)) * 100;

    const increment = () => {
        if (!disabled) onChange(clamp(value + step));
    };

    const decrement = () => {
        if (!disabled) onChange(clamp(value - step));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const parsed = parseFloat(e.target.value);
        if (!isNaN(parsed)) {
            onChange(clamp(parsed));
        } else if (e.target.value === '' || e.target.value === '-') {
            // Allow empty or negative sign while typing
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
        // Ensure value is clamped on blur
        onChange(clamp(value));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            increment();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            decrement();
        }
    };

    // Scroll to adjust value
    const handleWheel = (e: React.WheelEvent) => {
        if (!disabled && isFocused) {
            e.preventDefault();
            if (e.deltaY < 0) {
                increment();
            } else {
                decrement();
            }
        }
    };

    // Slider drag handling
    const handleSliderInteraction = (e: React.MouseEvent | React.TouchEvent) => {
        if (disabled || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const newValue = min + percentage * (max - min);

        // Round to step
        const steppedValue = Math.round(newValue / step) * step;
        onChange(clamp(steppedValue));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!showSlider || disabled) return;
        setIsDragging(true);
        handleSliderInteraction(e);
    };

    React.useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = Math.max(0, Math.min(1, x / rect.width));
            const newValue = min + percentage * (max - min);
            const steppedValue = Math.round(newValue / step) * step;
            onChange(clamp(steppedValue));
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, min, max, step, onChange]);

    return (
        <div className={cn("space-y-2", className)}>
            {label && (
                <label className="text-sm font-medium text-slate-300">
                    {label}
                </label>
            )}

            <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                className={cn(
                    "relative flex items-stretch rounded-lg overflow-hidden border transition-all duration-200",
                    isFocused || isDragging
                        ? "border-indigo-500 ring-2 ring-indigo-500/20"
                        : "border-slate-800 hover:border-slate-700",
                    disabled && "opacity-50 cursor-not-allowed",
                    s.container
                )}
            >
                {/* Progress fill / slider track */}
                {showSlider && (
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 pointer-events-none transition-all duration-150"
                        style={{ width: `${percentage}%` }}
                    />
                )}

                {/* Decrement button */}
                <button
                    type="button"
                    onClick={decrement}
                    disabled={disabled || value <= min}
                    className={cn(
                        s.button,
                        "flex items-center justify-center shrink-0 bg-slate-900 text-slate-400 transition-all duration-150",
                        "hover:bg-slate-800 hover:text-slate-200 active:bg-slate-700",
                        "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-900 disabled:hover:text-slate-400",
                        "border-r border-slate-800"
                    )}
                >
                    <Minus size={s.icon} />
                </button>

                {/* Input area */}
                <div className="flex-1 flex items-center justify-center gap-1.5 bg-slate-950 relative">
                    {prefix && (
                        <span className={cn("text-slate-500", s.input)}>{prefix}</span>
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        inputMode="numeric"
                        value={value}
                        onChange={handleInputChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        onWheel={handleWheel}
                        disabled={disabled}
                        className={cn(
                            "w-full bg-transparent text-center font-medium text-slate-100 outline-none tabular-nums",
                            "selection:bg-indigo-500/30",
                            s.input,
                            showSlider && "cursor-ew-resize"
                        )}
                    />
                    {suffix && (
                        <span className={cn("text-slate-500", s.input)}>{suffix}</span>
                    )}
                </div>

                {/* Increment button */}
                <button
                    type="button"
                    onClick={increment}
                    disabled={disabled || value >= max}
                    className={cn(
                        s.button,
                        "flex items-center justify-center shrink-0 bg-slate-900 text-slate-400 transition-all duration-150",
                        "hover:bg-slate-800 hover:text-slate-200 active:bg-slate-700",
                        "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-900 disabled:hover:text-slate-400",
                        "border-l border-slate-800"
                    )}
                >
                    <Plus size={s.icon} />
                </button>
            </div>

            {/* Min/Max labels */}
            {showSlider && (
                <div className="flex justify-between text-[10px] text-slate-600 px-1">
                    <span>{min}</span>
                    <span>{max}</span>
                </div>
            )}
        </div>
    );
}

// Compact stepper variant - just buttons, no visible input
interface StepperProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    className?: string;
}

export function Stepper({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    className
}: StepperProps) {
    const clamp = (n: number) => Math.max(min, Math.min(max, n));

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <button
                type="button"
                onClick={() => !disabled && onChange(clamp(value - step))}
                disabled={disabled || value <= min}
                className={cn(
                    "h-7 w-7 rounded-lg flex items-center justify-center",
                    "bg-slate-800 text-slate-400 border border-slate-700",
                    "transition-all duration-150",
                    "hover:bg-slate-700 hover:text-slate-200 hover:border-slate-600",
                    "active:scale-95",
                    "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-800 disabled:hover:text-slate-400"
                )}
            >
                <Minus size={12} />
            </button>

            <span className="min-w-[2rem] text-center font-semibold text-slate-200 tabular-nums text-sm">
                {value}
            </span>

            <button
                type="button"
                onClick={() => !disabled && onChange(clamp(value + step))}
                disabled={disabled || value >= max}
                className={cn(
                    "h-7 w-7 rounded-lg flex items-center justify-center",
                    "bg-slate-800 text-slate-400 border border-slate-700",
                    "transition-all duration-150",
                    "hover:bg-slate-700 hover:text-slate-200 hover:border-slate-600",
                    "active:scale-95",
                    "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-800 disabled:hover:text-slate-400"
                )}
            >
                <Plus size={12} />
            </button>
        </div>
    );
}

// Priority Selector - visual priority scale
interface PrioritySelectorProps {
    value: number;
    onChange: (value: number) => void;
    max?: number;
    disabled?: boolean;
    className?: string;
}

export function PrioritySelector({
    value,
    onChange,
    max = 5,
    disabled = false,
    className
}: PrioritySelectorProps) {
    const levels = Array.from({ length: max + 1 }, (_, i) => i);

    const getColor = (level: number) => {
        if (level === 0) return 'bg-slate-700 border-slate-600';
        if (level <= max * 0.33) return 'bg-green-500/20 border-green-500/50 text-green-400';
        if (level <= max * 0.66) return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
        return 'bg-red-500/20 border-red-500/50 text-red-400';
    };

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-center gap-1">
                {levels.map((level) => (
                    <button
                        key={level}
                        type="button"
                        onClick={() => !disabled && onChange(level)}
                        disabled={disabled}
                        className={cn(
                            "h-8 w-8 rounded-lg border-2 transition-all duration-200 text-xs font-bold",
                            "hover:scale-110 active:scale-95",
                            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                            value === level
                                ? cn(getColor(level), "ring-2 ring-offset-1 ring-offset-slate-950")
                                : "bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600",
                            value === level && level === 0 && "ring-slate-500",
                            value === level && level > 0 && level <= max * 0.33 && "ring-green-500",
                            value === level && level > max * 0.33 && level <= max * 0.66 && "ring-amber-500",
                            value === level && level > max * 0.66 && "ring-red-500"
                        )}
                    >
                        {level}
                    </button>
                ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 px-1">
                <span>Low</span>
                <span>High</span>
            </div>
        </div>
    );
}

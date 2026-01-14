import * as React from "react"
import { cn } from "@panel/lib/utils"

interface SliderProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    showValue?: boolean;
    className?: string;
    label?: string;
}

export function Slider({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    showValue = false,
    className,
    label
}: SliderProps) {
    const trackRef = React.useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const percentage = ((value - min) / (max - min)) * 100;

    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (disabled || !trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newValue = min + percent * (max - min);
        const steppedValue = Math.round(newValue / step) * step;
        onChange(Math.max(min, Math.min(max, steppedValue)));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (disabled) return;
        e.preventDefault();
        setIsDragging(true);
    };

    React.useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!trackRef.current) return;
            const rect = trackRef.current.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const newValue = min + percent * (max - min);
            const steppedValue = Math.round(newValue / step) * step;
            onChange(Math.max(min, Math.min(max, steppedValue)));
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
        <div className={cn("flex flex-col gap-2", className)}>
            {(label || showValue) && (
                <div className="flex justify-between items-center">
                    {label && <span className="text-sm text-slate-400">{label}</span>}
                    {showValue && (
                        <span className="text-sm font-medium text-indigo-400 tabular-nums">
                            {value}
                        </span>
                    )}
                </div>
            )}
            <div
                ref={trackRef}
                onClick={handleTrackClick}
                className={cn(
                    "relative h-2 w-full rounded-full bg-slate-800 cursor-pointer group",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                {/* Filled track */}
                <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all duration-100"
                    style={{ width: `${percentage}%` }}
                />

                {/* Thumb */}
                <div
                    onMouseDown={handleMouseDown}
                    className={cn(
                        "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-white shadow-lg transition-all duration-100",
                        "border-2 border-indigo-500",
                        !disabled && "hover:scale-110 active:scale-95",
                        isDragging && "scale-110 shadow-xl shadow-indigo-500/30",
                        "group-hover:shadow-lg group-hover:shadow-indigo-500/20"
                    )}
                    style={{ left: `${percentage}%` }}
                />

                {/* Glow effect on track */}
                <div
                    className="absolute h-full rounded-full bg-indigo-500/20 blur-sm pointer-events-none"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}

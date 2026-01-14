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
    const percentage = ((value - min) / (max - min)) * 100;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(Number(e.target.value));
    };

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {(label || showValue) && (
                <div className="flex justify-between items-center">
                    {label && <span className="text-sm text-slate-400">{label}</span>}
                    {showValue && (
                        <span className="text-sm font-medium text-indigo-400 tabular-nums min-w-[3ch] text-right">
                            {value}
                        </span>
                    )}
                </div>
            )}
            <div className="relative h-6 flex items-center">
                {/* Track background */}
                <div className="absolute inset-x-0 h-2 rounded-full bg-slate-800" />

                {/* Filled track */}
                <div
                    className="absolute left-0 h-2 rounded-full bg-indigo-600 pointer-events-none"
                    style={{ width: `${percentage}%` }}
                />

                {/* Native input for accessibility - styled to be invisible but functional */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={handleChange}
                    disabled={disabled}
                    className={cn(
                        "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10",
                        disabled && "cursor-not-allowed"
                    )}
                />

                {/* Custom thumb */}
                <div
                    className={cn(
                        "absolute h-5 w-5 rounded-full bg-white shadow-lg border-2 border-indigo-500 pointer-events-none transition-transform",
                        "transform -translate-x-1/2",
                        disabled && "opacity-50"
                    )}
                    style={{ left: `${percentage}%` }}
                />
            </div>
        </div>
    )
}

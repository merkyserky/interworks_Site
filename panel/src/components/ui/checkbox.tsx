import { Check } from "lucide-react"
import { cn } from "@panel/lib/utils"

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
    disabled?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function Checkbox({
    checked,
    onChange,
    label,
    description,
    disabled = false,
    className,
    size = 'md'
}: CheckboxProps) {
    const sizes = {
        sm: { box: 'h-4 w-4', icon: 12 },
        md: { box: 'h-5 w-5', icon: 14 },
        lg: { box: 'h-6 w-6', icon: 16 }
    };

    const s = sizes[size];

    return (
        <label
            className={cn(
                "flex items-start gap-3 cursor-pointer group",
                disabled && "cursor-not-allowed opacity-50",
                className
            )}
        >
            <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => !disabled && onChange(!checked)}
                disabled={disabled}
                className={cn(
                    s.box,
                    "relative shrink-0 rounded-md border-2 transition-all duration-200 mt-0.5",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-slate-950",
                    checked
                        ? "bg-gradient-to-br from-indigo-600 to-violet-600 border-transparent shadow-lg shadow-indigo-500/30"
                        : "border-slate-600 bg-slate-900 group-hover:border-slate-500",
                    "active:scale-90"
                )}
            >
                <Check
                    size={s.icon}
                    className={cn(
                        "absolute inset-0 m-auto text-white transition-all duration-200",
                        checked ? "opacity-100 scale-100" : "opacity-0 scale-50"
                    )}
                    strokeWidth={3}
                />

                {/* Ripple effect on check */}
                <div
                    className={cn(
                        "absolute inset-0 rounded-md bg-indigo-400 transition-all duration-300",
                        checked ? "animate-ping opacity-0" : "opacity-0"
                    )}
                />
            </button>

            {(label || description) && (
                <div className="flex flex-col gap-0.5 select-none">
                    {label && (
                        <span className="text-sm font-medium text-slate-200 group-hover:text-slate-100 transition-colors">
                            {label}
                        </span>
                    )}
                    {description && (
                        <span className="text-xs text-slate-500">
                            {description}
                        </span>
                    )}
                </div>
            )}
        </label>
    )
}

// Toggle Switch variant
interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
    disabled?: boolean;
    className?: string;
}

export function Toggle({ checked, onChange, label, description, disabled = false, className }: ToggleProps) {
    return (
        <label
            className={cn(
                "flex items-center justify-between gap-4 cursor-pointer group",
                disabled && "cursor-not-allowed opacity-50",
                className
            )}
        >
            {(label || description) && (
                <div className="flex flex-col gap-0.5 select-none">
                    {label && (
                        <span className="text-sm font-medium text-slate-200">
                            {label}
                        </span>
                    )}
                    {description && (
                        <span className="text-xs text-slate-500">
                            {description}
                        </span>
                    )}
                </div>
            )}

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => !disabled && onChange(!checked)}
                disabled={disabled}
                className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full transition-all duration-300",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-slate-950",
                    checked
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/30"
                        : "bg-slate-700"
                )}
            >
                <span
                    className={cn(
                        "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300",
                        checked && "translate-x-5"
                    )}
                />
            </button>
        </label>
    )
}

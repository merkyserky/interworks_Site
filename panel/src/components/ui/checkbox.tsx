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
        sm: { box: 'h-4 w-4', icon: 10, rounded: 'rounded' },
        md: { box: 'h-5 w-5', icon: 12, rounded: 'rounded-md' },
        lg: { box: 'h-6 w-6', icon: 14, rounded: 'rounded-md' }
    };

    const s = sizes[size];

    return (
        <label
            className={cn(
                "flex items-start gap-3 cursor-pointer group select-none",
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
                    s.rounded,
                    "relative shrink-0 transition-all duration-200 mt-0.5",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                    checked
                        ? "bg-indigo-600 border-indigo-600"
                        : "bg-slate-900 border-slate-600 hover:border-slate-500",
                    "border-2"
                )}
            >
                <div className={cn(
                    "absolute inset-0 flex items-center justify-center transition-all duration-200",
                    checked ? "opacity-100 scale-100" : "opacity-0 scale-75"
                )}>
                    <Check
                        size={s.icon}
                        className="text-white"
                        strokeWidth={3}
                    />
                </div>
            </button>

            {(label || description) && (
                <div className="flex flex-col gap-0.5">
                    {label && (
                        <span className="text-sm font-medium text-slate-200 group-hover:text-slate-100 transition-colors leading-tight">
                            {label}
                        </span>
                    )}
                    {description && (
                        <span className="text-xs text-slate-500 leading-tight">
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
                "flex items-center justify-between gap-4 cursor-pointer group select-none",
                disabled && "cursor-not-allowed opacity-50",
                className
            )}
        >
            {(label || description) && (
                <div className="flex flex-col gap-0.5">
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
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                    checked
                        ? "bg-indigo-600"
                        : "bg-slate-700"
                )}
            >
                <span
                    className={cn(
                        "absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200",
                        checked && "translate-x-5"
                    )}
                />
            </button>
        </label>
    )
}

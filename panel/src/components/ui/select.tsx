import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@panel/lib/utils"

interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function Select({ value, onChange, options, placeholder = "Select...", disabled, className }: SelectProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

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

    // Close on Escape
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm transition-all duration-200",
                    "hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-slate-950",
                    disabled && "opacity-50 cursor-not-allowed",
                    isOpen && "border-indigo-600 ring-2 ring-indigo-600 ring-offset-2 ring-offset-slate-950"
                )}
            >
                <span className={cn(
                    "truncate",
                    selectedOption ? "text-slate-100" : "text-slate-500"
                )}>
                    {selectedOption?.label || placeholder}
                </span>
                <ChevronDown
                    size={16}
                    className={cn(
                        "text-slate-400 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 py-1 rounded-lg border border-slate-800 bg-slate-950 shadow-xl shadow-black/50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                if (!option.disabled) {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }
                            }}
                            disabled={option.disabled}
                            className={cn(
                                "flex w-full items-center justify-between px-3 py-2.5 text-sm transition-colors",
                                option.value === value
                                    ? "bg-indigo-600/10 text-indigo-400"
                                    : "text-slate-300 hover:bg-slate-800/50",
                                option.disabled && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <span className="truncate">{option.label}</span>
                            {option.value === value && (
                                <Check size={16} className="text-indigo-400 shrink-0 ml-2" />
                            )}
                        </button>
                    ))}
                    {options.length === 0 && (
                        <div className="px-3 py-2 text-sm text-slate-500 text-center">
                            No options available
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

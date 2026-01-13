import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@panel/lib/utils"
import { Button } from "./button"

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

export function Modal({ isOpen, onClose, title, children, footer, className }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className={cn("relative w-full max-w-lg rounded-xl border border-slate-800 bg-slate-950 shadow-2xl animate-in fade-in zoom-in-95 duration-200", className)}>
                <div className="flex items-center justify-between border-b border-slate-800 p-6">
                    <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-400 hover:text-white">
                        <X size={18} />
                    </Button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    {children}
                </div>
                {footer && (
                    <div className="flex items-center justify-end gap-2 border-t border-slate-800 p-6 bg-slate-900/50 rounded-b-xl">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}

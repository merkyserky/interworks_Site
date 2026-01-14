import * as React from "react"
import { Keyboard, X } from "lucide-react"
import { cn } from "@panel/lib/utils"
import { Button } from "./button"

interface KeyboardShortcutsProps {
    className?: string;
}

const SHORTCUTS = [
    { keys: ['Ctrl', 'K'], action: 'Open command palette', category: 'Navigation' },
    { keys: ['Ctrl', 'S'], action: 'Save current item', category: 'Actions' },
    { keys: ['Escape'], action: 'Close modal / cancel', category: 'Actions' },
    { keys: ['↑', '↓'], action: 'Navigate list items', category: 'Navigation' },
    { keys: ['Enter'], action: 'Select / confirm', category: 'Actions' },
    { keys: ['Ctrl', 'N'], action: 'Create new item', category: 'Actions' },
];

export function KeyboardShortcutsButton({ className }: KeyboardShortcutsProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className={cn("h-9 w-9 text-slate-500 hover:text-slate-300", className)}
                onClick={() => setIsOpen(true)}
                title="Keyboard shortcuts"
            >
                <Keyboard size={18} />
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-[100]">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                        <Keyboard size={20} />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-slate-100">Keyboard Shortcuts</h2>
                                        <p className="text-xs text-slate-500">Navigate faster with these shortcuts</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-800"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-5 space-y-4">
                                {Object.entries(
                                    SHORTCUTS.reduce((acc, s) => {
                                        if (!acc[s.category]) acc[s.category] = [];
                                        acc[s.category].push(s);
                                        return acc;
                                    }, {} as Record<string, typeof SHORTCUTS>)
                                ).map(([category, shortcuts]) => (
                                    <div key={category}>
                                        <h3 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-2">
                                            {category}
                                        </h3>
                                        <div className="space-y-2">
                                            {shortcuts.map((shortcut, i) => (
                                                <div key={i} className="flex items-center justify-between py-1.5">
                                                    <span className="text-sm text-slate-300">{shortcut.action}</span>
                                                    <div className="flex items-center gap-1">
                                                        {shortcut.keys.map((key, j) => (
                                                            <React.Fragment key={j}>
                                                                <kbd className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 min-w-[24px] text-center">
                                                                    {key}
                                                                </kbd>
                                                                {j < shortcut.keys.length - 1 && (
                                                                    <span className="text-slate-600 text-xs">+</span>
                                                                )}
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/50">
                                <p className="text-xs text-slate-500 text-center">
                                    Pro tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">?</kbd> anywhere to show these shortcuts
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Hook to show shortcuts on '?' key
export function useKeyboardShortcutsHint(onShow: () => void) {
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
                const target = e.target as HTMLElement;
                // Don't trigger if typing in an input
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
                e.preventDefault();
                onShow();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onShow]);
}

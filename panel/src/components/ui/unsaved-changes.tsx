import * as React from "react"
import { AlertTriangle, Save, X } from "lucide-react"
import { Button } from "./button"

interface UnsavedChangesProps {
    hasChanges: boolean;
    onSave: () => void;
    onDiscard: () => void;
    isSaving?: boolean;
}

/**
 * A floating bar that appears when there are unsaved changes
 */
export function UnsavedChangesBar({ hasChanges, onSave, onDiscard, isSaving }: UnsavedChangesProps) {
    if (!hasChanges) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl shadow-amber-500/10">
                <div className="flex items-center gap-2 text-amber-400">
                    <AlertTriangle size={18} />
                    <span className="text-sm font-medium">You have unsaved changes</span>
                </div>

                <div className="h-4 w-px bg-slate-700" />

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDiscard}
                        disabled={isSaving}
                        className="text-slate-400 hover:text-slate-200"
                    >
                        <X size={14} className="mr-1" />
                        Discard
                    </Button>
                    <Button
                        size="sm"
                        onClick={onSave}
                        disabled={isSaving}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Save size={14} className="mr-1" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

/**
 * Hook to track form changes
 */
export function useUnsavedChanges<T>(initialValue: T, currentValue: T) {
    const [hasChanges, setHasChanges] = React.useState(false);

    React.useEffect(() => {
        const initial = JSON.stringify(initialValue);
        const current = JSON.stringify(currentValue);
        setHasChanges(initial !== current);
    }, [initialValue, currentValue]);

    // Warn before leaving page
    React.useEffect(() => {
        if (!hasChanges) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasChanges]);

    return hasChanges;
}

/**
 * Inline unsaved indicator (small dot)
 */
export function UnsavedIndicator({ hasChanges }: { hasChanges: boolean }) {
    if (!hasChanges) return null;

    return (
        <div className="relative">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <div className="absolute inset-0 h-2 w-2 rounded-full bg-amber-500 animate-ping" />
        </div>
    );
}

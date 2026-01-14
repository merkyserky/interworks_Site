import { useState, useEffect, useCallback, useRef } from 'react'

const DRAFT_PREFIX = 'panel-draft-';
const DRAFT_EXPIRY_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

interface Draft<T> {
    data: T;
    timestamp: number;
    entityId?: string;
}

/**
 * Hook for auto-saving form drafts to localStorage
 * 
 * Usage:
 * const { draft, saveDraft, clearDraft, hasDraft, draftAge } = useAutoSaveDraft('game-editor', gameId);
 */
export function useAutoSaveDraft<T>(
    key: string,
    entityId?: string,
    options: {
        debounceMs?: number;
        onRestore?: (data: T) => void;
    } = {}
) {
    const { debounceMs = 1000, onRestore } = options;
    const fullKey = entityId ? `${DRAFT_PREFIX}${key}-${entityId}` : `${DRAFT_PREFIX}${key}`;

    const [hasDraft, setHasDraft] = useState(false);
    const [draftAge, setDraftAge] = useState<string>('');
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const restoreCalledRef = useRef(false);

    // Check for existing draft on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(fullKey);
            if (stored) {
                const draft: Draft<T> = JSON.parse(stored);
                const age = Date.now() - draft.timestamp;

                // Check if draft has expired
                if (age > DRAFT_EXPIRY_MS) {
                    localStorage.removeItem(fullKey);
                    setHasDraft(false);
                    return;
                }

                setHasDraft(true);
                setDraftAge(formatAge(age));

                // Auto-restore if callback provided and not already restored
                if (onRestore && !restoreCalledRef.current) {
                    restoreCalledRef.current = true;
                }
            }
        } catch (e) {
            console.error('Failed to load draft:', e);
        }
    }, [fullKey, onRestore]);

    // Save draft with debounce
    const saveDraft = useCallback((data: T) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            try {
                const draft: Draft<T> = {
                    data,
                    timestamp: Date.now(),
                    entityId
                };
                localStorage.setItem(fullKey, JSON.stringify(draft));
                setHasDraft(true);
                setDraftAge('just now');
            } catch (e) {
                console.error('Failed to save draft:', e);
            }
        }, debounceMs);
    }, [fullKey, entityId, debounceMs]);

    // Clear draft
    const clearDraft = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        try {
            localStorage.removeItem(fullKey);
            setHasDraft(false);
            setDraftAge('');
        } catch (e) {
            console.error('Failed to clear draft:', e);
        }
    }, [fullKey]);

    // Get draft data
    const getDraft = useCallback((): T | null => {
        try {
            const stored = localStorage.getItem(fullKey);
            if (stored) {
                const draft: Draft<T> = JSON.parse(stored);
                return draft.data;
            }
        } catch (e) {
            console.error('Failed to get draft:', e);
        }
        return null;
    }, [fullKey]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        hasDraft,
        draftAge,
        saveDraft,
        clearDraft,
        getDraft
    };
}

/**
 * List all drafts in localStorage
 */
export function getAllDrafts(): { key: string; age: string; timestamp: number }[] {
    const drafts: { key: string; age: string; timestamp: number }[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(DRAFT_PREFIX)) {
            try {
                const stored = localStorage.getItem(key);
                if (stored) {
                    const draft = JSON.parse(stored);
                    const age = Date.now() - draft.timestamp;
                    if (age <= DRAFT_EXPIRY_MS) {
                        drafts.push({
                            key: key.replace(DRAFT_PREFIX, ''),
                            age: formatAge(age),
                            timestamp: draft.timestamp
                        });
                    } else {
                        // Clean up expired draft
                        localStorage.removeItem(key);
                    }
                }
            } catch (e) {
                // Ignore invalid drafts
            }
        }
    }

    return drafts.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Clear all drafts
 */
export function clearAllDrafts() {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(DRAFT_PREFIX)) {
            keysToRemove.push(key);
        }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
}

function formatAge(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

// React component to show draft recovery prompt
import { AlertTriangle, RefreshCw, X } from 'lucide-react'
import { Button } from './button'

interface DraftRecoveryPromptProps {
    draftAge: string;
    onRestore: () => void;
    onDiscard: () => void;
}

export function DraftRecoveryPrompt({ draftAge, onRestore, onDiscard }: DraftRecoveryPromptProps) {
    return (
        <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <AlertTriangle size={20} />
                </div>
                <div>
                    <p className="text-sm font-medium text-amber-200">Unsaved draft found</p>
                    <p className="text-xs text-amber-400/70">Last saved {draftAge}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDiscard}
                    className="text-slate-400 hover:text-slate-200"
                >
                    <X size={14} className="mr-1" />
                    Discard
                </Button>
                <Button
                    size="sm"
                    onClick={onRestore}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                    <RefreshCw size={14} className="mr-1" />
                    Restore
                </Button>
            </div>
        </div>
    );
}

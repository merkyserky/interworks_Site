import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@panel/lib/utils'

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// Convenience hooks
export function useNotify() {
    const { addToast } = useToast();
    return {
        success: (message: string) => addToast(message, 'success'),
        error: (message: string) => addToast(message, 'error'),
        warning: (message: string) => addToast(message, 'warning'),
        info: (message: string) => addToast(message, 'info'),
    };
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info', duration: number = 4000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setToasts(prev => [...prev, { id, message, type, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            {toasts.map((toast, index) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onRemove={() => onRemove(toast.id)}
                    style={{ animationDelay: `${index * 50}ms` }}
                />
            ))}
        </div>
    );
}

const toastStyles: Record<ToastType, { icon: typeof CheckCircle; bg: string; border: string; iconColor: string }> = {
    success: {
        icon: CheckCircle,
        bg: 'bg-emerald-950/90',
        border: 'border-emerald-500/30',
        iconColor: 'text-emerald-400'
    },
    error: {
        icon: XCircle,
        bg: 'bg-red-950/90',
        border: 'border-red-500/30',
        iconColor: 'text-red-400'
    },
    warning: {
        icon: AlertCircle,
        bg: 'bg-amber-950/90',
        border: 'border-amber-500/30',
        iconColor: 'text-amber-400'
    },
    info: {
        icon: Info,
        bg: 'bg-blue-950/90',
        border: 'border-blue-500/30',
        iconColor: 'text-blue-400'
    }
};

function ToastItem({ toast, onRemove, style }: { toast: Toast; onRemove: () => void; style?: React.CSSProperties }) {
    const config = toastStyles[toast.type];
    const Icon = config.icon;

    return (
        <div
            className={cn(
                "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl",
                "animate-slide-in-right",
                config.bg,
                config.border
            )}
            style={style}
        >
            <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", config.iconColor)} />
            <p className="flex-1 text-sm text-slate-200 leading-relaxed">
                {toast.message}
            </p>
            <button
                onClick={onRemove}
                className="shrink-0 h-5 w-5 flex items-center justify-center rounded text-slate-500 hover:text-slate-300 hover:bg-white/10 transition-colors"
            >
                <X size={14} />
            </button>
        </div>
    );
}

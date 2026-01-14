import { AlertTriangle } from "lucide-react"
import { Modal } from "./modal"
import { Button } from "./button"

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    variant?: 'danger' | 'warning' | 'default';
    loading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    variant = 'danger',
    loading = false
}: ConfirmModalProps) {
    const variantStyles = {
        danger: {
            icon: 'text-red-400 bg-red-500/10',
            button: 'bg-red-600 hover:bg-red-700 text-white'
        },
        warning: {
            icon: 'text-amber-400 bg-amber-500/10',
            button: 'bg-amber-600 hover:bg-amber-700 text-white'
        },
        default: {
            icon: 'text-indigo-400 bg-indigo-500/10',
            button: 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }
    }

    const styles = variantStyles[variant];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            className="max-w-md"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        className={styles.button}
                        onClick={() => {
                            onConfirm();
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Processing...
                            </span>
                        ) : confirmText}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col items-center text-center py-4">
                <div className={`h-16 w-16 rounded-full ${styles.icon} flex items-center justify-center mb-4`}>
                    <AlertTriangle size={32} />
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                    {message}
                </p>
            </div>
        </Modal>
    )
}

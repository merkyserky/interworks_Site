import * as React from "react"
import { Search, X, ArrowRight, Gamepad2, Building2, Bell, Users, Settings, Image as ImageIcon } from "lucide-react"
import { cn } from "@panel/lib/utils"

interface SearchOption {
    id: string;
    type: 'game' | 'studio' | 'notification' | 'user' | 'setting' | 'media';
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    onSelect: () => void;
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    options: SearchOption[];
    onNavigate?: (view: string) => void;
}

const TYPE_ICONS = {
    game: <Gamepad2 size={16} />,
    studio: <Building2 size={16} />,
    notification: <Bell size={16} />,
    user: <Users size={16} />,
    setting: <Settings size={16} />,
    media: <ImageIcon size={16} />,
};

const TYPE_COLORS = {
    game: 'text-indigo-400 bg-indigo-500/10',
    studio: 'text-violet-400 bg-violet-500/10',
    notification: 'text-amber-400 bg-amber-500/10',
    user: 'text-emerald-400 bg-emerald-500/10',
    setting: 'text-slate-400 bg-slate-500/10',
    media: 'text-pink-400 bg-pink-500/10',
};

export function CommandPalette({ isOpen, onClose, options, onNavigate }: CommandPaletteProps) {
    const [query, setQuery] = React.useState('');
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const listRef = React.useRef<HTMLDivElement>(null);

    // Quick actions for navigation
    const quickActions: SearchOption[] = onNavigate ? [
        { id: 'nav-games', type: 'game', title: 'Go to Games', onSelect: () => { onNavigate('games'); onClose(); } },
        { id: 'nav-studios', type: 'studio', title: 'Go to Studios', onSelect: () => { onNavigate('studios'); onClose(); } },
        { id: 'nav-notifications', type: 'notification', title: 'Go to Announcements', onSelect: () => { onNavigate('notifications'); onClose(); } },
        { id: 'nav-media', type: 'media', title: 'Go to Media', onSelect: () => { onNavigate('media'); onClose(); } },
        { id: 'nav-settings', type: 'setting', title: 'Go to Settings', onSelect: () => { onNavigate('settings'); onClose(); } },
    ] : [];

    const allOptions = [...options, ...quickActions];

    const filteredOptions = query
        ? allOptions.filter(opt =>
            opt.title.toLowerCase().includes(query.toLowerCase()) ||
            opt.subtitle?.toLowerCase().includes(query.toLowerCase())
        )
        : allOptions.slice(0, 10); // Show first 10 when no query

    // Reset selection when query changes
    React.useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    // Focus input when opened
    React.useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Keyboard navigation
    React.useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(i => Math.min(i + 1, filteredOptions.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(i => Math.max(i - 1, 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (filteredOptions[selectedIndex]) {
                        filteredOptions[selectedIndex].onSelect();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, filteredOptions, onClose]);

    // Scroll selected item into view
    React.useEffect(() => {
        if (listRef.current) {
            const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
            if (selectedEl) {
                selectedEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex]);

    if (!isOpen) return null;

    const groupedOptions = filteredOptions.reduce((acc, opt) => {
        if (!acc[opt.type]) acc[opt.type] = [];
        acc[opt.type].push(opt);
        return acc;
    }, {} as Record<string, SearchOption[]>);

    return (
        <div className="fixed inset-0 z-[100]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
                    {/* Search input */}
                    <div className="flex items-center gap-3 px-4 border-b border-slate-800">
                        <Search size={20} className="text-slate-500 shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search games, studios, settings..."
                            className="flex-1 h-14 bg-transparent text-slate-100 placeholder:text-slate-500 outline-none text-lg"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        )}
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono">ESC</kbd>
                            <span>to close</span>
                        </div>
                    </div>

                    {/* Results */}
                    <div ref={listRef} className="max-h-[400px] overflow-y-auto p-2">
                        {filteredOptions.length === 0 ? (
                            <div className="py-8 text-center text-slate-500">
                                <p className="text-sm">No results found</p>
                                <p className="text-xs mt-1">Try a different search term</p>
                            </div>
                        ) : (
                            Object.entries(groupedOptions).map(([type, items]) => (
                                <div key={type} className="mb-2">
                                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                                        {type}s
                                    </div>
                                    {items.map((item) => {
                                        const globalIndex = filteredOptions.indexOf(item);
                                        const isSelected = globalIndex === selectedIndex;

                                        return (
                                            <button
                                                key={item.id}
                                                onClick={item.onSelect}
                                                onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-100",
                                                    isSelected
                                                        ? "bg-indigo-500/10 text-slate-100"
                                                        : "text-slate-400 hover:text-slate-200"
                                                )}
                                            >
                                                <div className={cn(
                                                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                                                    TYPE_COLORS[item.type]
                                                )}>
                                                    {item.icon || TYPE_ICONS[item.type]}
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <p className="text-sm font-medium truncate">{item.title}</p>
                                                    {item.subtitle && (
                                                        <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
                                                    )}
                                                </div>
                                                {isSelected && (
                                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                                        <span>Open</span>
                                                        <ArrowRight size={12} />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer hints */}
                    <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800 text-[10px] text-slate-600">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1 py-0.5 rounded bg-slate-800 font-mono">↑</kbd>
                                <kbd className="px-1 py-0.5 rounded bg-slate-800 font-mono">↓</kbd>
                                navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono">↵</kbd>
                                select
                            </span>
                        </div>
                        <span className="text-indigo-400">⌘K or Ctrl+K to open</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Hook to manage command palette state
export function useCommandPalette() {
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen(prev => !prev),
    };
}

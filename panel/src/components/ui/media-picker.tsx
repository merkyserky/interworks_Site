import { useState } from 'react'
import {
    Image,
    X,
    Check,
    Search,
    Film,
    Music,
    FileImage,
    Folder
} from 'lucide-react'
import { Button } from './button'
import { cn } from '@panel/lib/utils'

interface MediaPickerProps {
    value?: string;
    onChange?: (value: string) => void;
    label?: string;
    allowMultiple?: boolean;
    values?: string[];
    onMultiChange?: (values: string[]) => void;
    defaultCategory?: string;
}

// Categories for media organization
interface MediaCategory {
    id: string;
    name: string;
    icon: typeof Image;
    filter: (path: string) => boolean;
}

const CATEGORIES: MediaCategory[] = [
    { id: 'all', name: 'All Media', icon: FileImage, filter: () => true },
    { id: 'logos', name: 'Logos', icon: Image, filter: (p) => p.toLowerCase().includes('logo') },
    { id: 'thumbnails', name: 'Thumbnails', icon: Film, filter: (p) => p.toLowerCase().includes('thumbnail') },
    { id: 'backgrounds', name: 'Backgrounds', icon: Folder, filter: (p) => p.toLowerCase().includes('background') || p.toLowerCase().includes('hero') },
    { id: 'studios', name: 'Studios', icon: Music, filter: (p) => p.includes('/studios/') },
];

// Available media files in the project
const AVAILABLE_MEDIA = [
    // Logos
    { path: '/LogoUnseen.png', name: 'Unseen Floors Logo', type: 'logo' },
    { path: '/LogoGub.png', name: 'Gub Ball Logo', type: 'logo' },
    { path: '/ashmoor.png', name: 'Ashmoor Logo', type: 'logo' },
    { path: '/tension.png', name: 'Tension Logo', type: 'logo' },

    // Thumbnails
    { path: '/unseen_Thumbnail.png', name: 'Unseen Floors Thumbnail', type: 'thumbnail' },
    { path: '/gub_Thumbnail.png', name: 'Gub Ball Thumbnail', type: 'thumbnail' },
    { path: '/tension_thumbnail.png', name: 'Tension Thumbnail', type: 'thumbnail' },

    // Backgrounds
    { path: '/astral_hero_background.png', name: 'Astral Core Hero', type: 'background' },
    { path: '/interworks_hero_background.png', name: 'Interworks Hero', type: 'background' },

    // Studios
    { path: '/studios/astral_Core.png', name: 'Astral Core Studio', type: 'studio' },

    // Other
    { path: '/favicon.svg', name: 'Favicon', type: 'icon' },
];

export function MediaPicker({ value, onChange, label, allowMultiple, values, onMultiChange, defaultCategory }: MediaPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(defaultCategory || 'all');
    const [selectedItems, setSelectedItems] = useState<string[]>(values || (value ? [value] : []));

    const category = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];

    const filteredMedia = AVAILABLE_MEDIA.filter(media => {
        // Search filter
        if (search && !media.name.toLowerCase().includes(search.toLowerCase()) &&
            !media.path.toLowerCase().includes(search.toLowerCase())) {
            return false;
        }
        // Category filter
        if (selectedCategory !== 'all' && !category.filter(media.path)) {
            return false;
        }
        return true;
    });

    const handleSelect = (path: string) => {
        if (allowMultiple) {
            const newSelection = selectedItems.includes(path)
                ? selectedItems.filter(p => p !== path)
                : [...selectedItems, path];
            setSelectedItems(newSelection);
        } else {
            onChange?.(path);
            setIsOpen(false);
        }
    };

    const handleConfirmMultiple = () => {
        if (onMultiChange) {
            onMultiChange(selectedItems);
        }
        setIsOpen(false);
    };

    const handleClearSelection = () => {
        setSelectedItems([]);
        if (allowMultiple && onMultiChange) {
            onMultiChange([]);
        } else {
            onChange?.('');
        }
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className="text-sm font-medium text-slate-300">{label}</label>
            )}

            {/* Preview / Trigger */}
            <div className="flex flex-wrap gap-2">
                {allowMultiple ? (
                    <>
                        {selectedItems.map(item => (
                            <div key={item} className="relative group">
                                <div className="h-16 w-16 rounded-lg border border-slate-700 overflow-hidden bg-slate-900">
                                    <img src={item} alt="" className="w-full h-full object-contain p-1" />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(item)}
                                    className="absolute -top-1 -right-1 p-0.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setIsOpen(true)}
                            className="h-16 w-16 rounded-lg border-2 border-dashed border-slate-700 hover:border-indigo-500 flex items-center justify-center text-slate-500 hover:text-indigo-400 transition-colors"
                        >
                            <Image size={20} />
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all w-full",
                            value
                                ? "border-slate-700 bg-slate-900/50 hover:border-indigo-500"
                                : "border-dashed border-slate-700 hover:border-indigo-500 bg-slate-900/30"
                        )}
                    >
                        {value ? (
                            <>
                                <div className="h-10 w-10 rounded-lg border border-slate-700 overflow-hidden bg-slate-900 shrink-0">
                                    <img src={value} alt="" className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium text-slate-200 truncate">{value.split('/').pop()}</p>
                                    <p className="text-xs text-slate-500">{value}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleClearSelection(); }}
                                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="h-10 w-10 rounded-lg border border-slate-700 flex items-center justify-center text-slate-500">
                                    <Image size={20} />
                                </div>
                                <span className="text-sm text-slate-500">Select media...</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="relative w-full max-w-3xl max-h-[80vh] bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                                <Image size={20} className="text-indigo-400" />
                                Media Library
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search & Filters */}
                        <div className="p-4 border-b border-slate-800 space-y-3">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search media..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {CATEGORIES.map(cat => {
                                    const Icon = cat.icon;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                                                selectedCategory === cat.id
                                                    ? "bg-indigo-500/20 text-indigo-400"
                                                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                                            )}
                                        >
                                            <Icon size={14} />
                                            {cat.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Media Grid */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {filteredMedia.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                    <FileImage size={48} className="mb-4 opacity-50" />
                                    <p className="text-sm">No media found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {filteredMedia.map(media => {
                                        const isSelected = allowMultiple
                                            ? selectedItems.includes(media.path)
                                            : value === media.path;

                                        return (
                                            <button
                                                key={media.path}
                                                onClick={() => handleSelect(media.path)}
                                                className={cn(
                                                    "group relative aspect-square rounded-xl border-2 overflow-hidden transition-all",
                                                    isSelected
                                                        ? "border-indigo-500 ring-2 ring-indigo-500/30"
                                                        : "border-slate-700 hover:border-slate-600"
                                                )}
                                            >
                                                <img
                                                    src={media.path}
                                                    alt={media.name}
                                                    className="w-full h-full object-contain p-2 bg-slate-800/50"
                                                />

                                                {/* Selection indicator */}
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                                                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                                                            <Check size={14} className="text-white" />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Hover overlay with name */}
                                                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-xs text-white truncate font-medium">{media.name}</p>
                                                    <p className="text-xs text-slate-400 truncate">{media.path}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {allowMultiple && (
                            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
                                <p className="text-sm text-slate-400">
                                    {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="ghost" onClick={() => setIsOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleConfirmMultiple}>
                                        Confirm Selection
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Simple thumbnail array picker for game thumbnails
export function ThumbnailsPicker({
    value,
    onChange
}: {
    value: string[];
    onChange: (value: string[]) => void
}) {
    return (
        <MediaPicker
            label="Thumbnails"
            allowMultiple
            values={value}
            onMultiChange={onChange}
        />
    );
}

import { useState } from 'react'
import { Plus, X, GripVertical } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
import { Modal } from './modal'
import { Label } from './label'
import { cn } from '@panel/lib/utils'

interface Genre {
    name: string;
    color: string;
}

interface GenreTagsProps {
    genres: Genre[];
    onChange: (genres: Genre[]) => void;
    className?: string;
}

const PRESET_COLORS = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#eab308', // yellow
    '#84cc16', // lime
    '#22c55e', // green
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#0ea5e9', // sky
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#a855f7', // purple
    '#d946ef', // fuchsia
    '#ec4899', // pink
    '#f43f5e', // rose
];

export function GenreTags({ genres, onChange, className }: GenreTagsProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGenre, setNewGenre] = useState('');
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[4]);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const addGenre = () => {
        if (!newGenre.trim()) return;
        onChange([...genres, { name: newGenre.trim(), color: selectedColor }]);
        setNewGenre('');
        setSelectedColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
        setIsModalOpen(false);
    };

    const removeGenre = (index: number) => {
        const updated = [...genres];
        updated.splice(index, 1);
        onChange(updated);
    };

    const handleDragStart = (index: number) => {
        setDragIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragEnd = () => {
        if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
            const updated = [...genres];
            const [removed] = updated.splice(dragIndex, 1);
            updated.splice(dragOverIndex, 0, removed);
            onChange(updated);
        }
        setDragIndex(null);
        setDragOverIndex(null);
    };

    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border border-slate-800 rounded-lg bg-slate-900/50">
                {genres.length === 0 && (
                    <span className="text-sm text-slate-500">No genres added</span>
                )}
                {genres.map((genre, index) => (
                    <div
                        key={`${genre.name}-${index}`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                            "group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium cursor-move transition-all",
                            "border border-transparent hover:border-white/20",
                            dragIndex === index && "opacity-50 scale-95",
                            dragOverIndex === index && dragIndex !== index && "ring-2 ring-white/30"
                        )}
                        style={{
                            backgroundColor: `${genre.color}20`,
                            color: genre.color
                        }}
                    >
                        <GripVertical size={12} className="opacity-0 group-hover:opacity-50 shrink-0" />
                        <span>{genre.name}</span>
                        <button
                            type="button"
                            onClick={() => removeGenre(index)}
                            className="ml-1 h-4 w-4 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            <X size={10} />
                        </button>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-slate-400 hover:text-slate-200 gap-1"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={14} />
                    <span className="text-xs">Add Genre</span>
                </Button>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add Genre"
                className="max-w-sm"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={addGenre} disabled={!newGenre.trim()} className="bg-indigo-600 hover:bg-indigo-700">
                            Add Genre
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Genre Name</Label>
                        <Input
                            value={newGenre}
                            onChange={e => setNewGenre(e.target.value)}
                            placeholder="e.g. Horror, RPG, Action"
                            onKeyDown={e => e.key === 'Enter' && addGenre()}
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="grid grid-cols-8 gap-2">
                            {PRESET_COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    className={cn(
                                        "h-8 w-8 rounded-lg transition-all hover:scale-110",
                                        selectedColor === color && "ring-2 ring-white ring-offset-2 ring-offset-slate-950"
                                    )}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="pt-2">
                        <Label className="text-slate-400 mb-2 block">Preview</Label>
                        <div
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                            style={{
                                backgroundColor: `${selectedColor}20`,
                                color: selectedColor
                            }}
                        >
                            {newGenre || 'Genre Name'}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

// Helper to convert old string array to new genre format
export function parseGenres(input: string[] | Genre[] | undefined): Genre[] {
    if (!input || input.length === 0) return [];

    // Check if it's already in the new format
    if (typeof input[0] === 'object' && 'name' in input[0]) {
        return input as Genre[];
    }

    // Convert old string array to new format with random colors
    return (input as string[]).map(name => ({
        name,
        color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]
    }));
}

// Helper to convert genres to string array for backward compatibility
export function genresToStrings(genres: Genre[]): string[] {
    return genres.map(g => g.name);
}

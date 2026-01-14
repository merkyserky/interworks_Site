import { useState } from 'react'
import { Plus, Search, Edit, Trash2, ShieldAlert } from 'lucide-react'
import { Game, Studio, User, api } from '@panel/lib/api'
import { Button } from '@panel/components/ui/button'
import { Input } from '@panel/components/ui/input'
import { Card, CardContent } from '@panel/components/ui/card'
import { Modal } from '@panel/components/ui/modal'
import { Label } from '@panel/components/ui/label'
import { Textarea } from '@panel/components/ui/textarea'
import { ConfirmModal } from '@panel/components/ui/confirm-modal'
import { Select } from '@panel/components/ui/select'
import { Checkbox } from '@panel/components/ui/checkbox'
import { GenreTags, parseGenres, genresToStrings } from '@panel/components/ui/genre-tags'
import { EventEditor } from '@panel/components/ui/event-editor'
import { useNotify } from '@panel/components/ui/toast'
import { MediaPicker } from '@panel/components/ui/media-picker'
import { cn } from '@panel/lib/utils'

interface Genre {
    name: string;
    color: string;
}

interface GamesViewProps {
    games: Game[];
    studios: Studio[];
    currentUser: User | null;
    onUpdate: () => void;
}

export function GamesView({ games, studios, currentUser, onUpdate }: GamesViewProps) {
    const notify = useNotify();
    const [search, setSearch] = useState('')
    const [editingGame, setEditingGame] = useState<Partial<Game> & { genreTags?: Genre[] } | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<Game | null>(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const isAdmin = currentUser?.role === 'admin';

    const filteredGames = games.filter(g => {
        const nameMatch = (g.name || '').toLowerCase().includes(search.toLowerCase());
        const ownerMatch = (g.ownedBy || '').toLowerCase().includes(search.toLowerCase());
        return nameMatch || ownerMatch;
    });

    const handleSave = async () => {
        if (!editingGame || !editingGame.name) {
            notify.error('Please enter a game name');
            return;
        }

        setIsSaving(true);
        try {
            // Convert genre tags back to string array for API
            const gameData = {
                ...editingGame,
                genres: editingGame.genreTags ? genresToStrings(editingGame.genreTags) : editingGame.genres
            };
            delete (gameData as any).genreTags;

            if (editingGame.id) {
                await api.put(`/api/games/${editingGame.id}`, gameData);
                notify.success(`"${editingGame.name}" updated successfully`);
            } else {
                await api.post('/api/games', gameData);
                notify.success(`"${editingGame.name}" created successfully`);
            }
            setIsModalOpen(false);
            onUpdate();
        } catch (error) {
            notify.error('Failed to save game: ' + error);
        } finally {
            setIsSaving(false);
        }
    }

    const handleDeleteClick = (game: Game) => {
        setDeleteTarget(game);
        setIsConfirmOpen(true);
    }

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await api.delete(`/api/games/${deleteTarget.id}`);
            notify.success(`"${deleteTarget.name}" deleted`);
            setIsConfirmOpen(false);
            setDeleteTarget(null);
            onUpdate();
        } catch (error) {
            notify.error('Failed to delete: ' + error);
        } finally {
            setIsDeleting(false);
        }
    }

    const openEdit = (game: Game) => {
        setEditingGame({
            ...game,
            genreTags: parseGenres(game.genres as any)
        });
        setIsModalOpen(true);
    }

    const openCreate = () => {
        setEditingGame({
            name: '',
            description: '',
            ownedBy: studios[0]?.name || '',
            status: 'in-development',
            genres: [],
            genreTags: [],
            visible: true
        });
        setIsModalOpen(true);
    }

    const statusOptions = [
        { value: 'coming-soon', label: 'Coming Soon' },
        { value: 'playable', label: 'Playable' },
        { value: 'beta', label: 'Beta' },
        { value: 'in-development', label: 'In Development' }
    ];

    const studioOptions = studios.map(s => ({ value: s.name, label: s.name }));

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-[12px] h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search games..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 bg-slate-900 border-slate-800"
                    />
                </div>
                <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 w-full sm:w-auto justify-center">
                    <Plus size={16} /> Add Game
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredGames.map(game => (
                    <Card key={game.id} className="group overflow-hidden bg-slate-900/50 border-slate-800 hover:border-indigo-500/50 transition-all">
                        <div className="aspect-video w-full overflow-hidden bg-slate-800 relative">
                            {game.logo ? (
                                <img src={game.logo} alt={game.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-600 font-bold text-xl bg-slate-900">NO IMAGE</div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="secondary" className="h-8 w-8 bg-black/50 hover:bg-indigo-600 text-white border-0" onClick={() => openEdit(game)}>
                                    <Edit size={14} />
                                </Button>
                            </div>
                            <div className="absolute bottom-2 left-2">
                                <span className={cn(
                                    "px-2 py-1 text-[10px] font-bold uppercase rounded bg-black/60 backdrop-blur-md border border-white/10",
                                    game.status === 'playable' ? "text-emerald-400" : "text-amber-400"
                                )}>
                                    {game.status || 'Unknown'}
                                </span>
                            </div>
                        </div>
                        <CardContent className="p-3 sm:p-4">
                            <h3 className="font-bold text-slate-100 truncate">{game.name}</h3>
                            <p className="text-xs text-slate-500 truncate">{game.ownedBy || 'No studio'}</p>
                            {game.genres && game.genres.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {(game.genres as string[]).slice(0, 2).map((genre, i) => (
                                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                            {genre}
                                        </span>
                                    ))}
                                    {game.genres.length > 2 && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500">
                                            +{game.genres.length - 2}
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-800/50">
                                {isAdmin ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs h-8 hover:text-red-400 hover:bg-red-950/30"
                                        onClick={() => handleDeleteClick(game)}
                                        disabled={isDeleting}
                                    >
                                        <Trash2 size={14} className="mr-1" /> Remove
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-1 text-xs text-slate-600">
                                        <ShieldAlert size={12} />
                                        <span className="hidden sm:inline">Admin only</span>
                                    </div>
                                )}
                                <Button variant="outline" size="sm" className="text-xs h-8 border-slate-700 hover:bg-slate-800" onClick={() => openEdit(game)}>
                                    Manage
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredGames.length === 0 && (
                <div className="text-center py-16 sm:py-20 text-slate-600">
                    No games found matching your search.
                </div>
            )}

            {/* Edit/Create Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingGame?.id ? "Edit Game" : "New Game"}
                footer={(
                    <>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </>
                )}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={editingGame?.name || ''} onChange={e => setEditingGame(prev => ({ ...prev!, name: e.target.value }))} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={editingGame?.status || 'coming-soon'}
                                onChange={v => setEditingGame(prev => ({ ...prev!, status: v as any }))}
                                options={statusOptions}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Studio</Label>
                            <Select
                                value={editingGame?.ownedBy || ''}
                                onChange={v => setEditingGame(prev => ({ ...prev!, ownedBy: v }))}
                                options={studioOptions}
                                placeholder="Select studio..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <MediaPicker
                            label="Logo"
                            value={editingGame?.logo || ''}
                            onChange={v => setEditingGame(prev => ({ ...prev!, logo: v }))}
                        />
                        <MediaPicker
                            label="Thumbnails"
                            allowMultiple
                            values={(editingGame?.thumbnails || []) as string[]}
                            onMultiChange={v => setEditingGame(prev => ({ ...prev!, thumbnails: v }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea value={editingGame?.description || ''} onChange={e => setEditingGame(prev => ({ ...prev!, description: e.target.value }))} className="h-24" />
                    </div>

                    <div className="space-y-2">
                        <Label>YouTube Video ID</Label>
                        <Input value={editingGame?.youtubeVideoId || ''} onChange={e => setEditingGame(prev => ({ ...prev!, youtubeVideoId: e.target.value }))} placeholder="e.g. dQw4w9WgXcQ" />
                    </div>

                    <div className="space-y-2">
                        <Label>Genres</Label>
                        <GenreTags
                            genres={editingGame?.genreTags || []}
                            onChange={tags => setEditingGame(prev => ({ ...prev!, genreTags: tags }))}
                        />
                    </div>

                    {/* Events & Countdowns */}
                    <div className="pt-4 border-t border-slate-800">
                        <EventEditor
                            events={editingGame?.events || []}
                            onChange={events => setEditingGame(prev => ({ ...prev!, events }))}
                        />
                    </div>

                    <Checkbox
                        checked={editingGame?.visible ?? true}
                        onChange={v => setEditingGame(prev => ({ ...prev!, visible: v }))}
                        label="Visible"
                        description="Show this game publicly on the site"
                    />
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => {
                    setIsConfirmOpen(false);
                    setDeleteTarget(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Delete Game"
                message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone and will remove all associated data.`}
                confirmText="Delete Game"
                variant="danger"
                loading={isDeleting}
            />
        </div>
    )
}

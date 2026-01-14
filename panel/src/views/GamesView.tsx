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
import { useNotify } from '@panel/components/ui/toast'
import { cn } from '@panel/lib/utils'

interface GamesViewProps {
    games: Game[];
    studios: Studio[];
    currentUser: User | null;
    onUpdate: () => void;
}

export function GamesView({ games, studios, currentUser, onUpdate }: GamesViewProps) {
    const notify = useNotify();
    const [search, setSearch] = useState('')
    const [editingGame, setEditingGame] = useState<Partial<Game> | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<Game | null>(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const isAdmin = currentUser?.role === 'admin';

    // Fixed: Added null/undefined checks to prevent toLowerCase errors
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
            if (editingGame.id) {
                await api.put(`/api/games/${editingGame.id}`, editingGame);
                notify.success(`"${editingGame.name}" updated successfully`);
            } else {
                await api.post('/api/games', editingGame);
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
        setEditingGame({ ...game });
        setIsModalOpen(true);
    }

    const openCreate = () => {
        setEditingGame({
            name: '',
            description: '',
            ownedBy: studios[0]?.name || '',
            status: 'in-development',
            genres: [],
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
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search games..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 bg-slate-900 border-slate-800"
                    />
                </div>
                <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 w-full sm:w-auto">
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
                            <p className="text-xs text-slate-500 truncate mb-3">{game.ownedBy || 'No studio'}</p>
                            <div className="flex justify-between items-center mt-3 sm:mt-4 pt-3 border-t border-slate-800/50">
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

                    <div className="space-y-2">
                        <Label>Logo URL</Label>
                        <Input value={editingGame?.logo || ''} onChange={e => setEditingGame(prev => ({ ...prev!, logo: e.target.value }))} placeholder="/path/to/image.png" />
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
                        <Label>Genres (comma separated)</Label>
                        <Input
                            value={editingGame?.genres?.join(', ') || ''}
                            onChange={e => setEditingGame(prev => ({ ...prev!, genres: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                            placeholder="Horror, RPG, Action"
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

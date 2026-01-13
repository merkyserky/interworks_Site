import { useState } from 'react'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { Game, Studio, api } from '@panel/lib/api'
import { Button } from '@panel/components/ui/button'
import { Input } from '@panel/components/ui/input'
import { Card, CardContent } from '@panel/components/ui/card'
import { Modal } from '@panel/components/ui/modal'
import { Label } from '@panel/components/ui/label'
import { Textarea } from '@panel/components/ui/textarea'
import { cn } from '@panel/lib/utils'

interface GamesViewProps {
    games: Game[];
    studios: Studio[];
    currentUser: any;
    onUpdate: () => void;
}

export function GamesView({ games, studios, onUpdate }: GamesViewProps) {
    const [search, setSearch] = useState('')
    const [editingGame, setEditingGame] = useState<Partial<Game> | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const filteredGames = games.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.ownedBy.toLowerCase().includes(search.toLowerCase())
    )

    const handleSave = async () => {
        if (!editingGame || !editingGame.name) return;

        try {
            if (editingGame.id) {
                await api.put(`/api/games/${editingGame.id}`, editingGame);
            } else {
                await api.post('/api/games', editingGame);
            }
            setIsModalOpen(false);
            onUpdate();
        } catch (error) {
            alert('Failed to save game: ' + error);
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this game?')) return;
        setIsDeleting(true);
        try {
            await api.delete(`/api/games/${id}`);
            onUpdate();
        } catch (error) {
            alert('Failed to delete: ' + error);
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

    // Helper for Select options
    const statusOptions = ['coming-soon', 'playable', 'beta', 'in-development'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search games..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 bg-slate-900 border-slate-800"
                    />
                </div>
                <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                    <Plus size={16} /> Add Game
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                                    {game.status}
                                </span>
                            </div>
                        </div>
                        <CardContent className="p-4">
                            <h3 className="font-bold text-slate-100 truncate">{game.name}</h3>
                            <p className="text-xs text-slate-500 truncate mb-3">{game.ownedBy}</p>
                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800/50">
                                <Button variant="ghost" size="sm" className="text-xs h-7 hover:text-red-400 hover:bg-red-950/30" onClick={() => handleDelete(game.id)} disabled={isDeleting}>
                                    <Trash2 size={12} className="mr-1" /> Remove
                                </Button>
                                <Button variant="outline" size="sm" className="text-xs h-7 border-slate-700 hover:bg-slate-800" onClick={() => openEdit(game)}>
                                    Manage
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingGame?.id ? "Edit Game" : "New Game"}
                footer={(
                    <>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">Save Changes</Button>
                    </>
                )}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={editingGame?.name || ''} onChange={e => setEditingGame(prev => ({ ...prev!, name: e.target.value }))} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                value={editingGame?.status || 'coming-soon'}
                                onChange={e => setEditingGame(prev => ({ ...prev!, status: e.target.value as any }))}
                            >
                                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Studio</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                value={editingGame?.ownedBy || ''}
                                onChange={e => setEditingGame(prev => ({ ...prev!, ownedBy: e.target.value }))}
                            >
                                {studios.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                            </select>
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
                </div>
            </Modal>
        </div>
    )
}

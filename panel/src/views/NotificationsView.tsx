
import { useState } from 'react'
import { Plus, Search, Trash2, Bell, Clock } from 'lucide-react'
import { Notification, Game, api } from '@panel/lib/api'
import { Button } from '@panel/components/ui/button'
import { Input } from '@panel/components/ui/input'
import { Card, CardContent } from '@panel/components/ui/card'
import { Modal } from '@panel/components/ui/modal'
import { Label } from '@panel/components/ui/label'
import { Textarea } from '@panel/components/ui/textarea'

interface NotificationsViewProps {
    notifications: Notification[];
    games: Game[];
    onUpdate: () => void;
}

export function NotificationsView({ notifications, games, onUpdate }: NotificationsViewProps) {
    const [search, setSearch] = useState('')
    const [editingNotif, setEditingNotif] = useState<Partial<Notification> | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const filtered = notifications.filter(n => n.title.toLowerCase().includes(search.toLowerCase()))

    const save = async () => {
        if (!editingNotif) return;
        try {
            if (editingNotif.id) {
                await api.put(`/api/announcements/${editingNotif.id}`, editingNotif);
            } else {
                await api.post('/api/announcements', editingNotif);
            }
            setIsModalOpen(false);
            onUpdate();
        } catch (e) { alert(e); }
    }

    const deleteNotif = async (id: string) => {
        if (!confirm("Delete announcement?")) return;
        await api.delete(`/api/announcements/${id}`);
        onUpdate();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input placeholder="Search announcements..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-slate-900 border-slate-800" />
                </div>
                <Button onClick={() => { setEditingNotif({ active: true, gameId: games[0]?.id || '' }); setIsModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                    <Plus size={16} /> Add Announcement
                </Button>
            </div>

            <div className="space-y-4">
                {filtered.map(notif => (
                    <Card key={notif.id} className="bg-slate-900/50 border-slate-800 hover:border-indigo-500/20">
                        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                            <div className="h-12 w-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                                <Bell size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-slate-100 truncate">{notif.title}</h3>
                                    {notif.active ? (
                                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold">Active</span>
                                    ) : (
                                        <span className="bg-slate-700/50 text-slate-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold">Inactive</span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-1">{notif.description}</p>
                                {notif.countdownTo && (
                                    <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-400">
                                        <Clock size={12} />
                                        <span>Counts down to: {new Date(notif.countdownTo).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-auto">
                                <Button size="sm" variant="outline" onClick={() => { setEditingNotif({ ...notif }); setIsModalOpen(true); }}>Edit</Button>
                                <Button size="sm" variant="ghost" className="text-slate-500 hover:text-red-400" onClick={() => deleteNotif(notif.id)}><Trash2 size={16} /></Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {filtered.length === 0 && <div className="text-center py-10 text-slate-600">No announcements found.</div>}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Announcement" footer={<Button onClick={save}>Save</Button>}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={editingNotif?.title || ''} onChange={e => setEditingNotif(p => ({ ...p!, title: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Game</Label>
                        <select className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white" value={editingNotif?.gameId || ''} onChange={e => setEditingNotif(p => ({ ...p!, gameId: e.target.value }))}>
                            <option value="">(No specific game)</option>
                            {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea value={editingNotif?.description || ''} onChange={e => setEditingNotif(p => ({ ...p!, description: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Countdown Date (Optional)</Label>
                        <Input type="datetime-local" value={editingNotif?.countdownTo || ''} onChange={e => setEditingNotif(p => ({ ...p!, countdownTo: e.target.value }))} className="text-slate-400" />
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={editingNotif?.active || false} onChange={e => setEditingNotif(p => ({ ...p!, active: e.target.checked }))} />
                            <span className="text-slate-200 text-sm">Active / Visible</span>
                        </label>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

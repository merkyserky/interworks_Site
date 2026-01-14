import { useState } from 'react'
import { Plus, Search, Trash2, Bell, Clock, Edit } from 'lucide-react'
import { Notification, Game, api } from '@panel/lib/api'
import { Button } from '@panel/components/ui/button'
import { Input } from '@panel/components/ui/input'
import { Card, CardContent } from '@panel/components/ui/card'
import { Modal } from '@panel/components/ui/modal'
import { Label } from '@panel/components/ui/label'
import { Textarea } from '@panel/components/ui/textarea'
import { ConfirmModal } from '@panel/components/ui/confirm-modal'
import { Select } from '@panel/components/ui/select'
import { Toggle } from '@panel/components/ui/checkbox'
import { useNotify } from '@panel/components/ui/toast'

interface NotificationsViewProps {
    notifications: Notification[];
    games: Game[];
    onUpdate: () => void;
}

export function NotificationsView({ notifications, games, onUpdate }: NotificationsViewProps) {
    const notify = useNotify();
    const [search, setSearch] = useState('')
    const [editingNotif, setEditingNotif] = useState<Partial<Notification> | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Fixed: Added null/undefined checks to prevent toLowerCase errors
    const filtered = notifications.filter(n =>
        (n.title || '').toLowerCase().includes(search.toLowerCase())
    );

    const save = async () => {
        if (!editingNotif || !editingNotif.title) {
            notify.error('Please enter a title');
            return;
        }

        setIsSaving(true);
        try {
            if (editingNotif.id) {
                await api.put(`/api/announcements/${editingNotif.id}`, editingNotif);
                notify.success(`"${editingNotif.title}" updated successfully`);
            } else {
                await api.post('/api/announcements', editingNotif);
                notify.success(`"${editingNotif.title}" created successfully`);
            }
            setIsModalOpen(false);
            onUpdate();
        } catch (e) {
            notify.error('Failed to save announcement: ' + e);
        } finally {
            setIsSaving(false);
        }
    }

    const handleDeleteClick = (notif: Notification) => {
        setDeleteTarget(notif);
        setIsConfirmOpen(true);
    }

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await api.delete(`/api/announcements/${deleteTarget.id}`);
            notify.success(`"${deleteTarget.title}" deleted`);
            setIsConfirmOpen(false);
            setDeleteTarget(null);
            onUpdate();
        } catch (e) {
            notify.error('Failed to delete announcement: ' + e);
        } finally {
            setIsDeleting(false);
        }
    }

    const gameOptions = [
        { value: '', label: '(No specific game)' },
        ...games.map(g => ({ value: g.id, label: g.name }))
    ];

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input placeholder="Search announcements..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-slate-900 border-slate-800" />
                </div>
                <Button onClick={() => { setEditingNotif({ active: true, gameId: games[0]?.id || '', title: '', description: '' }); setIsModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 w-full sm:w-auto">
                    <Plus size={16} /> Add Announcement
                </Button>
            </div>

            <div className="space-y-3 sm:space-y-4">
                {filtered.map(notif => (
                    <Card key={notif.id} className="bg-slate-900/50 border-slate-800 hover:border-indigo-500/20 transition-all">
                        <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                                <Bell size={20} className="sm:hidden" />
                                <Bell size={24} className="hidden sm:block" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h3 className="font-bold text-slate-100 truncate">{notif.title || 'Untitled'}</h3>
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
                            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                                <Button size="sm" variant="outline" className="gap-1 flex-1 sm:flex-none" onClick={() => { setEditingNotif({ ...notif }); setIsModalOpen(true); }}>
                                    <Edit size={14} /> <span className="sm:hidden">Edit</span>
                                </Button>
                                <Button size="sm" variant="ghost" className="text-slate-500 hover:text-red-400" onClick={() => handleDeleteClick(notif)}>
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {filtered.length === 0 && <div className="text-center py-10 text-slate-600">No announcements found.</div>}
            </div>

            {/* Edit/Create Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingNotif?.id ? "Edit Announcement" : "New Announcement"}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={save} className="bg-indigo-600 hover:bg-indigo-700" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={editingNotif?.title || ''} onChange={e => setEditingNotif(p => ({ ...p!, title: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Game</Label>
                        <Select
                            value={editingNotif?.gameId || ''}
                            onChange={v => setEditingNotif(p => ({ ...p!, gameId: v }))}
                            options={gameOptions}
                            placeholder="Select a game..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea value={editingNotif?.description || ''} onChange={e => setEditingNotif(p => ({ ...p!, description: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Countdown Date (Optional)</Label>
                        <Input
                            type="datetime-local"
                            value={editingNotif?.countdownTo || ''}
                            onChange={e => setEditingNotif(p => ({ ...p!, countdownTo: e.target.value }))}
                            className="text-slate-400"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>YouTube Video ID (Optional)</Label>
                        <Input
                            value={editingNotif?.youtubeVideoId || ''}
                            onChange={e => setEditingNotif(p => ({ ...p!, youtubeVideoId: e.target.value }))}
                            placeholder="e.g. dQw4w9WgXcQ"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Link URL (Optional)</Label>
                        <Input
                            value={editingNotif?.link || ''}
                            onChange={e => setEditingNotif(p => ({ ...p!, link: e.target.value }))}
                            placeholder="https://example.com"
                        />
                    </div>
                    <Toggle
                        checked={editingNotif?.active || false}
                        onChange={v => setEditingNotif(p => ({ ...p!, active: v }))}
                        label="Active / Visible"
                        description="Show this announcement on the site"
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
                title="Delete Announcement"
                message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
                confirmText="Delete Announcement"
                variant="danger"
                loading={isDeleting}
            />
        </div>
    )
}

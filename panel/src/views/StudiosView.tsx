import { useState } from 'react'
import { Plus, Search, Edit, Trash2, ShieldAlert } from 'lucide-react'
import { Studio, User, api } from '@panel/lib/api'
import { Button } from '@panel/components/ui/button'
import { Input } from '@panel/components/ui/input'
import { Card, CardContent } from '@panel/components/ui/card'
import { Modal } from '@panel/components/ui/modal'
import { Label } from '@panel/components/ui/label'
import { Textarea } from '@panel/components/ui/textarea'
import { ConfirmModal } from '@panel/components/ui/confirm-modal'
import { useNotify } from '@panel/components/ui/toast'
import { DiscordIcon, RobloxIcon, YouTubeIcon } from '@panel/components/ui/icons'
import { MediaPicker } from '@panel/components/ui/media-picker'
import { Toggle } from '@panel/components/ui/checkbox'
import { cn } from '@panel/lib/utils'

interface StudiosViewProps {
    studios: Studio[];
    currentUser: User | null;
    onUpdate: () => void;
}

export function StudiosView({ studios, currentUser, onUpdate }: StudiosViewProps) {
    const notify = useNotify();
    const [search, setSearch] = useState('')
    const [editingStudio, setEditingStudio] = useState<Partial<Studio> | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<Studio | null>(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const isAdmin = currentUser?.role === 'admin';

    const filtered = studios.filter(s =>
        (s.name || '').toLowerCase().includes(search.toLowerCase())
    );

    const saveStudio = async () => {
        if (!editingStudio || !editingStudio.name) {
            notify.error('Please enter a studio name');
            return;
        }

        setIsSaving(true);
        try {
            const isUpdate = studios.some(s => s.id === editingStudio.id);

            if (isUpdate) {
                await api.put(`/api/studios/${editingStudio.id}`, editingStudio);
                notify.success(`"${editingStudio.name}" updated successfully`);
            } else {
                if (!editingStudio.id) editingStudio.id = editingStudio.name?.toLowerCase().replace(/[^a-z0-9]/g, '-');
                await api.post('/api/studios', editingStudio);
                notify.success(`"${editingStudio.name}" created successfully`);
            }
            setIsModalOpen(false);
            onUpdate();
        } catch (e) {
            notify.error('Failed to save studio: ' + e);
        } finally {
            setIsSaving(false);
        }
    }

    const handleDeleteClick = (studio: Studio) => {
        setDeleteTarget(studio);
        setIsConfirmOpen(true);
    }

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await api.delete(`/api/studios/${deleteTarget.id}`);
            notify.success(`"${deleteTarget.name}" deleted`);
            setIsConfirmOpen(false);
            setDeleteTarget(null);
            onUpdate();
        } catch (e) {
            notify.error('Failed to delete studio: ' + e);
        } finally {
            setIsDeleting(false);
        }
    }

    const openCreate = () => {
        setEditingStudio({ name: '', description: '', id: '' });
        setIsModalOpen(true);
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-[12px] h-4 w-4 text-slate-500" />
                    <Input placeholder="Search studios..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-slate-900 border-slate-800" />
                </div>
                <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 w-full sm:w-auto justify-center">
                    <Plus size={16} /> Add Studio
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filtered.map(studio => (
                    <Card key={studio.id} className="bg-slate-900/50 border-slate-800 hover:border-indigo-500/30 transition-all">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div className="h-14 w-14 rounded-xl bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                                    {studio.logo ? (
                                        <img src={studio.logo} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-slate-500">
                                            {(studio.name || 'S')[0].toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 hover:bg-slate-800"
                                        onClick={() => { setEditingStudio({ ...studio }); setIsModalOpen(true); }}
                                    >
                                        <Edit size={14} className="text-slate-400" />
                                    </Button>
                                    {isAdmin ? (
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 hover:bg-red-900/20 hover:text-red-400"
                                            onClick={() => handleDeleteClick(studio)}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    ) : (
                                        <div className="h-8 w-8 flex items-center justify-center text-slate-600" title="Admin only">
                                            <ShieldAlert size={12} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-100 mb-1">{studio.name}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">{studio.description || 'No description'}</p>

                            {/* Social Links */}
                            <div className="mt-4 flex gap-2">
                                {studio.discord && (
                                    <a
                                        href={studio.discord}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                            "bg-[#5865F2]/10 text-[#5865F2] hover:bg-[#5865F2]/20"
                                        )}
                                    >
                                        <DiscordIcon size={14} />
                                        <span className="hidden sm:inline">Discord</span>
                                    </a>
                                )}
                                {studio.roblox && (
                                    <a
                                        href={studio.roblox}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                            "bg-white/10 text-white hover:bg-white/20"
                                        )}
                                    >
                                        <RobloxIcon size={14} />
                                        <span className="hidden sm:inline">Roblox</span>
                                    </a>
                                )}
                                {studio.youtube && (
                                    <a
                                        href={studio.youtube}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                            "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                        )}
                                    >
                                        <YouTubeIcon size={14} />
                                        <span className="hidden sm:inline">YouTube</span>
                                    </a>
                                )}
                                {!studio.discord && !studio.roblox && !studio.youtube && (
                                    <span className="text-xs text-slate-600">No social links</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-16 sm:py-20 text-slate-600">
                    No studios found matching your search.
                </div>
            )}

            {/* Edit/Create Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingStudio?.id && studios.some(s => s.id === editingStudio.id) ? "Edit Studio" : "New Studio"}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={saveStudio} className="bg-indigo-600 hover:bg-indigo-700" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>ID (Unique)</Label>
                        <Input value={editingStudio?.id || ''} onChange={e => setEditingStudio(p => ({ ...p!, id: e.target.value }))} placeholder="my-studio" />
                    </div>
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={editingStudio?.name || ''} onChange={e => setEditingStudio(p => ({ ...p!, name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea value={editingStudio?.description || ''} onChange={e => setEditingStudio(p => ({ ...p!, description: e.target.value }))} />
                    </div>
                    <MediaPicker
                        label="Logo"
                        value={editingStudio?.logo || ''}
                        onChange={v => setEditingStudio(p => ({ ...p!, logo: v }))}
                        defaultCategory="logos"
                    />
                    <MediaPicker
                        label="Hero Background"
                        value={editingStudio?.heroImage || ''}
                        onChange={v => setEditingStudio(p => ({ ...p!, heroImage: v }))}
                        defaultCategory="backgrounds"
                    />

                    <Toggle
                        label="Feature in Hero"
                        description="Show this studio in the main hero slider"
                        checked={editingStudio?.hero || false}
                        onChange={c => setEditingStudio(p => ({ ...p!, hero: c }))}
                    />

                    <div className="pt-2 border-t border-slate-800">
                        <Label className="text-slate-300 mb-3 block">Social Links</Label>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-[#5865F2]/10 flex items-center justify-center shrink-0">
                                    <DiscordIcon size={16} className="text-[#5865F2]" />
                                </div>
                                <Input
                                    value={editingStudio?.discord || ''}
                                    onChange={e => setEditingStudio(p => ({ ...p!, discord: e.target.value }))}
                                    placeholder="https://discord.gg/..."
                                    className="flex-1"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                    <RobloxIcon size={16} className="text-white" />
                                </div>
                                <Input
                                    value={editingStudio?.roblox || ''}
                                    onChange={e => setEditingStudio(p => ({ ...p!, roblox: e.target.value }))}
                                    placeholder="https://www.roblox.com/communities/..."
                                    className="flex-1"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                                    <YouTubeIcon size={16} className="text-red-400" />
                                </div>
                                <Input
                                    value={editingStudio?.youtube || ''}
                                    onChange={e => setEditingStudio(p => ({ ...p!, youtube: e.target.value }))}
                                    placeholder="https://www.youtube.com/@..."
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>
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
                title="Delete Studio"
                message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone. Any games associated with this studio will need to be reassigned.`}
                confirmText="Delete Studio"
                variant="danger"
                loading={isDeleting}
            />
        </div>
    )
}

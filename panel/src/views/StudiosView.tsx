
import { useState } from 'react'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { Studio, api } from '@panel/lib/api'
import { Button } from '@panel/components/ui/button'
import { Input } from '@panel/components/ui/input'
import { Card, CardContent } from '@panel/components/ui/card'
import { Modal } from '@panel/components/ui/modal'
import { Label } from '@panel/components/ui/label'
import { Textarea } from '@panel/components/ui/textarea'

interface StudiosViewProps {
    studios: Studio[];
    onUpdate: () => void;
}

export function StudiosView({ studios, onUpdate }: StudiosViewProps) {
    const [search, setSearch] = useState('')
    const [editingStudio, setEditingStudio] = useState<Partial<Studio> | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const filtered = studios.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))

    // Correct save logic
    const saveStudio = async () => {
        if (!editingStudio) return;
        try {
            // We need to know if we are updating or creating.
            // If we opened via "Edit", we pass the ID.
            // The ID in the form might be editable only on create?
            // Worker: `put` requires `/api/studios/:id`.

            // Simplification: We will trust `editingStudio.id` matching an existing one implies update.
            const isUpdate = studios.some(s => s.id === editingStudio.id);

            if (isUpdate) {
                await api.put(`/api/studios/${editingStudio.id}`, editingStudio);
            } else {
                // Ensure ID
                if (!editingStudio.id) editingStudio.id = editingStudio.name?.toLowerCase().replace(/[^a-z0-9]/g, '-');
                await api.post('/api/studios', editingStudio);
            }
            setIsModalOpen(false);
            onUpdate();
        } catch (e) {
            alert(e);
        }
    }

    const deleteStudio = async (id: string) => {
        if (!confirm("Delete studio?")) return;
        try {
            await api.delete(`/api/studios/${id}`);
            onUpdate();
        } catch (e) { alert(e); }
    }

    const openCreate = () => {
        setEditingStudio({ name: '', description: '', id: '' });
        setIsModalOpen(true);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input placeholder="Search studios..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-slate-900 border-slate-800" />
                </div>
                <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                    <Plus size={16} /> Add Studio
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(studio => (
                    <Card key={studio.id} className="bg-slate-900/50 border-slate-800 hover:border-indigo-500/30 transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="h-12 w-12 rounded-lg bg-slate-800 overflow-hidden flex items-center justify-center">
                                    {studio.logo ? <img src={studio.logo} className="w-full h-full object-cover" /> : <span className="text-xl font-bold text-slate-500">{studio.name[0]}</span>}
                                </div>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-800" onClick={() => { setEditingStudio({ ...studio }); setIsModalOpen(true); }}>
                                        <Edit size={16} className="text-slate-400" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-900/20 hover:text-red-400" onClick={() => deleteStudio(studio.id)}>
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-100 mb-1">{studio.name}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2">{studio.description}</p>

                            <div className="mt-4 flex gap-2">
                                {studio.discord && <a href={studio.discord} target="_blank" className="text-xs bg-[#5865F2]/10 text-[#5865F2] px-2 py-1 rounded hover:bg-[#5865F2]/20">Discord</a>}
                                {studio.roblox && <a href={studio.roblox} target="_blank" className="text-xs bg-white/10 text-white px-2 py-1 rounded hover:bg-white/20">Roblox</a>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit Studio" footer={<><Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button onClick={saveStudio}>Save</Button></>}>
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
                    <div className="space-y-2">
                        <Label>Logo URL</Label>
                        <Input value={editingStudio?.logo || ''} onChange={e => setEditingStudio(p => ({ ...p!, logo: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Discord Link</Label>
                        <Input value={editingStudio?.discord || ''} onChange={e => setEditingStudio(p => ({ ...p!, discord: e.target.value }))} />
                    </div>
                </div>
            </Modal>
        </div>
    )
}

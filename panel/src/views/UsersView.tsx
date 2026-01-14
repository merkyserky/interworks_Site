import { useState } from 'react'
import { Plus, Search, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react'
import { User, Studio, api } from '@panel/lib/api'
import { Button } from '@panel/components/ui/button'
import { Input } from '@panel/components/ui/input'
import { Modal } from '@panel/components/ui/modal'
import { Label } from '@panel/components/ui/label'
import { ConfirmModal } from '@panel/components/ui/confirm-modal'
import { Checkbox } from '@panel/components/ui/checkbox'

interface UsersViewProps {
    users: User[];
    studios: Studio[];
    currentUser: User;
    onUpdate: () => void;
}

export function UsersView({ users, studios, currentUser, onUpdate }: UsersViewProps) {
    const [search, setSearch] = useState('')
    const [editingUser, setEditingUser] = useState<Partial<User> | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Fixed: Added null/undefined checks to prevent toLowerCase errors
    const filtered = users.filter(u =>
        (u.username || '').toLowerCase().includes(search.toLowerCase())
    );

    const saveUser = async () => {
        if (!editingUser || !editingUser.username) return;
        try {
            const isUpdate = users.some(u => u.username === editingUser.username);
            if (isUpdate) {
                await api.put(`/api/team/${editingUser.username}`, editingUser);
            } else {
                await api.post('/api/team', editingUser);
            }
            setIsModalOpen(false);
            onUpdate();
        } catch (e) { alert(e); }
    }

    const handleDeleteClick = (user: User) => {
        if (user.username === currentUser.username) {
            alert("You cannot delete your own account!");
            return;
        }
        setDeleteTarget(user);
        setIsConfirmOpen(true);
    }

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await api.delete(`/api/team/${deleteTarget.username}`);
            setIsConfirmOpen(false);
            setDeleteTarget(null);
            onUpdate();
        } catch (e) {
            alert(e);
        } finally {
            setIsDeleting(false);
        }
    }

    const toggleStudio = (studioName: string, checked: boolean) => {
        let current = editingUser?.allowedStudios || [];
        if (checked) {
            current = [...current, studioName];
        } else {
            current = current.filter(n => n !== studioName);
        }
        setEditingUser(p => ({ ...p!, allowedStudios: current }));
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-slate-900 border-slate-800" />
                </div>
                <Button onClick={() => { setEditingUser({ username: '', role: 'user', allowedStudios: [] }); setIsModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                    <Plus size={16} /> Add User
                </Button>
            </div>

            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/50">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-900 text-slate-400 font-medium">
                        <tr>
                            <th className="px-6 py-4">Username</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Permissions</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filtered.map(user => (
                            <tr key={user.username} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                                            {(user.username || 'U')[0].toUpperCase()}
                                        </div>
                                        <span className="font-medium text-slate-200">{user.username}</span>
                                        {user.username === currentUser.username && (
                                            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded uppercase">You</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-violet-500/20 text-violet-300' : 'bg-slate-700/50 text-slate-400'}`}>
                                        {user.role === 'admin' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {(user.allowedStudios || []).includes('*') ? (
                                        <span className="text-emerald-400">All Studios</span>
                                    ) : (
                                        (user.allowedStudios || []).join(', ') || <span className="text-slate-600">None</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="outline" className="h-8 border-slate-700" onClick={() => { setEditingUser({ ...user }); setIsModalOpen(true); }}>
                                            Edit
                                        </Button>
                                        {user.username !== currentUser.username && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 hover:bg-red-900/20 hover:text-red-400"
                                                onClick={() => handleDeleteClick(user)}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 text-slate-600">
                    No users found matching your search.
                </div>
            )}

            {/* Edit/Create Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingUser?.username && users.some(u => u.username === editingUser.username) ? "Edit User" : "Add User"}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={saveUser} className="bg-indigo-600 hover:bg-indigo-700">Save</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Username</Label>
                        <Input
                            value={editingUser?.username || ''}
                            onChange={e => setEditingUser(p => ({ ...p!, username: e.target.value }))}
                            disabled={users.some(u => u.username === editingUser?.username) && editingUser?.role !== undefined}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Password {users.some(u => u.username === editingUser?.username) && <span className="text-slate-500">(Leave blank to keep unchanged)</span>}</Label>
                        <Input type="password" value={editingUser?.password || ''} onChange={e => setEditingUser(p => ({ ...p!, password: e.target.value }))} />
                    </div>

                    <div className="space-y-3">
                        <Label>Role</Label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setEditingUser(p => ({ ...p!, role: 'user' }))}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${editingUser?.role === 'user'
                                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                                        : 'border-slate-700 text-slate-400 hover:border-slate-600'
                                    }`}
                            >
                                <ShieldAlert size={20} />
                                <span className="font-medium">User</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditingUser(p => ({ ...p!, role: 'admin' }))}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${editingUser?.role === 'admin'
                                        ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                                        : 'border-slate-700 text-slate-400 hover:border-slate-600'
                                    }`}
                            >
                                <ShieldCheck size={20} />
                                <span className="font-medium">Admin</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Allowed Studios</Label>
                        <p className="text-xs text-slate-500">Select studios this user can manage.</p>
                        <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-lg p-3 space-y-2">
                            <Checkbox
                                checked={editingUser?.allowedStudios?.includes('*') || false}
                                onChange={(checked) => {
                                    if (checked) setEditingUser(p => ({ ...p!, allowedStudios: ['*'] }));
                                    else setEditingUser(p => ({ ...p!, allowedStudios: [] }));
                                }}
                                label="ALL STUDIOS (*)"
                                description="Full access to all studios"
                                size="sm"
                            />
                            <div className="h-px bg-slate-800 my-2" />
                            {studios.map(s => (
                                <Checkbox
                                    key={s.id}
                                    checked={editingUser?.allowedStudios?.includes(s.name) || false}
                                    onChange={(checked) => toggleStudio(s.name, checked)}
                                    label={s.name}
                                    disabled={editingUser?.allowedStudios?.includes('*')}
                                    size="sm"
                                />
                            ))}
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
                title="Delete User"
                message={`Are you sure you want to delete user "${deleteTarget?.username}"? This action cannot be undone and will revoke all their access.`}
                confirmText="Delete User"
                variant="danger"
                loading={isDeleting}
            />
        </div>
    )
}

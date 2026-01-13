
import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { User, Studio, api } from '@panel/lib/api'
import { Button } from '@panel/components/ui/button'
import { Input } from '@panel/components/ui/input'
import { Modal } from '@panel/components/ui/modal'
import { Label } from '@panel/components/ui/label'

interface UsersViewProps {
    users: User[];
    studios: Studio[];
    currentUser: User;
    onUpdate: () => void;
}

export function UsersView({ users, studios, onUpdate }: UsersViewProps) {
    // Only admins can see this page technically, but good to safeguard
    const [search, setSearch] = useState('')
    const [editingUser, setEditingUser] = useState<Partial<User> | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const filtered = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()))

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
                                <td className="px-6 py-4 font-medium text-slate-200">{user.username}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-violet-500/20 text-violet-300' : 'bg-slate-700/50 text-slate-400'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {user.allowedStudios.includes('*') ? 'All Studios' : user.allowedStudios.join(', ') || 'None'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="outline" className="h-8 border-slate-700" onClick={() => { setEditingUser({ ...user }); setIsModalOpen(true); }}>
                                            Edit
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser?.username ? "Edit User" : "Add User"} footer={<><Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button onClick={saveUser}>Save</Button></>}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Username</Label>
                        <Input value={editingUser?.username || ''} onChange={e => setEditingUser(p => ({ ...p!, username: e.target.value }))} disabled={users.some(u => u.username === editingUser?.username) && editingUser?.role !== undefined} />
                    </div>
                    <div className="space-y-2">
                        <Label>Password {users.some(u => u.username === editingUser?.username) && '(Leave blank to keep unchanged)'}</Label>
                        <Input type="password" value={editingUser?.password || ''} onChange={e => setEditingUser(p => ({ ...p!, password: e.target.value }))} />
                    </div>

                    <div className="space-y-2">
                        <Label>Role</Label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={editingUser?.role === 'user'} onChange={() => setEditingUser(p => ({ ...p!, role: 'user' }))} />
                                <span className="text-slate-300">User</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={editingUser?.role === 'admin'} onChange={() => setEditingUser(p => ({ ...p!, role: 'admin' }))} />
                                <span className="text-slate-300">Admin</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Allowed Studios</Label>
                        <p className="text-xs text-slate-500 mb-2">Select studios this user can manage.</p>
                        <div className="max-h-40 overflow-y-auto border border-slate-800 rounded p-2 space-y-1">
                            <label className="flex items-center gap-2 hover:bg-slate-800/50 p-1 rounded">
                                <input
                                    type="checkbox"
                                    checked={editingUser?.allowedStudios?.includes('*')}
                                    onChange={(e) => {
                                        if (e.target.checked) setEditingUser(p => ({ ...p!, allowedStudios: ['*'] }));
                                        else setEditingUser(p => ({ ...p!, allowedStudios: [] }));
                                    }}
                                />
                                <span className="text-slate-300 font-bold">ALL STUDIOS (*)</span>
                            </label>
                            {studios.map(s => (
                                <label key={s.id} className="flex items-center gap-2 hover:bg-slate-800/50 p-1 rounded">
                                    <input
                                        type="checkbox"
                                        disabled={editingUser?.allowedStudios?.includes('*')}
                                        checked={editingUser?.allowedStudios?.includes(s.name)}
                                        onChange={(e) => {
                                            let current = editingUser?.allowedStudios || [];
                                            if (e.target.checked) current = [...current, s.name];
                                            else current = current.filter(n => n !== s.name);
                                            setEditingUser(p => ({ ...p!, allowedStudios: current }));
                                        }}
                                    />
                                    <span className="text-slate-300">{s.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

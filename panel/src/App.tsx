import React, { useState, useEffect } from 'react'
import {
    LayoutDashboard,
    Gamepad2,
    Building2,
    Users,
    Bell,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Settings
} from 'lucide-react'
import { Button } from '@panel/components/ui/button'
import { cn } from '@panel/lib/utils'
import { api, Game, Studio, User, Notification } from '@panel/lib/api'

// Views
import { GamesView } from './views/GamesView'
import { StudiosView } from './views/StudiosView'
import { UsersView } from './views/UsersView'
import { NotificationsView } from './views/NotificationsView'

export default function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [currentView, setCurrentView] = useState('games');
    const [games, setGames] = useState<Game[]>([]);
    const [studios, setStudios] = useState<Studio[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [gamesData, studiosData, usersData, notifsData, userData] = await Promise.all([
                api.get<Game[]>('/api/games'),
                api.get<Studio[]>('/api/studios'),
                api.get<User[]>('/api/team').catch(() => []),
                api.get<Notification[]>('/api/announcements'),
                api.get<User>('/api/me').catch(() => null)
            ]);
            setGames(gamesData);
            setStudios(studiosData);
            setUsers(usersData);
            setNotifications(notifsData);
            setCurrentUser(userData);
        } catch (e) {
            console.error("Failed to fetch data", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950 text-white font-sans animate-pulse">Loading Panel...</div>;

    const renderContent = () => {
        switch (currentView) {
            case 'games':
                return <GamesView games={games} studios={studios} currentUser={currentUser} onUpdate={fetchData} />;
            case 'studios':
                return <StudiosView studios={studios} onUpdate={fetchData} />;
            case 'users':
                return <UsersView users={users} studios={studios} currentUser={currentUser!} onUpdate={fetchData} />;
            case 'notifications':
                return <NotificationsView notifications={notifications} games={games} onUpdate={fetchData} />;
            default:
                return <div className="text-center text-slate-500 mt-20">Settings View Coming Soon</div>;
        }
    }

    return (
        <div className="flex h-screen w-full bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-950/80 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0",
                !sidebarOpen && "-translate-x-full lg:w-[70px]"
            )}>
                <div className="flex h-16 items-center border-b border-slate-800 px-6">
                    <div className="flex items-center gap-2 font-bold text-xl text-indigo-400">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                            <LayoutDashboard size={18} />
                        </div>
                        <span className={cn("transition-opacity whitespace-nowrap", !sidebarOpen && "lg:hidden")}>AstralCore</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
                    <NavItem icon={<Gamepad2 size={20} />} label="Games" active={currentView === 'games'} onClick={() => setCurrentView('games')} collapsed={!sidebarOpen} />
                    <NavItem icon={<Building2 size={20} />} label="Studios" active={currentView === 'studios'} onClick={() => setCurrentView('studios')} collapsed={!sidebarOpen} />
                    <NavItem icon={<Bell size={20} />} label="Announcements" active={currentView === 'notifications'} onClick={() => setCurrentView('notifications')} collapsed={!sidebarOpen} />

                    {currentUser?.role === 'admin' && (
                        <>
                            <div className="my-2 h-px bg-slate-800/50 mx-2" />
                            <NavItem icon={<Users size={20} />} label="Team" active={currentView === 'users'} onClick={() => setCurrentView('users')} collapsed={!sidebarOpen} />
                        </>
                    )}

                    <div className="mt-auto pt-4">
                        <NavItem icon={<Settings size={20} />} label="Settings" active={currentView === 'settings'} onClick={() => setCurrentView('settings')} collapsed={!sidebarOpen} />
                    </div>
                </nav>

                <div className="border-t border-slate-800 p-4">
                    <button onClick={() => api.logout()} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors", !sidebarOpen && "justify-center px-0")}>
                        <LogOut size={20} />
                        <span className={cn(!sidebarOpen && "lg:hidden")}>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/50 px-6 backdrop-blur-sm sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <Menu size={20} />
                        </Button>
                        <Button variant="ghost" size="icon" className="hidden lg:flex text-slate-400" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </Button>
                        <div className="hidden items-center gap-2 text-sm text-slate-500 md:flex">
                            <span>Dashboard</span>
                            <ChevronRight size={14} />
                            <span className="text-slate-200 capitalize">{currentView}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-slate-200">{currentUser?.username || 'Guest'}</p>
                                <p className="text-xs text-slate-500 capitalize">{currentUser?.role || 'User'}</p>
                            </div>
                            <div className="h-9 w-9 overflow-hidden rounded-full bg-indigo-500/20 ring-2 ring-slate-800">
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-indigo-500 to-violet-600 text-sm font-bold text-white uppercase">
                                    {currentUser?.username?.charAt(0) || 'U'}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-[#0a0a0a]">
                    <div className="max-w-7xl mx-auto">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    )
}

function NavItem({ icon, label, active, onClick, collapsed }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, collapsed: boolean }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group relative",
                active
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200",
                collapsed && "justify-center px-0"
            )}
        >
            <span className={cn("transition-colors", active && "text-indigo-400")}>{icon}</span>
            <span className={cn("truncate transition-all duration-300", collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block")}>
                {label}
            </span>
            {collapsed && (
                <div className="absolute left-14 z-50 rounded-md bg-slate-900 px-2 py-1 text-xs text-slate-200 shadow-xl border border-slate-800 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                    {label}
                </div>
            )}
            {active && !collapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
            )}
        </button>
    )
}

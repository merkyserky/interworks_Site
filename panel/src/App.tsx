import React, { useState, useEffect } from 'react'
import {
    LayoutDashboard,
    Gamepad2,
    Building2,
    Users,
    BarChart3,
    Search,
    Bell,
    LogOut,
    Settings,
    Menu,
    X,
    ChevronRight,
    CheckCircle2,
    Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@panel/components/ui/card'
import { Button } from '@panel/components/ui/button'
import { cn } from '@panel/lib/utils'

// Interfaces
interface SpotifyAlbum { name: string; spotifyId: string; }
interface Game { id: string; name: string; logo: string; description: string; ownedBy: string; status: 'coming-soon' | 'playable' | 'beta' | 'in-development'; genres: string[]; youtubeVideoId?: string; thumbnails?: string[]; spotifyAlbums?: SpotifyAlbum[]; link?: string; order?: number; visible?: boolean; }
interface Studio { id: string; name: string; description?: string; logo?: string; thumbnail?: string; hero?: boolean; media?: string[]; discord?: string; roblox?: string; youtube?: string; }
interface User { username: string; role: 'admin' | 'user'; allowedStudios: string[]; }

// API
const api = {
    async get<T>(path: string): Promise<T> {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
        return res.json();
    },
    async logout() {
        window.location.href = '/api/logout';
    }
};

export default function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [currentView, setCurrentView] = useState('games');
    const [games, setGames] = useState<Game[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [gamesData, , , userData] = await Promise.all([
                api.get<Game[]>('/api/games'),
                api.get<Studio[]>('/api/studios'),
                api.get<User[]>('/api/team'), // Make sure this endpoint exists or handle error
                api.get<User>('/api/me').catch(() => null) // Handle unauth potentially
            ]);
            setGames(gamesData);
            setCurrentUser(userData);
        } catch (e) {
            console.error("Failed to fetch data, using mock data", e);
            // Mock data for dev/preview
            setGames([
                {
                    id: '1',
                    name: 'Interworks Hub',
                    logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
                    description: 'The central hub for all Interworks games and community.',
                    ownedBy: 'Interworks Inc',
                    status: 'playable',
                    genres: ['Hub', 'Social'],
                    order: 1
                },
                {
                    id: '2',
                    name: 'Tension',
                    logo: 'https://images.unsplash.com/photo-1612287230217-127eb224097e?w=800&q=80',
                    description: 'High-octane psychological horror experience.',
                    ownedBy: 'Tension Studio',
                    status: 'beta',
                    genres: ['Horror', 'Survival'],
                    order: 2
                },
                {
                    id: '3',
                    name: 'Project: Ascend',
                    logo: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=800&q=80',
                    description: 'Vertical platformer with unique gravity mechanics.',
                    ownedBy: 'Interworks Inc',
                    status: 'in-development',
                    genres: ['Platformer', 'Sci-Fi'],
                    order: 3
                },
                {
                    id: '4',
                    name: 'Starlight Odyssey',
                    logo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
                    description: 'Explore the vastness of space in this open-world RPG.',
                    ownedBy: 'Starlight Studio',
                    status: 'coming-soon',
                    genres: ['RPG', 'Space'],
                    order: 4
                }
            ]);
            setCurrentUser({
                username: 'DevUser',
                role: 'admin',
                allowedStudios: ['*']
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950 text-white">Loading...</div>;

    return (
        <div className="flex h-screen w-full bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-950/50 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0",
                !sidebarOpen && "-translate-x-full lg:w-[70px]"
            )}>
                <div className="flex h-16 items-center border-b border-slate-800 px-6">
                    <div className="flex items-center gap-2 font-bold text-xl text-indigo-400">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                            <LayoutDashboard size={18} />
                        </div>
                        <span className={cn("transition-opacity", !sidebarOpen && "lg:hidden")}>AstralCore</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 p-4">
                    <NavItem icon={<Gamepad2 size={20} />} label="All Games" active={currentView === 'games'} onClick={() => setCurrentView('games')} collapsed={!sidebarOpen} />
                    <NavItem icon={<Building2 size={20} />} label="Studios" active={currentView === 'studios'} onClick={() => setCurrentView('studios')} collapsed={!sidebarOpen} />
                    {currentUser?.role === 'admin' && (
                        <NavItem icon={<Users size={20} />} label="Users" active={currentView === 'users'} onClick={() => setCurrentView('users')} collapsed={!sidebarOpen} />
                    )}
                    <NavItem icon={<BarChart3 size={20} />} label="Analytics" active={currentView === 'analytics'} onClick={() => setCurrentView('analytics')} collapsed={!sidebarOpen} />

                    <div className="my-4 h-px bg-slate-800 mx-2" />

                    <NavItem icon={<Settings size={20} />} label="Settings" active={currentView === 'settings'} onClick={() => setCurrentView('settings')} collapsed={!sidebarOpen} />
                </nav>

                <div className="border-t border-slate-800 p-4">
                    <button onClick={() => api.logout()} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors", !sidebarOpen && "justify-center px-0")}>
                        <LogOut size={20} />
                        <span className={cn(!sidebarOpen && "lg:hidden")}>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur-sm">
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
                            <span className="text-slate-200">Interworks Inc</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="h-9 w-64 rounded-md border border-slate-800 bg-slate-900/50 pl-9 pr-4 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <kbd className="pointer-events-none absolute right-2 top-2.5 hidden h-5 select-none items-center gap-1 rounded border border-slate-800 bg-slate-900 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100 sm:flex">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </div>

                        <Button variant="ghost" size="icon" className="text-slate-400 relative">
                            <Bell size={20} />
                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
                        </Button>

                        <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-slate-200">{currentUser?.username || 'Guest'}</p>
                                <p className="text-xs text-slate-500 capitalize">{currentUser?.role || 'User'}</p>
                            </div>
                            <div className="h-9 w-9 overflow-hidden rounded-full bg-indigo-500/20 ring-2 ring-slate-800">
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-indigo-500 to-violet-600 text-sm font-bold text-white">
                                    {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    {currentView === 'games' && <GamesView games={games} />}
                    {currentView === 'studios' && <div className="text-center py-20 text-slate-500">Studios View Coming Soon</div>}
                    {currentView === 'users' && <div className="text-center py-20 text-slate-500">Users View Coming Soon</div>}
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
                <div className="absolute left-14 z-50 rounded-md bg-slate-900 px-2 py-1 text-xs text-slate-200 shadow-xl border border-slate-800 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                    {label}
                </div>
            )}
            {active && !collapsed && (
                <div className="ml-auto h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
            )}
        </button>
    )
}

function GamesView({ games }: { games: Game[] }) {
    const activeServers = Math.floor(Math.random() * 50) + 10;
    const totalPlayers = games.length * 1240;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard title="Total Players" value={totalPlayers.toLocaleString()} icon={<Users size={20} className="text-indigo-400" />} trend="+12% from last month" />
                <StatsCard title="Active Servers" value={activeServers.toString()} icon={<Clock size={20} className="text-emerald-400" />} trend="Stable" />
                <StatsCard title="System Status" value="Operational" icon={<CheckCircle2 size={20} className="text-green-400" />} trend="All systems normal" />
            </div>

            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-slate-100">All Games</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {games.map(game => (
                    <GameGridCard key={game.id} game={game} />
                ))}
            </div>
        </div>
    )
}

function StatsCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
    return (
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                    {title}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-slate-100">{value}</div>
                <p className="text-xs text-slate-500 mt-1">{trend}</p>
            </CardContent>
        </Card>
    )
}

function GameGridCard({ game }: { game: Game }) {
    const statusColors: Record<string, string> = {
        'playable': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'coming-soon': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        'beta': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'in-development': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    };

    return (
        <Card className="group overflow-hidden bg-slate-900/50 border-slate-800 transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10">
            <div className="aspect-video w-full overflow-hidden bg-slate-800 relative">
                <img
                    src={game.logo}
                    alt={game.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                <div className="absolute top-3 right-3">
                    <span className={cn("px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border backdrop-blur-md", statusColors[game.status])}>
                        {game.status}
                    </span>
                </div>
            </div>
            <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-bold text-slate-100 truncate pr-2">{game.name}</h3>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 h-8">{game.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                    <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                        <Building2 size={12} />
                        {game.ownedBy}
                    </span>
                    <Button size="sm" variant="ghost" className="h-7 text-xs hover:bg-indigo-500 hover:text-white transition-colors">
                        Manage
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

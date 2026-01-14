import { useState, useEffect } from 'react'
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
    Settings,
    Image as ImageIcon
} from 'lucide-react'
import { Button } from '@panel/components/ui/button'
import { cn } from '@panel/lib/utils'
import { api, Game, Studio, User, Notification } from '@panel/lib/api'
import { ToastProvider } from '@panel/components/ui/toast'

// Views
import { GamesView } from './views/GamesView'
import { StudiosView } from './views/StudiosView'
import { UsersView } from './views/UsersView'
import { NotificationsView } from './views/NotificationsView'
import { SettingsView } from './views/SettingsView'
import { MediaView } from './views/MediaView'

type Theme = 'dark' | 'light' | 'system';

function getSystemTheme(): 'dark' | 'light' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function AppContent() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [currentView, setCurrentView] = useState('games');
    const [games, setGames] = useState<Game[]>([]);
    const [studios, setStudios] = useState<Studio[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('panel-theme') as Theme;
        return saved || 'dark';
    });
    const [compactMode, setCompactMode] = useState(() => {
        return localStorage.getItem('panel-compact') === 'true';
    });

    // Apply theme
    useEffect(() => {
        const root = document.documentElement;
        const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;

        if (effectiveTheme === 'light') {
            root.classList.add('light');
            root.classList.remove('dark');
        } else {
            root.classList.add('dark');
            root.classList.remove('light');
        }

        localStorage.setItem('panel-theme', theme);
    }, [theme]);

    // Apply compact mode
    useEffect(() => {
        const root = document.documentElement;
        if (compactMode) {
            root.classList.add('compact');
        } else {
            root.classList.remove('compact');
        }
        localStorage.setItem('panel-compact', String(compactMode));
    }, [compactMode]);

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            const root = document.documentElement;
            if (mediaQuery.matches) {
                root.classList.add('dark');
                root.classList.remove('light');
            } else {
                root.classList.add('light');
                root.classList.remove('dark');
            }
        };

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [theme]);

    useEffect(() => {
        fetchData();
    }, []);

    // Close mobile sidebar on view change
    useEffect(() => {
        setMobileSidebarOpen(false);
    }, [currentView]);

    // Close mobile sidebar on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setMobileSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-950 text-white font-sans">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-slate-400">Loading Panel...</span>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (currentView) {
            case 'games':
                return <GamesView games={games} studios={studios} currentUser={currentUser} onUpdate={fetchData} />;
            case 'studios':
                return <StudiosView studios={studios} currentUser={currentUser} onUpdate={fetchData} />;
            case 'users':
                return <UsersView users={users} studios={studios} currentUser={currentUser!} onUpdate={fetchData} />;
            case 'notifications':
                return <NotificationsView notifications={notifications} games={games} onUpdate={fetchData} />;
            case 'settings':
                return <SettingsView currentUser={currentUser} theme={theme} setTheme={setTheme} compactMode={compactMode} setCompactMode={setCompactMode} />;
            case 'media':
                return <MediaView />;
            default:
                return <div className="text-center text-slate-500 mt-20">View not found</div>;
        }
    }

    const navItems = [
        { id: 'games', icon: <Gamepad2 size={20} />, label: 'Games' },
        { id: 'studios', icon: <Building2 size={20} />, label: 'Studios' },
        { id: 'notifications', icon: <Bell size={20} />, label: 'Announcements' },
        { id: 'media', icon: <ImageIcon size={20} />, label: 'Media' },
    ];

    const adminNavItems = [
        { id: 'users', icon: <Users size={20} />, label: 'Team' },
    ];

    return (
        <div className="flex h-screen w-full bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30 overflow-hidden">
            {/* Mobile Overlay */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-950/95 backdrop-blur-xl transition-transform duration-300 lg:static",
                // Mobile: slide in/out
                mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                // Desktop: collapse width
                !sidebarOpen && "lg:w-[70px]"
            )}>
                <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4 lg:px-6">
                    <div className="flex items-center gap-2 font-bold text-xl text-indigo-400">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                            <LayoutDashboard size={18} />
                        </div>
                        <span className={cn("transition-opacity whitespace-nowrap", !sidebarOpen && "lg:opacity-0 lg:w-0 lg:overflow-hidden")}>
                            AstralCore
                        </span>
                    </div>
                    {/* Mobile close button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden text-slate-400"
                        onClick={() => setMobileSidebarOpen(false)}
                    >
                        <X size={20} />
                    </Button>
                </div>

                <nav className="flex-1 p-3 lg:p-4 overflow-y-auto scrollbar-thin">
                    <div className="space-y-1">
                        {navItems.map(item => (
                            <NavItem
                                key={item.id}
                                icon={item.icon}
                                label={item.label}
                                active={currentView === item.id}
                                onClick={() => setCurrentView(item.id)}
                                collapsed={!sidebarOpen}
                            />
                        ))}
                    </div>

                    {currentUser?.role === 'admin' && (
                        <>
                            <div className="my-3 h-px bg-slate-800/50 mx-2" />
                            <div className="space-y-1">
                                {adminNavItems.map(item => (
                                    <NavItem
                                        key={item.id}
                                        icon={item.icon}
                                        label={item.label}
                                        active={currentView === item.id}
                                        onClick={() => setCurrentView(item.id)}
                                        collapsed={!sidebarOpen}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    <div className="mt-auto pt-4">
                        <NavItem
                            icon={<Settings size={20} />}
                            label="Settings"
                            active={currentView === 'settings'}
                            onClick={() => setCurrentView('settings')}
                            collapsed={!sidebarOpen}
                        />
                    </div>
                </nav>

                <div className="border-t border-slate-800 p-3 lg:p-4">
                    <button
                        onClick={() => api.logout()}
                        className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors",
                            !sidebarOpen && "lg:justify-center lg:px-0"
                        )}
                    >
                        <LogOut size={20} />
                        <span className={cn(!sidebarOpen && "lg:hidden")}>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="flex h-14 sm:h-16 items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/50 px-4 sm:px-6 backdrop-blur-sm sticky top-0 z-40">
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Mobile menu button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden text-slate-400 h-9 w-9"
                            onClick={() => setMobileSidebarOpen(true)}
                        >
                            <Menu size={20} />
                        </Button>
                        {/* Desktop collapse button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden lg:flex text-slate-400 h-9 w-9"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </Button>
                        <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
                            <span>Dashboard</span>
                            <ChevronRight size={14} />
                            <span className="text-slate-200 capitalize">{currentView}</span>
                        </div>
                        {/* Mobile title */}
                        <span className="text-slate-200 font-medium capitalize sm:hidden">{currentView}</span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3 sm:border-l sm:border-slate-800 sm:pl-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-slate-200">{currentUser?.username || 'Guest'}</p>
                                <p className="text-xs text-slate-500 capitalize">{currentUser?.role || 'User'}</p>
                            </div>
                            <div className="h-8 w-8 sm:h-9 sm:w-9 overflow-hidden rounded-full bg-indigo-500/20 ring-2 ring-slate-800">
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-indigo-500 to-violet-600 text-sm font-bold text-white uppercase">
                                    {currentUser?.username?.charAt(0) || 'U'}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin bg-[#0a0a0a]">
                    <div className="max-w-7xl mx-auto pb-safe">
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
                collapsed && "lg:justify-center lg:px-0"
            )}
        >
            <span className={cn("transition-colors shrink-0", active && "text-indigo-400")}>{icon}</span>
            <span className={cn(
                "truncate transition-all duration-300",
                collapsed ? "lg:w-0 lg:opacity-0 lg:hidden" : "lg:w-auto lg:opacity-100 lg:block"
            )}>
                {label}
            </span>
            {collapsed && (
                <div className="absolute left-14 z-50 rounded-md bg-slate-900 px-2 py-1 text-xs text-slate-200 shadow-xl border border-slate-800 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap hidden lg:block">
                    {label}
                </div>
            )}
            {active && !collapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] hidden lg:block"></div>
            )}
        </button>
    )
}

export default function App() {
    return (
        <ToastProvider>
            <AppContent />
        </ToastProvider>
    );
}

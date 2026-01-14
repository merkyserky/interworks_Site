import { useState } from 'react'
import { Moon, Sun, Monitor, Palette, Bell, Shield, User as UserIcon } from 'lucide-react'
import { Button } from '@panel/components/ui/button'
import { Label } from '@panel/components/ui/label'
import { Toggle } from '@panel/components/ui/checkbox'
import { User } from '@panel/lib/api'
import { useNotify } from '@panel/components/ui/toast'
import { cn } from '@panel/lib/utils'

interface SettingsViewProps {
    currentUser: User | null;
    theme: 'dark' | 'light' | 'system';
    setTheme: (theme: 'dark' | 'light' | 'system') => void;
}

export function SettingsView({ currentUser, theme, setTheme }: SettingsViewProps) {
    const notify = useNotify();
    const [notifications, setNotifications] = useState(true);
    const [compactMode, setCompactMode] = useState(false);

    const themeOptions: { value: 'dark' | 'light' | 'system'; label: string; icon: typeof Moon }[] = [
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'system', label: 'System', icon: Monitor }
    ];

    const handleThemeChange = (newTheme: 'dark' | 'light' | 'system') => {
        setTheme(newTheme);
        notify.success(`Theme changed to ${newTheme}`);
    };

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-100 mb-2">Settings</h1>
                <p className="text-slate-500">Customize your panel experience</p>
            </div>

            {/* Profile Section */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <UserIcon size={18} />
                    </div>
                    <h2 className="font-semibold text-slate-100">Profile</h2>
                </div>
                <div className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-slate-200">Username</Label>
                            <p className="text-sm text-slate-500 mt-1">{currentUser?.username || 'Guest'}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
                            {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>
                    <div>
                        <Label className="text-slate-200">Role</Label>
                        <p className="mt-1">
                            <span className={cn(
                                "inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold uppercase",
                                currentUser?.role === 'admin'
                                    ? "bg-violet-500/20 text-violet-300"
                                    : "bg-slate-700/50 text-slate-400"
                            )}>
                                <Shield size={12} />
                                {currentUser?.role || 'User'}
                            </span>
                        </p>
                    </div>
                </div>
            </section>

            {/* Appearance Section */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Palette size={18} />
                    </div>
                    <h2 className="font-semibold text-slate-100">Appearance</h2>
                </div>
                <div className="p-4 sm:p-6 space-y-6">
                    <div>
                        <Label className="text-slate-200 mb-3 block">Theme</Label>
                        <div className="grid grid-cols-3 gap-3">
                            {themeOptions.map(option => {
                                const Icon = option.icon;
                                const isActive = theme === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => handleThemeChange(option.value)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                                            isActive
                                                ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                                : "border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800/50"
                                        )}
                                    >
                                        <Icon size={24} />
                                        <span className="text-sm font-medium">{option.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                        <Toggle
                            checked={compactMode}
                            onChange={v => {
                                setCompactMode(v);
                                notify.info(v ? 'Compact mode enabled' : 'Compact mode disabled');
                            }}
                            label="Compact Mode"
                            description="Use smaller spacing and font sizes"
                        />
                    </div>
                </div>
            </section>

            {/* Notifications Section */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Bell size={18} />
                    </div>
                    <h2 className="font-semibold text-slate-100">Notifications</h2>
                </div>
                <div className="p-4 sm:p-6 space-y-4">
                    <Toggle
                        checked={notifications}
                        onChange={v => {
                            setNotifications(v);
                            notify.success(v ? 'Notifications enabled' : 'Notifications disabled');
                        }}
                        label="Show Notifications"
                        description="Display toast notifications for actions"
                    />
                </div>
            </section>

            {/* Danger Zone - Only for admins */}
            {currentUser?.role === 'admin' && (
                <section className="rounded-xl border border-red-900/50 bg-red-950/20 overflow-hidden">
                    <div className="p-4 border-b border-red-900/50 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                            <Shield size={18} />
                        </div>
                        <h2 className="font-semibold text-red-400">Danger Zone</h2>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <Label className="text-slate-200">Reset All Data</Label>
                                <p className="text-sm text-slate-500 mt-1">Reset games, studios, and notifications to defaults</p>
                            </div>
                            <Button
                                variant="outline"
                                className="border-red-600 text-red-400 hover:bg-red-950/50 shrink-0"
                                onClick={() => notify.warning('This feature is disabled for safety')}
                            >
                                Reset Data
                            </Button>
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}

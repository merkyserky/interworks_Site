import { useState, useEffect } from 'react'
import { Moon, Sun, Monitor, Palette, Bell, Shield, User as UserIcon, Key, Minimize2 } from 'lucide-react'
import { Button } from '@panel/components/ui/button'
import { Label } from '@panel/components/ui/label'
import { Input } from '@panel/components/ui/input'
import { Toggle } from '@panel/components/ui/checkbox'
import { Modal } from '@panel/components/ui/modal'
import { User, api } from '@panel/lib/api'
import { useNotify } from '@panel/components/ui/toast'
import { cn } from '@panel/lib/utils'

interface SettingsViewProps {
    currentUser: User | null;
    theme: 'dark' | 'light' | 'system';
    setTheme: (theme: 'dark' | 'light' | 'system') => void;
    compactMode: boolean;
    setCompactMode: (compact: boolean) => void;
}

export function SettingsView({ currentUser, theme, setTheme, compactMode, setCompactMode }: SettingsViewProps) {
    const notify = useNotify();
    const [notifications, setNotifications] = useState(true);

    // Password reset
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Site Config
    const [config, setConfig] = useState<any>(null);
    const [savingConfig, setSavingConfig] = useState(false);

    useEffect(() => {
        if (currentUser?.role === 'admin') {
            api.get('/api/config')
                .then(data => setConfig(data))
                .catch(err => console.error('Failed to load config', err));
        }
    }, [currentUser]);

    const handleSaveConfig = async () => {
        setSavingConfig(true);
        try {
            await api.put('/api/config', config);
            notify.success('Configuration saved successfully');
        } catch (e) {
            notify.error('Failed to save configuration: ' + e);
        } finally {
            setSavingConfig(false);
        }
    };

    const themeOptions: { value: 'dark' | 'light' | 'system'; label: string; icon: typeof Moon }[] = [
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'system', label: 'System', icon: Monitor }
    ];

    const handleThemeChange = (newTheme: 'dark' | 'light' | 'system') => {
        setTheme(newTheme);
        notify.success(`Theme changed to ${newTheme}`);
    };

    const handleCompactModeChange = (enabled: boolean) => {
        setCompactMode(enabled);
        notify.info(enabled ? 'Compact mode enabled' : 'Compact mode disabled');
    };

    const handlePasswordChange = async () => {
        if (!newPassword || !confirmPassword) {
            notify.error('Please fill in all password fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            notify.error('New passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            notify.error('Password must be at least 6 characters');
            return;
        }

        setIsChangingPassword(true);
        try {
            await api.put(`/api/team/${currentUser?.username}`, {
                password: newPassword
            });
            notify.success('Password changed successfully');
            setIsPasswordModalOpen(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (e) {
            notify.error('Failed to change password: ' + e);
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8 max-w-2xl">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-100 mb-2">Settings</h1>
                <p className="text-sm text-slate-500">Customize your panel experience</p>
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
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <Label className="text-slate-200">Username</Label>
                            <p className="text-sm text-slate-500 mt-1 truncate">{currentUser?.username || 'Guest'}</p>
                        </div>
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shrink-0">
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

            {/* Security Section */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Key size={18} />
                    </div>
                    <h2 className="font-semibold text-slate-100">Security</h2>
                </div>
                <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div>
                            <Label className="text-slate-200">Password</Label>
                            <p className="text-sm text-slate-500 mt-1">Change your account password</p>
                        </div>
                        <Button
                            variant="outline"
                            className="border-slate-700 w-full sm:w-auto justify-center"
                            onClick={() => setIsPasswordModalOpen(true)}
                        >
                            <Key size={14} className="mr-2" />
                            Change Password
                        </Button>
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
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            {themeOptions.map(option => {
                                const Icon = option.icon;
                                const isActive = theme === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => handleThemeChange(option.value)}
                                        className={cn(
                                            "flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all",
                                            isActive
                                                ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                                : "border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800/50"
                                        )}
                                    >
                                        <Icon size={20} className="sm:w-6 sm:h-6" />
                                        <span className="text-xs sm:text-sm font-medium">{option.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                        <div className="flex items-center gap-3 mb-3">
                            <Minimize2 size={16} className="text-slate-400" />
                            <Label className="text-slate-200">Display Density</Label>
                        </div>
                        <Toggle
                            checked={compactMode}
                            onChange={handleCompactModeChange}
                            label="Compact Mode"
                            description="Use smaller spacing and font sizes throughout the panel"
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
                        label="Show Toast Notifications"
                        description="Display slide-in notifications for actions and updates"
                    />
                </div>
            </section>

            {/* Global Config Section - Admin Only */}
            {currentUser?.role === 'admin' && config && (
                <section className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                    <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                            <Monitor size={18} />
                        </div>
                        <h2 className="font-semibold text-slate-100">Global Site Configuration</h2>
                    </div>
                    <div className="p-4 sm:p-6 space-y-6">
                        {/* Special Countdown Config */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-slate-200">Special Countdown Mode</Label>
                                    <p className="text-sm text-slate-500">Replaces the main hero with a fullscreen countdown</p>
                                </div>
                                <Toggle
                                    checked={config?.specialCountdown?.enabled || false}
                                    onChange={(checked) => setConfig({ ...config, specialCountdown: { ...config.specialCountdown, enabled: checked } })}
                                />
                            </div>

                            {config?.specialCountdown?.enabled && (
                                <div className="space-y-4 pl-4 border-l-2 border-slate-800 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <Label>Title</Label>
                                        <Input
                                            value={config.specialCountdown.title}
                                            onChange={e => setConfig({ ...config, specialCountdown: { ...config.specialCountdown, title: e.target.value } })}
                                            placeholder="e.g. SOMETHING BIG IS COMING"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Input
                                            value={config.specialCountdown.description}
                                            onChange={e => setConfig({ ...config, specialCountdown: { ...config.specialCountdown, description: e.target.value } })}
                                            placeholder="Description..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Target Date</Label>
                                        <Input
                                            type="datetime-local"
                                            value={config.specialCountdown.targetDate ? new Date(config.specialCountdown.targetDate).toISOString().slice(0, 16) : ''}
                                            onChange={e => setConfig({ ...config, specialCountdown: { ...config.specialCountdown, targetDate: new Date(e.target.value).toISOString() } })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 flex justify-end border-t border-slate-800">
                            <Button onClick={handleSaveConfig} disabled={savingConfig} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                {savingConfig ? 'Saving...' : 'Save Configuration'}
                            </Button>
                        </div>
                    </div>
                </section>
            )}

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
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                            <div>
                                <Label className="text-slate-200">Reset All Data</Label>
                                <p className="text-sm text-slate-500 mt-1">Reset games, studios, and notifications to defaults</p>
                            </div>
                            <Button
                                variant="outline"
                                className="border-red-600 text-red-400 hover:bg-red-950/50 w-full sm:w-auto justify-center"
                                onClick={() => notify.warning('This feature is disabled for safety')}
                            >
                                Reset Data
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            {/* Password Change Modal */}
            <Modal
                isOpen={isPasswordModalOpen}
                onClose={() => {
                    setIsPasswordModalOpen(false);
                    setNewPassword('');
                    setConfirmPassword('');
                }}
                title="Change Password"
                className="max-w-md"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsPasswordModalOpen(false)} disabled={isChangingPassword}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePasswordChange}
                            className="bg-indigo-600 hover:bg-indigo-700"
                            disabled={isChangingPassword}
                        >
                            {isChangingPassword ? 'Changing...' : 'Change Password'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <p className="text-sm text-amber-400">
                            Make sure to remember your new password. You'll need it to log in.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label>New Password</Label>
                        <Input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            autoComplete="new-password"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Confirm New Password</Label>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            autoComplete="new-password"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    )
}

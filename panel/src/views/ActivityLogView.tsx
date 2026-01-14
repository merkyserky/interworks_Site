import { useState, useEffect } from 'react'
import {
    Activity,
    Gamepad2,
    Building2,
    Bell,
    User,
    Edit,
    Trash2,
    Plus,
    Clock,
    Filter,
    RefreshCw,
    Loader2
} from 'lucide-react'
import { Card, CardContent } from '@panel/components/ui/card'
import { Button } from '@panel/components/ui/button'
import { cn } from '@panel/lib/utils'
import { api } from '@panel/lib/api'

interface ActivityItem {
    id: string;
    type: 'create' | 'update' | 'delete';
    entityType: 'game' | 'studio' | 'announcement' | 'user';
    entityId: string;
    entityName: string;
    user: string;
    timestamp: number;
    details?: string;
}

const ENTITY_ICONS = {
    game: Gamepad2,
    studio: Building2,
    announcement: Bell,
    user: User,
};

const TYPE_ICONS = {
    create: Plus,
    update: Edit,
    delete: Trash2,
};

const TYPE_COLORS = {
    create: 'text-emerald-400 bg-emerald-500/10',
    update: 'text-amber-400 bg-amber-500/10',
    delete: 'text-red-400 bg-red-500/10',
};

function formatTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

export function ActivityLogView() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'create' | 'update' | 'delete'>('all');
    const [entityFilter, setEntityFilter] = useState<'all' | 'game' | 'studio' | 'announcement' | 'user'>('all');

    const fetchActivities = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filter !== 'all') params.set('type', filter);
            if (entityFilter !== 'all') params.set('entityType', entityFilter);
            params.set('limit', '100');

            const data = await api.get<ActivityItem[]>(`/api/activity?${params.toString()}`);
            setActivities(data);
        } catch (e) {
            setError('Failed to load activity log');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [filter, entityFilter]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                            <Activity size={22} />
                        </div>
                        Activity Log
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Track changes made to games, studios, and announcements</p>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchActivities}
                    disabled={loading}
                    className="text-slate-400"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                </Button>
            </div>

            {/* Filters */}
            <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Filter size={16} />
                            <span className="text-sm font-medium">Filters:</span>
                        </div>

                        {/* Action Type Filter */}
                        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
                            {(['all', 'create', 'update', 'delete'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilter(type)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize",
                                        filter === type
                                            ? "bg-indigo-500/20 text-indigo-400"
                                            : "text-slate-400 hover:text-slate-200"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        {/* Entity Type Filter */}
                        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
                            {(['all', 'game', 'studio', 'announcement', 'user'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setEntityFilter(type)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize",
                                        entityFilter === type
                                            ? "bg-violet-500/20 text-violet-400"
                                            : "text-slate-400 hover:text-slate-200"
                                    )}
                                >
                                    {type === 'announcement' ? 'notif' : type}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error State */}
            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading && activities.length === 0 && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-indigo-400" />
                </div>
            )}

            {/* Empty State */}
            {!loading && activities.length === 0 && (
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardContent className="p-12 text-center">
                        <Activity size={48} className="mx-auto text-slate-600 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-300 mb-2">No Activity Yet</h3>
                        <p className="text-sm text-slate-500">
                            Activity will appear here when changes are made to games, studios, or announcements.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Activity Timeline */}
            {activities.length > 0 && (
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardContent className="p-6">
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-800" />

                            <div className="space-y-6">
                                {activities.map((activity) => {
                                    const EntityIcon = ENTITY_ICONS[activity.entityType];
                                    const TypeIcon = TYPE_ICONS[activity.type];

                                    return (
                                        <div key={activity.id} className="relative flex gap-4 pl-12">
                                            {/* Timeline dot */}
                                            <div className={cn(
                                                "absolute left-3 w-5 h-5 rounded-full flex items-center justify-center",
                                                TYPE_COLORS[activity.type]
                                            )}>
                                                <TypeIcon size={10} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 bg-slate-800/50 rounded-xl p-4 hover:bg-slate-800/70 transition-colors">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "h-8 w-8 rounded-lg flex items-center justify-center",
                                                            activity.entityType === 'game' && "bg-indigo-500/10 text-indigo-400",
                                                            activity.entityType === 'studio' && "bg-violet-500/10 text-violet-400",
                                                            activity.entityType === 'announcement' && "bg-amber-500/10 text-amber-400",
                                                            activity.entityType === 'user' && "bg-emerald-500/10 text-emerald-400"
                                                        )}>
                                                            <EntityIcon size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-200">
                                                                <span className="text-slate-400">{activity.user}</span>
                                                                {' '}
                                                                <span className={cn(
                                                                    activity.type === 'create' && "text-emerald-400",
                                                                    activity.type === 'update' && "text-amber-400",
                                                                    activity.type === 'delete' && "text-red-400"
                                                                )}>
                                                                    {activity.type === 'create' && 'created'}
                                                                    {activity.type === 'update' && 'updated'}
                                                                    {activity.type === 'delete' && 'deleted'}
                                                                </span>
                                                                {' '}
                                                                <span className="text-slate-300">{activity.entityName}</span>
                                                            </p>
                                                            {activity.details && (
                                                                <p className="text-xs text-slate-500 mt-1">{activity.details}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
                                                        <Clock size={12} />
                                                        <span>{formatTimeAgo(activity.timestamp)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Info Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
                <p className="text-sm text-slate-400">
                    <span className="font-semibold text-indigo-400">Note:</span> Activity is logged automatically
                    when changes are made through the panel. Up to 500 most recent entries are stored.
                </p>
            </div>
        </div>
    );
}

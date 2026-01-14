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
    Filter
} from 'lucide-react'
import { Card, CardContent } from '@panel/components/ui/card'
import { Button } from '@panel/components/ui/button'
import { cn } from '@panel/lib/utils'

interface ActivityItem {
    id: string;
    type: 'create' | 'update' | 'delete';
    entityType: 'game' | 'studio' | 'announcement' | 'user';
    entityName: string;
    user: string;
    timestamp: Date;
    details?: string;
}

// Generate mock activity data
function generateMockActivity(): ActivityItem[] {
    const actions: ActivityItem[] = [
        { id: '1', type: 'create', entityType: 'game', entityName: 'Orbital Strike', user: 'Admin', timestamp: new Date(Date.now() - 1000 * 60 * 5), details: 'Created new game with beta status' },
        { id: '2', type: 'update', entityType: 'studio', entityName: 'StarForge Studios', user: 'Admin', timestamp: new Date(Date.now() - 1000 * 60 * 30), details: 'Updated studio description' },
        { id: '3', type: 'create', entityType: 'announcement', entityName: 'Summer Event', user: 'Admin', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), details: 'New countdown announcement' },
        { id: '4', type: 'update', entityType: 'game', entityName: 'Neon Runner', user: 'Admin', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), details: 'Changed status to playable' },
        { id: '5', type: 'delete', entityType: 'announcement', entityName: 'Old Event', user: 'Admin', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), details: 'Removed expired announcement' },
        { id: '6', type: 'create', entityType: 'user', entityName: 'NewMember', user: 'Admin', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), details: 'Added team member with user role' },
        { id: '7', type: 'update', entityType: 'game', entityName: 'Galaxy Defenders', user: 'Admin', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), details: 'Added new thumbnails' },
    ];
    return actions;
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

function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

export function ActivityLogView() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [filter, setFilter] = useState<'all' | 'create' | 'update' | 'delete'>('all');
    const [entityFilter, setEntityFilter] = useState<'all' | 'game' | 'studio' | 'announcement' | 'user'>('all');

    useEffect(() => {
        // In a real app, this would fetch from API
        setActivities(generateMockActivity());
    }, []);

    const filteredActivities = activities.filter(a => {
        if (filter !== 'all' && a.type !== filter) return false;
        if (entityFilter !== 'all' && a.entityType !== entityFilter) return false;
        return true;
    });

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
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1">
                    <Filter size={14} className="text-slate-500 mx-2" />
                    {['all', 'create', 'update', 'delete'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize",
                                filter === f
                                    ? "bg-indigo-500/20 text-indigo-400"
                                    : "text-slate-400 hover:text-slate-200"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1">
                    {['all', 'game', 'studio', 'announcement', 'user'].map(f => (
                        <button
                            key={f}
                            onClick={() => setEntityFilter(f as any)}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize",
                                entityFilter === f
                                    ? "bg-indigo-500/20 text-indigo-400"
                                    : "text-slate-400 hover:text-slate-200"
                            )}
                        >
                            {f === 'all' ? 'All Types' : f + 's'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Activity List */}
            <div className="space-y-3">
                {filteredActivities.length === 0 ? (
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardContent className="py-12 text-center">
                            <Activity size={40} className="mx-auto text-slate-700 mb-3" />
                            <p className="text-slate-500">No activity matches your filters</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredActivities.map((activity, index) => {
                        const EntityIcon = ENTITY_ICONS[activity.entityType];
                        const TypeIcon = TYPE_ICONS[activity.type];

                        return (
                            <div key={activity.id} className="relative">
                                {/* Timeline connector */}
                                {index < filteredActivities.length - 1 && (
                                    <div className="absolute left-6 top-14 w-0.5 h-8 bg-slate-800" />
                                )}

                                <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                            {/* Icon */}
                                            <div className={cn(
                                                "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 relative",
                                                TYPE_COLORS[activity.type]
                                            )}>
                                                <EntityIcon size={20} />
                                                <div className={cn(
                                                    "absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center",
                                                    TYPE_COLORS[activity.type]
                                                )}>
                                                    <TypeIcon size={10} />
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold text-slate-200">
                                                        {activity.user}
                                                    </span>
                                                    <span className="text-slate-500">
                                                        {activity.type === 'create' && 'created'}
                                                        {activity.type === 'update' && 'updated'}
                                                        {activity.type === 'delete' && 'deleted'}
                                                    </span>
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                                        activity.entityType === 'game' && "bg-indigo-500/10 text-indigo-400",
                                                        activity.entityType === 'studio' && "bg-violet-500/10 text-violet-400",
                                                        activity.entityType === 'announcement' && "bg-amber-500/10 text-amber-400",
                                                        activity.entityType === 'user' && "bg-emerald-500/10 text-emerald-400"
                                                    )}>
                                                        {activity.entityType}
                                                    </span>
                                                    <span className="font-medium text-slate-300 truncate">
                                                        "{activity.entityName}"
                                                    </span>
                                                </div>

                                                {activity.details && (
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        {activity.details}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600">
                                                    <Clock size={12} />
                                                    <span>{formatTimeAgo(activity.timestamp)}</span>
                                                    <span className="text-slate-700">•</span>
                                                    <span>{activity.timestamp.toLocaleTimeString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Load More */}
            {filteredActivities.length > 0 && (
                <div className="text-center">
                    <Button variant="ghost" className="text-slate-500">
                        Load more activity...
                    </Button>
                </div>
            )}
        </div>
    );
}

import { useState, useEffect } from 'react'
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Eye,
    Users,
    Gamepad2,
    Share2,
    Calendar,
    RefreshCw,
    Loader2
} from 'lucide-react'
import { Card, CardContent } from '@panel/components/ui/card'
import { Button } from '@panel/components/ui/button'
import { cn } from '@panel/lib/utils'
import { api } from '@panel/lib/api'

interface AnalyticsData {
    summary: {
        pageViews: number;
        uniqueVisitors: number;
        gameClicks: number;
        shares: number;
    };
    daily: {
        date: string;
        pageViews: number;
        uniqueVisitors: number;
    }[];
    topGames: {
        gameId: string;
        name: string;
        views: number;
        clicks: number;
        shares: number;
    }[];
}

export function AnalyticsView() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<number>(7);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.get<AnalyticsData>(`/api/analytics?days=${timeRange}`);
            setAnalytics(data);
        } catch (e) {
            setError('Failed to load analytics data');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const maxChartValue = analytics?.daily ? Math.max(...analytics.daily.map(d => d.pageViews), 1) : 1;

    // Calculate trends (compare first half to second half)
    const calculateTrend = (data: number[]): number => {
        if (data.length < 2) return 0;
        const mid = Math.floor(data.length / 2);
        const firstHalf = data.slice(0, mid).reduce((a, b) => a + b, 0) / mid || 1;
        const secondHalf = data.slice(mid).reduce((a, b) => a + b, 0) / (data.length - mid) || 1;
        return ((secondHalf - firstHalf) / firstHalf) * 100;
    };

    const pageViewTrend = analytics?.daily ? calculateTrend(analytics.daily.map(d => d.pageViews)) : 0;
    const visitorTrend = analytics?.daily ? calculateTrend(analytics.daily.map(d => d.uniqueVisitors)) : 0;

    const stats = analytics ? [
        {
            title: 'Total Page Views',
            value: analytics.summary.pageViews.toLocaleString(),
            change: pageViewTrend,
            icon: <Eye size={20} />,
            color: 'indigo'
        },
        {
            title: 'Unique Visitors',
            value: analytics.summary.uniqueVisitors.toLocaleString(),
            change: visitorTrend,
            icon: <Users size={20} />,
            color: 'violet'
        },
        {
            title: 'Game Card Clicks',
            value: analytics.summary.gameClicks.toLocaleString(),
            change: 0,
            icon: <Gamepad2 size={20} />,
            color: 'amber'
        },
        {
            title: 'Total Shares',
            value: analytics.summary.shares.toLocaleString(),
            change: 0,
            icon: <Share2 size={20} />,
            color: 'emerald'
        },
    ] : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                            <BarChart3 size={22} />
                        </div>
                        Analytics
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Monitor site performance and engagement</p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Time Range Selector */}
                    <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1">
                        {[
                            { value: 7, label: '7 Days' },
                            { value: 30, label: '30 Days' },
                            { value: 90, label: '90 Days' },
                        ].map(option => (
                            <button
                                key={option.value}
                                onClick={() => setTimeRange(option.value)}
                                className={cn(
                                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                                    timeRange === option.value
                                        ? "bg-indigo-500/20 text-indigo-400"
                                        : "text-slate-400 hover:text-slate-200"
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchAnalytics}
                        disabled={loading}
                        className="text-slate-400"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {loading && !analytics ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-indigo-400" />
                </div>
            ) : analytics && (
                <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, index) => (
                            <Card key={index} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center",
                                            stat.color === 'indigo' && "bg-indigo-500/10 text-indigo-400",
                                            stat.color === 'violet' && "bg-violet-500/10 text-violet-400",
                                            stat.color === 'amber' && "bg-amber-500/10 text-amber-400",
                                            stat.color === 'emerald' && "bg-emerald-500/10 text-emerald-400"
                                        )}>
                                            {stat.icon}
                                        </div>
                                        {stat.change !== 0 && (
                                            <div className={cn(
                                                "flex items-center gap-1 text-xs font-medium",
                                                stat.change >= 0 ? "text-emerald-400" : "text-red-400"
                                            )}>
                                                {stat.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                {Math.abs(stat.change).toFixed(1)}%
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
                                        <p className="text-xs text-slate-500 mt-1">{stat.title}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Chart Section */}
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-semibold text-slate-100">Page Views</h3>
                                    <p className="text-xs text-slate-500">Daily visitors over time</p>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-xs">
                                    <Calendar size={14} />
                                    <span>Last {timeRange} days</span>
                                </div>
                            </div>

                            {/* Simple Bar Chart */}
                            <div className="h-48 flex items-end gap-1">
                                {analytics.daily.map((day, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="relative w-full">
                                            <div
                                                className="w-full bg-gradient-to-t from-indigo-600 to-violet-600 rounded-t-lg transition-all hover:from-indigo-500 hover:to-violet-500"
                                                style={{ height: `${Math.max((day.pageViews / maxChartValue) * 180, 4)}px` }}
                                            />
                                            {/* Tooltip */}
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                                                {day.pageViews} views
                                            </div>
                                        </div>
                                        <span className="text-[9px] text-slate-500">
                                            {days[new Date(day.date).getDay()]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Games */}
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-semibold text-slate-100">Top Games</h3>
                                    <p className="text-xs text-slate-500">Most engaged games this period</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {analytics.topGames.length === 0 ? (
                                    <p className="text-center text-slate-500 py-8">No game activity yet</p>
                                ) : (
                                    analytics.topGames.map((game, index) => (
                                        <div key={game.gameId} className="flex items-center gap-4">
                                            <div className="w-6 text-center">
                                                <span className={cn(
                                                    "text-sm font-bold",
                                                    index === 0 && "text-amber-400",
                                                    index === 1 && "text-slate-300",
                                                    index === 2 && "text-amber-700",
                                                    index > 2 && "text-slate-500"
                                                )}>
                                                    {index + 1}
                                                </span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-slate-200 truncate">{game.name}</span>
                                                </div>

                                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <Gamepad2 size={12} />
                                                        {game.clicks} clicks
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Share2 size={12} />
                                                        {game.shares} shares
                                                    </span>
                                                </div>

                                                {/* Progress bar */}
                                                <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                                                        style={{ width: `${((game.clicks + game.shares) / (analytics.topGames[0].clicks + analytics.topGames[0].shares || 1)) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Info Banner */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
                        <p className="text-sm text-slate-400">
                            <span className="font-semibold text-indigo-400">Note:</span> Analytics data is collected
                            from pageviews and user interactions. Data is stored with privacy in mind - IP addresses
                            are hashed and only used for unique visitor counting.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}

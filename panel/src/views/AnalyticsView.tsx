import { useState, useEffect } from 'react'
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Eye,
    Users,
    Gamepad2,
    Clock,
    ArrowUpRight,
    Calendar
} from 'lucide-react'
import { Card, CardContent } from '@panel/components/ui/card'
import { cn } from '@panel/lib/utils'

interface StatCard {
    title: string;
    value: string | number;
    change: number;
    changeLabel: string;
    icon: React.ReactNode;
    color: string;
}

interface GameStat {
    name: string;
    views: number;
    clicks: number;
    trend: number;
}

// Mock data generators
function generateMockStats(): StatCard[] {
    return [
        {
            title: 'Total Page Views',
            value: '24,521',
            change: 12.5,
            changeLabel: 'vs last week',
            icon: <Eye size={20} />,
            color: 'indigo'
        },
        {
            title: 'Unique Visitors',
            value: '8,432',
            change: 8.2,
            changeLabel: 'vs last week',
            icon: <Users size={20} />,
            color: 'violet'
        },
        {
            title: 'Game Card Clicks',
            value: '3,241',
            change: -2.1,
            changeLabel: 'vs last week',
            icon: <Gamepad2 size={20} />,
            color: 'amber'
        },
        {
            title: 'Avg. Session Duration',
            value: '2m 34s',
            change: 15.7,
            changeLabel: 'vs last week',
            icon: <Clock size={20} />,
            color: 'emerald'
        },
    ];
}

function generateMockGameStats(): GameStat[] {
    return [
        { name: 'Orbital Strike', views: 5421, clicks: 892, trend: 23.5 },
        { name: 'Neon Runner', views: 4210, clicks: 634, trend: 15.2 },
        { name: 'Galaxy Defenders', views: 3892, clicks: 521, trend: -5.1 },
        { name: 'Cyber Quest', views: 2841, clicks: 412, trend: 8.7 },
        { name: 'Shadow Realm', views: 2156, clicks: 298, trend: -12.3 },
    ];
}

function generateMockChartData(): number[] {
    return Array.from({ length: 7 }, () => Math.floor(Math.random() * 1000) + 500);
}

export function AnalyticsView() {
    const [stats, setStats] = useState<StatCard[]>([]);
    const [gameStats, setGameStats] = useState<GameStat[]>([]);
    const [chartData, setChartData] = useState<number[]>([]);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

    useEffect(() => {
        // In a real app, this would fetch from API
        setStats(generateMockStats());
        setGameStats(generateMockGameStats());
        setChartData(generateMockChartData());
    }, [timeRange]);

    const maxChartValue = Math.max(...chartData);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

                {/* Time Range Selector */}
                <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1">
                    {[
                        { value: '7d', label: '7 Days' },
                        { value: '30d', label: '30 Days' },
                        { value: '90d', label: '90 Days' },
                    ].map(option => (
                        <button
                            key={option.value}
                            onClick={() => setTimeRange(option.value as any)}
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
            </div>

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
                                <div className={cn(
                                    "flex items-center gap-1 text-xs font-medium",
                                    stat.change >= 0 ? "text-emerald-400" : "text-red-400"
                                )}>
                                    {stat.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    {Math.abs(stat.change)}%
                                </div>
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
                            <span>Last 7 days</span>
                        </div>
                    </div>

                    {/* Simple Bar Chart */}
                    <div className="h-48 flex items-end gap-2">
                        {chartData.map((value, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-gradient-to-t from-indigo-600 to-violet-600 rounded-t-lg transition-all hover:from-indigo-500 hover:to-violet-500"
                                    style={{ height: `${(value / maxChartValue) * 100}%` }}
                                />
                                <span className="text-[10px] text-slate-500">{days[index]}</span>
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
                            <p className="text-xs text-slate-500">Most viewed games this period</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {gameStats.map((game, index) => (
                            <div key={index} className="flex items-center gap-4">
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
                                        <div className={cn(
                                            "flex items-center gap-1 text-xs",
                                            game.trend >= 0 ? "text-emerald-400" : "text-red-400"
                                        )}>
                                            {game.trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                            {Math.abs(game.trend)}%
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Eye size={12} />
                                            {game.views.toLocaleString()} views
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <ArrowUpRight size={12} />
                                            {game.clicks.toLocaleString()} clicks
                                        </span>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                                            style={{ width: `${(game.views / gameStats[0].views) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Info Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
                <p className="text-sm text-slate-400">
                    <span className="font-semibold text-indigo-400">Note:</span> This is a demo analytics dashboard.
                    In production, connect to your analytics provider (Google Analytics, Plausible, etc.) to display real data.
                </p>
            </div>
        </div>
    );
}

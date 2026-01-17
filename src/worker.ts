/**
 * Cloudflare Worker - Multi-subdomain Router with Panel Authentication & Games API
 * Supports notifications with countdowns, multiple genres, and dynamic content
 */

export interface Env {
    ASSETS: { fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> };
    PANEL_AUTH: KVNamespace;
    GAMES_DATABASE: KVNamespace;
    ANALYTICS_DATA: KVNamespace; // For analytics tracking
}

// Interfaces
interface SpotifyAlbum {
    name: string;
    spotifyId: string;
}

interface Notification {
    id: string;
    gameId: string;
    title: string;
    description: string;
    countdownTo?: string; // ISO date string
    youtubeVideoId?: string;
    link?: string;
    active: boolean;
}

// Game Events - highly customizable countdown/event system
interface GameEvent {
    id: string;
    type: 'countdown' | 'event' | 'announcement';
    title: string;
    description?: string;
    // For countdown: single target date
    // For event: date range
    startDate?: string; // ISO date string
    endDate?: string;   // ISO date string (same as startDate for countdown, different for event range)
    // Display options
    color: string;      // Hex color for the event badge/banner
    icon?: 'rocket' | 'star' | 'calendar' | 'clock' | 'gift' | 'fire' | 'sparkles' | 'trophy';
    showOnCard?: boolean;   // Show on game card
    showOnHero?: boolean;   // Show in hero section
    showCountdown?: boolean; // Show countdown timer
    // Status
    active: boolean;
    priority?: number;  // Higher = more important, shown first
}

interface Game {
    id: string;
    name: string;
    logo: string;
    description: string;
    ownedBy: string;
    status: 'coming-soon' | 'playable' | 'beta' | 'in-development';
    genres: string[]; // Changed to array
    youtubeVideoId?: string;
    thumbnails?: string[];
    spotifyAlbums?: SpotifyAlbum[];
    link?: string;
    order?: number;
    visible?: boolean;
    events?: GameEvent[]; // Customizable events/countdowns
}


interface Studio {
    id: string;
    name: string;
    description?: string;
    logo?: string;
    thumbnail?: string;
    hero?: boolean;
    media?: string[];
    discord?: string;
    roblox?: string;
    youtube?: string;
}

interface User {
    username: string;
    password?: string; // For internal storage, not API response
    role: 'admin' | 'user';
    allowedStudios: string[]; // List of studio names or IDs, or ['*'] for all
}

// Analytics interfaces
interface AnalyticsEvent {
    type: 'pageview' | 'game_click' | 'share' | 'play_click';
    gameId?: string;
    gameName?: string;
    timestamp: number;
    referrer?: string;
    userAgent?: string;
}

interface DailyAnalytics {
    date: string; // YYYY-MM-DD
    pageViews: number;
    uniqueVisitors: string[]; // IP hashes
    gameClicks: Record<string, number>; // gameId -> count
    shares: Record<string, number>; // gameId -> count
    playClicks: Record<string, number>; // gameId -> count
}

// Activity Log interface
interface ActivityLogEntry {
    id: string;
    type: 'create' | 'update' | 'delete';
    entityType: 'game' | 'studio' | 'announcement' | 'user';
    entityId: string;
    entityName: string;
    user: string;
    timestamp: number;
    details?: string;
}

interface SiteConfig {
    specialCountdown: {
        enabled: boolean;
        title: string;
        description: string;
        targetDate: string; // ISO date
        logo?: string;
        backgroundImage?: string;
        youtubeVideoId?: string;
        youtubeRevealDate?: string; // ISO date - when to start showing the video
    }
}

const DEFAULT_CONFIG: SiteConfig = {
    specialCountdown: {
        enabled: false,
        title: "Something Big is Coming",
        description: "Get ready for the next evolution.",
        targetDate: "",
        logo: "",
        backgroundImage: "/astral_hero_background.png",
        youtubeVideoId: "",
        youtubeRevealDate: ""
    }
};

// Default data
const DEFAULT_STUDIOS: Studio[] = [
    { id: 'interworks', name: 'Interworks Inc', description: 'The main studio.', discord: 'https://discord.gg/C2wGG8KHRr', roblox: 'https://www.roblox.com/communities/34862200/Interworks-Inc#!/', hero: true },
    { id: 'astral-core', name: 'Astral Core', description: 'Creators of Unseen Floors.', logo: '/studios/astral_Core.png', discord: 'https://discord.gg/5nJgPbdTpy', roblox: 'https://www.roblox.com/communities/13408947/Astral-Core-Games#!/', youtube: 'https://www.youtube.com/@plasmix2', hero: true },
    { id: 'gub-studs', name: 'Gub Studs', description: 'Makers of Gub Ball.' },
];

const DEFAULT_GAMES: Game[] = [
    {
        id: 'ashmoor-casefiles',
        name: 'Ashmoor Casefiles',
        logo: '/ashmoor.png',
        description: 'After the disaster, when humanity fell onto itself, you the traveler came upon the small town of Ashmoor. Discover unsolved cases, encountering friends and foes on your journey, and by your side a handy shotgun which feeds off you blood. The heart is like a rose, like the one that bloomed years ago.',
        ownedBy: 'Interworks Inc',
        status: 'coming-soon',
        genres: ['Horror', 'Mystery'],
    },
    {
        id: 'unseen-floors',
        name: 'Unseen Floors',
        logo: '/LogoUnseen.png',
        description: 'There is no description at this time.',
        ownedBy: 'Astral Core',
        status: 'coming-soon',
        genres: ['Horror'],
        youtubeVideoId: '23Mq7j-O88E',
        thumbnails: ['/unseen_Thumbnail.png'],
        spotifyAlbums: [{ name: 'OST Vol. 1', spotifyId: '78ZlzFurP42walRtyiRbN8' }],
    },
    {
        id: 'gub-ball',
        name: 'Gub Ball',
        logo: '/LogoGub.png',
        description: '"Retro-Slop" themed dodgeball game made for Jandels Gamejam 2025.',
        ownedBy: 'Gub Studs',
        status: 'playable',
        genres: ['Retro-Slop', 'Dodgeball'],
        youtubeVideoId: 'KLLQ8J_bvcY',
        thumbnails: ['/gub_Thumbnail.png'],
        spotifyAlbums: [{ name: 'Official OST', spotifyId: '6hT5mLIhXmNzDRwUi5TS9B' }],
        link: 'https://www.roblox.com/games/107401395098231/GUB-BALL',
    },
];

const DEFAULT_USERS: User[] = [
    { username: 'plasmix2', role: 'admin', allowedStudios: ['*'] },
    { username: 'waffly', role: 'admin', allowedStudios: ['*'] }
];

const MEDIA_FILES = [
    '/ashmoor.png', '/LogoUnseen.png', '/LogoGub.png', '/unseen_Thumbnail.png',
    '/gub_Thumbnail.png', '/astral_hero_background.png', '/interworks_hero_background.png',
    '/studios/astral_Core.png', '/favicon.svg', '/tension.png', '/tension_thumbnail.png'
];


function generateSessionToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Session helpers (KV-based)
async function createSession(env: Env, username: string, role: string, allowedStudios: string[]) {
    const token = generateSessionToken();
    const sessionData = { username, role, allowedStudios, expires: Date.now() + 86400000 };
    await env.PANEL_AUTH.put(`session:${token}`, JSON.stringify(sessionData), { expirationTtl: 86400 });
    return token;
}

async function getSession(env: Env, token: string | null) {
    if (!token) return null;
    const session = await env.PANEL_AUTH.get(`session:${token}`, 'json') as { username: string; role: string; allowedStudios: string[]; expires: number } | null;
    if (!session) return null;
    return session;
}

function getSessionToken(request: Request): string | null {
    const cookie = request.headers.get('cookie');
    if (!cookie) return null;
    const match = cookie.match(/panel_session=([^;]+)/);
    return match ? match[1] : null;
}



function corsHeaders(): HeadersInit {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
}

function jsonResponse(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
}

function getLoginPageHTML(error?: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="robots" content="noindex, nofollow">
    <title>Login | AstralCore Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { font-family: 'Inter', sans-serif; }
        body { background: #030712; }
        .glass { 
            background: rgba(15, 23, 42, 0.8); 
            backdrop-filter: blur(24px); 
            border: 1px solid rgba(99, 102, 241, 0.15);
        }
        .input-focus:focus { 
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        @keyframes float { 
            0%, 100% { transform: translateY(0) rotate(0deg); } 
            50% { transform: translateY(-20px) rotate(1deg); } 
        }
        @keyframes pulse-glow {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        .float { animation: float 8s ease-in-out infinite; }
        .pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
        .gradient-shift {
            background-size: 200% 200%;
            animation: gradient-shift 8s ease infinite;
        }
        .btn-gradient {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #6366f1 100%);
            background-size: 200% 200%;
            transition: all 0.3s ease;
        }
        .btn-gradient:hover {
            background-position: 100% 0;
            transform: translateY(-2px);
            box-shadow: 0 10px 40px -10px rgba(99, 102, 241, 0.5);
        }
        .btn-gradient:active { transform: translateY(0); }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center p-4 overflow-hidden">
    <!-- Animated Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pulse-glow"></div>
        <div class="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[100px] pulse-glow" style="animation-delay: 2s"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[150px]"></div>
        <!-- Grid pattern -->
        <div class="absolute inset-0 opacity-[0.03]" style="background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 50px 50px;"></div>
    </div>
    
    <div class="relative z-10 w-full max-w-md float">
        <!-- Logo -->
        <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-4 shadow-lg shadow-indigo-500/30">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
                </svg>
            </div>
            <h1 class="text-2xl font-bold text-white mb-1">AstralCore</h1>
            <p class="text-slate-400 text-sm">Sign in to access the dashboard</p>
        </div>
        
        <!-- Login Card -->
        <div class="glass rounded-2xl p-8 shadow-2xl">
            ${error ? `
            <div class="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                <div class="shrink-0 h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
                <p class="text-red-400 text-sm font-medium">${error}</p>
            </div>` : ''}
            
            <form method="POST" action="/api/login" class="space-y-5">
                <div>
                    <label class="block text-sm font-medium text-slate-300 mb-2">Username</label>
                    <input 
                        type="text" 
                        name="username" 
                        required 
                        autocomplete="username"
                        class="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none input-focus transition-all" 
                        placeholder="Enter your username"
                    >
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-300 mb-2">Password</label>
                    <input 
                        type="password" 
                        name="password" 
                        required 
                        autocomplete="current-password"
                        class="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none input-focus transition-all" 
                        placeholder="Enter your password"
                    >
                </div>
                <button 
                    type="submit" 
                    class="w-full py-3.5 btn-gradient text-white font-semibold rounded-xl"
                >
                    Sign In
                </button>
            </form>
        </div>
        
        <!-- Footer -->
        <p class="text-center text-slate-600 text-xs mt-6">
            Protected by AstralCore &copy; ${new Date().getFullYear()}
        </p>
    </div>
</body>
</html>`;
}

// Helper to migrate old genre string to array
function migrateGame(game: any): Game {
    if (typeof game.genre === 'string') {
        game.genres = game.genre.split(',').map((g: string) => g.trim()).filter(Boolean);
        delete game.genre;
    }
    if (!game.genres) game.genres = [];
    if (typeof game.visible === 'undefined') game.visible = true;
    if (typeof game.order === 'undefined') game.order = 0;
    return game as Game;
}
// Helper to check user permission for a studio
function hasStudioPermission(user: { role: string; allowedStudios: string[] }, studioName: string): boolean {
    if (user.role === 'admin') return true;
    if (user.allowedStudios.includes('*')) return true;
    return user.allowedStudios.includes(studioName);
}

// Analytics helpers
function getDateKey(date: Date = new Date()): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

async function hashIP(ip: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(ip + 'analytics-salt-v1');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function recordAnalyticsEvent(
    env: Env,
    event: AnalyticsEvent,
    request: Request
): Promise<void> {
    const dateKey = getDateKey();
    const analyticsKey = `analytics:${dateKey}`;

    let dayData = await env.ANALYTICS_DATA.get(analyticsKey, 'json') as DailyAnalytics | null;
    if (!dayData) {
        dayData = {
            date: dateKey,
            pageViews: 0,
            uniqueVisitors: [],
            gameClicks: {},
            shares: {},
            playClicks: {}
        };
    }

    // Get visitor hash for unique tracking
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const visitorHash = await hashIP(ip);

    switch (event.type) {
        case 'pageview':
            dayData.pageViews++;
            if (!dayData.uniqueVisitors.includes(visitorHash)) {
                dayData.uniqueVisitors.push(visitorHash);
            }
            break;
        case 'game_click':
            if (event.gameId) {
                dayData.gameClicks[event.gameId] = (dayData.gameClicks[event.gameId] || 0) + 1;
            }
            break;
        case 'share':
            if (event.gameId) {
                dayData.shares[event.gameId] = (dayData.shares[event.gameId] || 0) + 1;
            }
            break;
        case 'play_click':
            if (event.gameId) {
                dayData.playClicks[event.gameId] = (dayData.playClicks[event.gameId] || 0) + 1;
            }
            break;
    }

    // Store with 90 day expiry
    await env.ANALYTICS_DATA.put(analyticsKey, JSON.stringify(dayData), { expirationTtl: 60 * 60 * 24 * 90 });
}

async function getAnalytics(env: Env, days: number = 7): Promise<{
    summary: { pageViews: number; uniqueVisitors: number; gameClicks: number; shares: number };
    daily: { date: string; pageViews: number; uniqueVisitors: number }[];
    topGames: { gameId: string; views: number; clicks: number; shares: number }[];
}> {
    const daily: { date: string; pageViews: number; uniqueVisitors: number }[] = [];
    const gameStats: Record<string, { views: number; clicks: number; shares: number }> = {};
    let totalPageViews = 0;
    const allVisitors = new Set<string>();
    let totalGameClicks = 0;
    let totalShares = 0;

    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = getDateKey(date);
        const analyticsKey = `analytics:${dateKey}`;

        const dayData = await env.ANALYTICS_DATA.get(analyticsKey, 'json') as DailyAnalytics | null;
        if (dayData) {
            daily.unshift({
                date: dateKey,
                pageViews: dayData.pageViews,
                uniqueVisitors: dayData.uniqueVisitors.length
            });

            totalPageViews += dayData.pageViews;
            dayData.uniqueVisitors.forEach(v => allVisitors.add(v));

            // Aggregate game stats
            for (const [gameId, clicks] of Object.entries(dayData.gameClicks)) {
                if (!gameStats[gameId]) gameStats[gameId] = { views: 0, clicks: 0, shares: 0 };
                gameStats[gameId].clicks += clicks;
                totalGameClicks += clicks;
            }
            for (const [gameId, shares] of Object.entries(dayData.shares)) {
                if (!gameStats[gameId]) gameStats[gameId] = { views: 0, clicks: 0, shares: 0 };
                gameStats[gameId].shares += shares;
                totalShares += shares;
            }
        } else {
            daily.unshift({ date: dateKey, pageViews: 0, uniqueVisitors: 0 });
        }
    }

    // Sort games by total activity
    const topGames = Object.entries(gameStats)
        .map(([gameId, stats]) => ({ gameId, ...stats }))
        .sort((a, b) => (b.clicks + b.shares) - (a.clicks + a.shares))
        .slice(0, 10);

    return {
        summary: {
            pageViews: totalPageViews,
            uniqueVisitors: allVisitors.size,
            gameClicks: totalGameClicks,
            shares: totalShares
        },
        daily,
        topGames
    };
}

// Activity log helpers
async function logActivity(
    env: Env,
    entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>
): Promise<void> {
    const activityKey = 'activity_log';
    let logs = await env.GAMES_DATABASE.get(activityKey, 'json') as ActivityLogEntry[] | null || [];

    const newEntry: ActivityLogEntry = {
        ...entry,
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now()
    };

    // Add to front (newest first), keep only last 500 entries
    logs.unshift(newEntry);
    if (logs.length > 500) {
        logs = logs.slice(0, 500);
    }

    await env.GAMES_DATABASE.put(activityKey, JSON.stringify(logs));
}

async function getActivityLog(
    env: Env,
    filters?: { type?: string; entityType?: string; limit?: number }
): Promise<ActivityLogEntry[]> {
    const activityKey = 'activity_log';
    let logs = await env.GAMES_DATABASE.get(activityKey, 'json') as ActivityLogEntry[] | null || [];

    // Apply filters
    if (filters?.type) {
        logs = logs.filter(l => l.type === filters.type);
    }
    if (filters?.entityType) {
        logs = logs.filter(l => l.entityType === filters.entityType);
    }

    // Limit results
    const limit = filters?.limit || 100;
    return logs.slice(0, limit);
}


export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const hostname = request.headers.get('host') || url.hostname;
        const isPanelSubdomain = hostname.startsWith('panel.');

        if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });

        if (isPanelSubdomain) {
            const pathname = url.pathname;
            const sessionToken = getSessionToken(request);
            const currentUser = await getSession(env, sessionToken);

            // Login
            if (pathname === '/api/login' && request.method === 'POST') {
                const formData = await request.formData();
                const username = formData.get('username')?.toString() || '';
                const password = formData.get('password')?.toString() || '';

                // Check against users DB first
                let users = await env.GAMES_DATABASE.get('users', 'json') as User[] | null;
                if (!users) {
                    // Start with defaults if DB is empty
                    users = DEFAULT_USERS;
                    await env.GAMES_DATABASE.put('users', JSON.stringify(users));
                }

                const user = users.find(u => u.username === username);

                // Auth logic: Try DB user password if exists, else fallback to KV 'user:X' for legacy passwords
                let authenticated = false;
                if (user && user.password) {
                    if (user.password === password) authenticated = true;
                } else {
                    // Fallback/Legacy: Check PANEL_AUTH or separate KV for password
                    // For initial super admins, they might rely on legacy pass, or they need to set it up.
                    // Assuming 'user:username' still holds the password for now.
                    const storedPassword = await env.PANEL_AUTH.get(`user:${username}`);
                    if (storedPassword && storedPassword === password) authenticated = true;
                }

                if (authenticated) {
                    // Store minimal user info in session
                    const role = (user?.role) || 'user'; // Default to user if not in DB (shouldn't happen if we seed)
                    const allowedStudios = (user?.allowedStudios) || [];
                    const token = await createSession(env, username, role, allowedStudios);
                    return new Response(null, { status: 302, headers: { 'Location': '/', 'Set-Cookie': `panel_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400` } });
                }
                return new Response(getLoginPageHTML('Invalid credentials'), { status: 401, headers: { 'Content-Type': 'text/html' } });
            }

            // Logout
            if (pathname === '/api/logout') {
                if (sessionToken) await env.PANEL_AUTH.delete(`session:${sessionToken}`);
                return new Response(null, { status: 302, headers: { 'Location': '/', 'Set-Cookie': 'panel_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0' } });
            }

            // Assets
            if (pathname.startsWith('/assets/')) return env.ASSETS.fetch(request);

            // API routes (require auth)
            if (pathname.startsWith('/api/')) {
                if (!currentUser) return jsonResponse({ error: 'Unauthorized' }, 401);

                // Session/User Info
                if (pathname === '/api/me' && request.method === 'GET') {
                    return jsonResponse({
                        username: currentUser.username,
                        role: currentUser.role,
                        allowedStudios: currentUser.allowedStudios
                    });
                }

                // Users Management (Admin only) - Renamed to /api/team
                if (pathname.startsWith('/api/team')) {
                    if (currentUser.role !== 'admin') return jsonResponse({ error: 'Forbidden' }, 403);

                    if (pathname === '/api/team' && request.method === 'GET') {
                        let users = await env.GAMES_DATABASE.get('users', 'json') as User[] | null;
                        if (!users) users = DEFAULT_USERS;
                        // Don't return passwords
                        return jsonResponse(users.map(u => ({ ...u, password: undefined })));
                    }
                    if (pathname === '/api/team' && request.method === 'POST') {
                        let users = await env.GAMES_DATABASE.get('users', 'json') as User[] | null;
                        if (!users) { users = [...DEFAULT_USERS]; } // If totally empty, seed with defaults first

                        const newUser = await request.json() as User;
                        if (users.find(u => u.username === newUser.username)) return jsonResponse({ error: 'User already exists' }, 400);

                        // Also sync to legacy KV if it's a new user so they can login immediately if we are using fallback
                        if (newUser.password) {
                            await env.PANEL_AUTH.put(`user:${newUser.username}`, newUser.password);
                        }

                        users.push(newUser);
                        await env.GAMES_DATABASE.put('users', JSON.stringify(users));

                        // Log activity
                        await logActivity(env, {
                            type: 'create',
                            entityType: 'user',
                            entityId: newUser.username,
                            entityName: newUser.username,
                            user: currentUser.username
                        });

                        return jsonResponse({ ...newUser, password: undefined }, 201);
                    }
                    const userMatch = pathname.match(/^\/api\/team\/([^/]+)$/);
                    if (userMatch && request.method === 'PUT') {
                        let users = await env.GAMES_DATABASE.get('users', 'json') as User[] | null || [...DEFAULT_USERS];
                        const idx = users.findIndex(u => u.username === userMatch[1]);
                        if (idx === -1) return jsonResponse({ error: 'Not found' }, 404);
                        const updates = await request.json() as Partial<User>;
                        // Don't allow changing username easily as it's the ID
                        if (userMatch[1] !== updates.username && updates.username) {
                            // Username changed: check collision, add new, remove old
                            if (users.find(u => u.username === updates.username)) return jsonResponse({ error: 'Username already taken' }, 400);
                            const oldUser = users[idx];
                            users.splice(idx, 1);
                            users.push({ ...oldUser, ...updates, username: updates.username });
                            // Delete old legacy password if exists
                            await env.PANEL_AUTH.delete(`user:${userMatch[1]}`);
                            if (updates.password) await env.PANEL_AUTH.put(`user:${updates.username}`, updates.password);
                        } else {
                            users[idx] = { ...users[idx], ...updates, username: userMatch[1] };
                            if (updates.password) await env.PANEL_AUTH.put(`user:${userMatch[1]}`, updates.password);
                        }
                        await env.GAMES_DATABASE.put('users', JSON.stringify(users));

                        // Log activity
                        await logActivity(env, {
                            type: 'update',
                            entityType: 'user',
                            entityId: updates.username || userMatch[1],
                            entityName: updates.username || userMatch[1],
                            user: currentUser.username
                        });

                        return jsonResponse({ ...users[idx], password: undefined });
                    }
                    if (userMatch && request.method === 'DELETE') {
                        if (userMatch[1] === currentUser.username) return jsonResponse({ error: 'Cannot delete yourself' }, 400);
                        let users = await env.GAMES_DATABASE.get('users', 'json') as User[] | null || [...DEFAULT_USERS];
                        users = users.filter(u => u.username !== userMatch[1]);
                        await env.GAMES_DATABASE.put('users', JSON.stringify(users));

                        // Log activity
                        await logActivity(env, {
                            type: 'delete',
                            entityType: 'user',
                            entityId: userMatch[1],
                            entityName: userMatch[1],
                            user: currentUser.username
                        });

                        return jsonResponse({ success: true });
                    }
                }

                // Games CRUD
                if (pathname === '/api/games' && request.method === 'GET') {
                    let games = await env.GAMES_DATABASE.get('games', 'json') as any[] | null;
                    if (!games) { await env.GAMES_DATABASE.put('games', JSON.stringify(DEFAULT_GAMES)); games = DEFAULT_GAMES; }
                    return jsonResponse(games.map(migrateGame));
                }

                const gameMatch = pathname.match(/^\/api\/games\/([^/]+)$/);
                if (gameMatch && request.method === 'GET') {
                    const games = (await env.GAMES_DATABASE.get('games', 'json') as any[] || DEFAULT_GAMES).map(migrateGame);
                    const game = games.find(g => g.id === gameMatch[1]);
                    return game ? jsonResponse(game) : jsonResponse({ error: 'Not found' }, 404);
                }
                if (gameMatch && request.method === 'PUT') {
                    let games = (await env.GAMES_DATABASE.get('games', 'json') as any[] || [...DEFAULT_GAMES]).map(migrateGame);
                    const idx = games.findIndex(g => g.id === gameMatch[1]);
                    if (idx === -1) return jsonResponse({ error: 'Not found' }, 404);

                    // Permission check
                    if (!hasStudioPermission(currentUser, games[idx].ownedBy)) return jsonResponse({ error: 'Forbidden' }, 403);
                    const updated = await request.json() as Partial<Game>;
                    if (updated.ownedBy && !hasStudioPermission(currentUser, updated.ownedBy)) return jsonResponse({ error: 'Forbidden: Cannot transfer to studio you do not own' }, 403);

                    games[idx] = { ...games[idx], ...updated, id: gameMatch[1] };
                    await env.GAMES_DATABASE.put('games', JSON.stringify(games));

                    // Log activity
                    await logActivity(env, {
                        type: 'update',
                        entityType: 'game',
                        entityId: gameMatch[1],
                        entityName: games[idx].name,
                        user: currentUser.username
                    });

                    return jsonResponse(games[idx]);
                }
                if (pathname === '/api/games' && request.method === 'POST') {
                    let games = (await env.GAMES_DATABASE.get('games', 'json') as any[] || [...DEFAULT_GAMES]).map(migrateGame);
                    const newGame = await request.json() as Game;

                    // Permission check
                    if (!hasStudioPermission(currentUser, newGame.ownedBy)) return jsonResponse({ error: 'Forbidden' }, 403);

                    newGame.id = newGame.id || `game-${Date.now()}`;
                    games.push(newGame);
                    await env.GAMES_DATABASE.put('games', JSON.stringify(games));

                    // Log activity
                    await logActivity(env, {
                        type: 'create',
                        entityType: 'game',
                        entityId: newGame.id,
                        entityName: newGame.name,
                        user: currentUser.username
                    });

                    return jsonResponse(newGame, 201);
                }
                if (gameMatch && request.method === 'DELETE') {
                    // Admin-only for game deletion
                    if (currentUser.role !== 'admin') return jsonResponse({ error: 'Forbidden: Only admins can delete games' }, 403);

                    let games = (await env.GAMES_DATABASE.get('games', 'json') as any[] || [...DEFAULT_GAMES]).map(migrateGame);
                    const deletedGame = games.find(g => g.id === gameMatch[1]);
                    games = games.filter(g => g.id !== gameMatch[1]);
                    await env.GAMES_DATABASE.put('games', JSON.stringify(games));

                    // Log activity
                    await logActivity(env, {
                        type: 'delete',
                        entityType: 'game',
                        entityId: gameMatch[1],
                        entityName: deletedGame?.name || gameMatch[1],
                        user: currentUser.username
                    });

                    return jsonResponse({ success: true });
                }


                // Notifications CRUD
                if (pathname === '/api/announcements' && request.method === 'GET') {
                    let notifications = await env.GAMES_DATABASE.get('notifications', 'json') as Notification[] | null;
                    if (!notifications) notifications = [];
                    return jsonResponse(notifications);
                }
                if (pathname === '/api/announcements' && request.method === 'POST') {
                    let notifications = await env.GAMES_DATABASE.get('notifications', 'json') as Notification[] | null || [];
                    const newNotif = await request.json() as Notification;

                    // Permission check: Need to find the game to check studio
                    let games = (await env.GAMES_DATABASE.get('games', 'json') as any[] || DEFAULT_GAMES).map(migrateGame);
                    const game = games.find(g => g.id === newNotif.gameId);
                    if (game && !hasStudioPermission(currentUser, game.ownedBy)) return jsonResponse({ error: 'Forbidden' }, 403);

                    newNotif.id = newNotif.id || `notif-${Date.now()}`;
                    notifications.push(newNotif);
                    await env.GAMES_DATABASE.put('notifications', JSON.stringify(notifications));

                    // Log activity
                    await logActivity(env, {
                        type: 'create',
                        entityType: 'announcement',
                        entityId: newNotif.id,
                        entityName: newNotif.title,
                        user: currentUser.username
                    });

                    return jsonResponse(newNotif, 201);
                }
                const notifMatch = pathname.match(/^\/api\/announcements\/([^/]+)$/);
                if (notifMatch && request.method === 'PUT') {
                    let notifications = await env.GAMES_DATABASE.get('notifications', 'json') as Notification[] | null || [];
                    const idx = notifications.findIndex(n => n.id === notifMatch[1]);
                    if (idx === -1) return jsonResponse({ error: 'Not found' }, 404);

                    // Permission check
                    let games = (await env.GAMES_DATABASE.get('games', 'json') as any[] || DEFAULT_GAMES).map(migrateGame);
                    const game = games.find(g => g.id === notifications[idx].gameId);
                    if (game && !hasStudioPermission(currentUser, game.ownedBy)) return jsonResponse({ error: 'Forbidden' }, 403);

                    const updated = await request.json() as Partial<Notification>;
                    // If changing game, check new game permission too
                    if (updated.gameId) {
                        const newGame = games.find(g => g.id === updated.gameId);
                        if (newGame && !hasStudioPermission(currentUser, newGame.ownedBy)) return jsonResponse({ error: 'Forbidden' }, 403);
                    }

                    notifications[idx] = { ...notifications[idx], ...updated, id: notifMatch[1] };
                    await env.GAMES_DATABASE.put('notifications', JSON.stringify(notifications));

                    // Log activity
                    await logActivity(env, {
                        type: 'update',
                        entityType: 'announcement',
                        entityId: notifMatch[1],
                        entityName: notifications[idx].title,
                        user: currentUser.username
                    });

                    return jsonResponse(notifications[idx]);
                }
                if (notifMatch && request.method === 'DELETE') {
                    let notifications = await env.GAMES_DATABASE.get('notifications', 'json') as Notification[] | null || [];

                    // Permission check
                    let games = (await env.GAMES_DATABASE.get('games', 'json') as any[] || DEFAULT_GAMES).map(migrateGame);
                    const idx = notifications.findIndex(n => n.id === notifMatch[1]);
                    if (idx !== -1) {
                        const game = games.find(g => g.id === notifications[idx].gameId);
                        if (game && !hasStudioPermission(currentUser, game.ownedBy)) return jsonResponse({ error: 'Forbidden' }, 403);
                    }

                    const deletedNotif = notifications.find(n => n.id === notifMatch[1]);
                    notifications = notifications.filter(n => n.id !== notifMatch[1]);
                    await env.GAMES_DATABASE.put('notifications', JSON.stringify(notifications));

                    // Log activity
                    await logActivity(env, {
                        type: 'delete',
                        entityType: 'announcement',
                        entityId: notifMatch[1],
                        entityName: deletedNotif?.title || notifMatch[1],
                        user: currentUser.username
                    });

                    return jsonResponse({ success: true });
                }

                // Studios
                if (pathname === '/api/studios' && request.method === 'GET') {
                    let studios = await env.GAMES_DATABASE.get('studios', 'json') as Studio[] | null;
                    if (!studios) { await env.GAMES_DATABASE.put('studios', JSON.stringify(DEFAULT_STUDIOS)); studios = DEFAULT_STUDIOS; }
                    return jsonResponse(studios);
                }
                if (pathname === '/api/studios' && request.method === 'POST') {
                    if (currentUser.role !== 'admin') return jsonResponse({ error: 'Forbidden' }, 403);
                    let studios = await env.GAMES_DATABASE.get('studios', 'json') as Studio[] | null;
                    if (!studios) studios = [...DEFAULT_STUDIOS];

                    const newStudio = await request.json() as Studio;
                    if (studios.find(s => s.id === newStudio.id)) return jsonResponse({ error: 'ID already exists' }, 400);

                    studios.push(newStudio);
                    await env.GAMES_DATABASE.put('studios', JSON.stringify(studios));

                    // Log activity
                    await logActivity(env, {
                        type: 'create',
                        entityType: 'studio',
                        entityId: newStudio.id,
                        entityName: newStudio.name,
                        user: currentUser.username
                    });

                    return jsonResponse(newStudio, 201);
                }
                const studioMatch = pathname.match(/^\/api\/studios\/([^/]+)$/);
                if (studioMatch && request.method === 'PUT') {
                    let studios = await env.GAMES_DATABASE.get('studios', 'json') as Studio[] | null || [...DEFAULT_STUDIOS];
                    const idx = studios.findIndex(s => s.id === studioMatch[1]);
                    if (idx === -1) return jsonResponse({ error: 'Not found' }, 404);

                    // Permission check
                    if (!hasStudioPermission(currentUser, studios[idx].name)) return jsonResponse({ error: 'Forbidden' }, 403);

                    const updated = await request.json() as Partial<Studio>;
                    const oldName = studios[idx].name;
                    studios[idx] = { ...studios[idx], ...updated, id: studioMatch[1] };
                    await env.GAMES_DATABASE.put('studios', JSON.stringify(studios));

                    // Cascade name change to games and users if name changed
                    if (updated.name && updated.name !== oldName) {
                        // Update Games
                        let games = (await env.GAMES_DATABASE.get('games', 'json') as any[] || DEFAULT_GAMES).map(migrateGame);
                        let gamesChanged = false;
                        games = games.map(g => {
                            if (g.ownedBy === oldName) {
                                gamesChanged = true;
                                return { ...g, ownedBy: updated.name! };
                            }
                            return g;
                        });
                        if (gamesChanged) {
                            await env.GAMES_DATABASE.put('games', JSON.stringify(games));
                        }

                        // Update Users permissions
                        let users = await env.GAMES_DATABASE.get('users', 'json') as User[] | null;
                        if (users) {
                            let usersChanged = false;
                            users = users.map(u => {
                                if (u.allowedStudios && u.allowedStudios.includes(oldName)) {
                                    usersChanged = true;
                                    return {
                                        ...u,
                                        allowedStudios: u.allowedStudios.map(s => s === oldName ? updated.name! : s)
                                    };
                                }
                                return u;
                            });
                            if (usersChanged) {
                                await env.GAMES_DATABASE.put('users', JSON.stringify(users));
                            }
                        }
                    }
                    // Log activity
                    await logActivity(env, {
                        type: 'update',
                        entityType: 'studio',
                        entityId: studioMatch[1],
                        entityName: studios[idx].name,
                        user: currentUser.username
                    });

                    return jsonResponse(studios[idx]);
                }
                if (studioMatch && request.method === 'DELETE') {
                    if (currentUser.role !== 'admin') return jsonResponse({ error: 'Forbidden' }, 403);
                    let studios = await env.GAMES_DATABASE.get('studios', 'json') as Studio[] | null || [...DEFAULT_STUDIOS];
                    const deletedStudio = studios.find(s => s.id === studioMatch[1]);
                    studios = studios.filter(s => s.id !== studioMatch[1]);
                    await env.GAMES_DATABASE.put('studios', JSON.stringify(studios));

                    // Log activity
                    await logActivity(env, {
                        type: 'delete',
                        entityType: 'studio',
                        entityId: studioMatch[1],
                        entityName: deletedStudio?.name || studioMatch[1],
                        user: currentUser.username
                    });

                    return jsonResponse({ success: true });
                }

                // Media
                if (pathname === '/api/media') return jsonResponse(MEDIA_FILES);

                // Analytics (Admin only)
                if (pathname === '/api/analytics' && request.method === 'GET') {
                    if (currentUser.role !== 'admin') return jsonResponse({ error: 'Forbidden' }, 403);
                    const days = parseInt(url.searchParams.get('days') || '7');
                    const analytics = await getAnalytics(env, Math.min(days, 90)); // Max 90 days

                    // Enrich with game names
                    let games = await env.GAMES_DATABASE.get('games', 'json') as Game[] | null || DEFAULT_GAMES;
                    const enrichedTopGames = analytics.topGames.map(g => {
                        const game = games!.find(gm => gm.id === g.gameId);
                        return { ...g, name: game?.name || g.gameId };
                    });

                    return jsonResponse({
                        ...analytics,
                        topGames: enrichedTopGames
                    });
                }

                // Activity Log (Admin only)
                if (pathname === '/api/activity' && request.method === 'GET') {
                    if (currentUser.role !== 'admin') return jsonResponse({ error: 'Forbidden' }, 403);
                    const type = url.searchParams.get('type') || undefined;
                    const entityType = url.searchParams.get('entityType') || undefined;
                    const limit = parseInt(url.searchParams.get('limit') || '100');

                    const logs = await getActivityLog(env, { type, entityType, limit: Math.min(limit, 500) });
                    return jsonResponse(logs);
                }

                // Site Config (Admin only)
                if (pathname === '/api/config' && request.method === 'GET') {
                    // Admins can see raw config
                    if (currentUser.role !== 'admin') return jsonResponse({ error: 'Forbidden' }, 403);
                    let config = await env.GAMES_DATABASE.get('site_config', 'json') as SiteConfig | null;
                    if (!config) config = DEFAULT_CONFIG;
                    return jsonResponse(config);
                }
                if (pathname === '/api/config' && request.method === 'PUT') {
                    if (currentUser.role !== 'admin') return jsonResponse({ error: 'Forbidden' }, 403);
                    let config = await env.GAMES_DATABASE.get('site_config', 'json') as SiteConfig | null || DEFAULT_CONFIG;
                    const updates = await request.json() as Partial<SiteConfig>;

                    config = { ...config, ...updates, specialCountdown: { ...config.specialCountdown, ...updates.specialCountdown } };
                    await env.GAMES_DATABASE.put('site_config', JSON.stringify(config));

                    // Log activity
                    await logActivity(env, {
                        type: 'update',
                        entityType: 'studio', // Using 'studio' as entity type for lack of 'config' type in interface, or add new type
                        entityId: 'global-config',
                        entityName: 'Global Site Config',
                        user: currentUser.username
                    });

                    return jsonResponse(config);
                }

                return jsonResponse({ error: 'Not found' }, 404);
            }

            // Panel pages (require auth)
            if (!currentUser) return new Response(getLoginPageHTML(), { headers: { 'Content-Type': 'text/html' } });

            if (pathname === '/' || !pathname.match(/\.[a-zA-Z0-9]+$/)) {
                const panelIndexUrl = new URL(url); panelIndexUrl.pathname = '/panel/index.html';
                return env.ASSETS.fetch(new Request(panelIndexUrl.toString(), { method: request.method, headers: request.headers }));
            }

            const panelUrl = new URL(url); panelUrl.pathname = '/panel' + pathname;
            let response = await env.ASSETS.fetch(new Request(panelUrl.toString(), { method: request.method, headers: request.headers }));
            if (response.status === 404) response = await env.ASSETS.fetch(request);
            return response;
        }

        // ============ MAIN SITE PUBLIC API ============
        if (url.pathname === '/api/games') {
            let games = await env.GAMES_DATABASE.get('games', 'json') as any[] | null;
            if (!games) games = DEFAULT_GAMES;
            return jsonResponse(games.map(migrateGame));
        }
        if (url.pathname === '/api/announcements') {
            let notifications = await env.GAMES_DATABASE.get('notifications', 'json') as Notification[] | null || [];
            // Only return active notifications with future countdown
            const now = Date.now();
            const active = notifications.filter(n => n.active && (!n.countdownTo || new Date(n.countdownTo).getTime() > now));
            return jsonResponse(active);
        }
        if (url.pathname === '/api/studios') {
            let studios = await env.GAMES_DATABASE.get('studios', 'json') as Studio[] | null;
            if (!studios) studios = DEFAULT_STUDIOS;
            return jsonResponse(studios);
        }
        if (url.pathname === '/api/config') {
            let config = await env.GAMES_DATABASE.get('site_config', 'json') as SiteConfig | null;
            if (!config) config = DEFAULT_CONFIG;
            return jsonResponse(config);
        }

        // Public analytics tracking endpoint (accepts POST with minimal data)
        if (url.pathname === '/api/track' && request.method === 'POST') {
            try {
                const body = await request.json() as {
                    type: 'pageview' | 'game_click' | 'share' | 'play_click';
                    gameId?: string;
                    gameName?: string;
                };

                await recordAnalyticsEvent(env, {
                    type: body.type,
                    gameId: body.gameId,
                    gameName: body.gameName,
                    timestamp: Date.now(),
                    referrer: request.headers.get('Referer') || undefined,
                    userAgent: request.headers.get('User-Agent') || undefined
                }, request);

                return jsonResponse({ success: true });
            } catch {
                return jsonResponse({ error: 'Invalid request' }, 400);
            }
        }

        // Game-specific routes for Discord/Social embeds (e.g., /unseen-floors)
        // Check if this is a game slug route
        const gameSlug = url.pathname.slice(1).toLowerCase(); // Remove leading slash
        if (gameSlug && !gameSlug.includes('/') && !gameSlug.includes('.')) {
            let games = await env.GAMES_DATABASE.get('games', 'json') as Game[] | null || DEFAULT_GAMES;
            games = games.map(migrateGame);

            // Find game by ID or name (slug-ified)
            const game = games.find(g =>
                g.id.toLowerCase() === gameSlug ||
                g.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') === gameSlug
            );

            if (game) {
                // Get studio info for the game
                let studios = await env.GAMES_DATABASE.get('studios', 'json') as Studio[] | null || DEFAULT_STUDIOS;
                const studio = studios.find(s => s.name === game.ownedBy);

                // Base URL for absolute paths
                const baseUrl = `https://${url.hostname}`;

                // Get the best thumbnail
                const thumbnail = game.thumbnails?.[0] || game.logo;
                const absoluteThumbnail = thumbnail?.startsWith('http') ? thumbnail : `${baseUrl}${thumbnail}`;

                // Status text
                const statusText = {
                    'playable': '🎮 Playable Now',
                    'coming-soon': '🔜 Coming Soon',
                    'beta': '🧪 Beta',
                    'in-development': '🔧 In Development'
                }[game.status] || '';

                // Check if this is a bot/crawler (Discord, Twitter, etc.)
                const userAgent = request.headers.get('User-Agent') || '';
                const isBot = /discordbot|twitterbot|facebookexternalhit|linkedinbot|slackbot|telegrambot|whatsapp|pinterest|tumblr/i.test(userAgent);

                if (isBot) {
                    // Return HTML with Open Graph meta tags for bots
                    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>${game.name} | AstralCore</title>
    <meta name="title" content="${game.name} | AstralCore">
    <meta name="description" content="${game.description || `Check out ${game.name}!`}">
    
    <!-- Open Graph / Discord / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${baseUrl}/${gameSlug}">
    <meta property="og:title" content="${game.name}">
    <meta property="og:description" content="${game.description || `Check out ${game.name}!`}">
    <meta property="og:image" content="${absoluteThumbnail}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="AstralCore">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${baseUrl}/${gameSlug}">
    <meta name="twitter:title" content="${game.name}">
    <meta name="twitter:description" content="${game.description || `Check out ${game.name}!`}">
    <meta name="twitter:image" content="${absoluteThumbnail}">
    
    <!-- Discord-specific (theme color) -->
    <meta name="theme-color" content="#6366f1">
    
    <!-- Additional info -->
    ${game.genres?.length ? `<meta property="og:article:tag" content="${game.genres.join(', ')}">` : ''}
    ${studio ? `<meta property="og:article:author" content="${studio.name}">` : ''}
</head>
<body>
    <h1>${game.name}</h1>
    <p>${statusText}</p>
    <p>${game.description || ''}</p>
    ${game.link ? `<p><a href="${game.link}">Play Now</a></p>` : ''}
    <p>By ${game.ownedBy}</p>
</body>
</html>`;

                    return new Response(html, {
                        status: 200,
                        headers: {
                            'Content-Type': 'text/html; charset=utf-8',
                            'Cache-Control': 'public, max-age=3600'
                        }
                    });
                } else {
                    // Real user - redirect to main site with game section
                    // Use hash to scroll to games section, add game ID as query for highlighting
                    return Response.redirect(`${baseUrl}/#games?highlight=${game.id}`, 302);
                }
            }
        }

        // Serve static files
        let response = await env.ASSETS.fetch(request);
        if (response.status === 404 && !url.pathname.match(/\.[a-zA-Z0-9]+$/)) {
            const indexUrl = new URL(url); indexUrl.pathname = '/index.html';
            response = await env.ASSETS.fetch(new Request(indexUrl.toString(), { method: request.method, headers: request.headers }));
        }
        return response;
    },
};

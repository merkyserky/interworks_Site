/**
 * Cloudflare Worker - Multi-subdomain Router with Panel Authentication & Games API
 * Supports notifications with countdowns, multiple genres, and dynamic content
 */

export interface Env {
    ASSETS: { fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> };
    PANEL_AUTH: KVNamespace;
    GAMES_DATABASE: KVNamespace;
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
}

interface Studio {
    id: string;
    name: string;
    logo?: string;
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

// Default data
const DEFAULT_STUDIOS: Studio[] = [
    { id: 'interworks', name: 'Interworks Inc', discord: 'https://discord.gg/C2wGG8KHRr', roblox: 'https://www.roblox.com/communities/34862200/Interworks-Inc#!/' },
    { id: 'astral-core', name: 'Astral Core', logo: '/studios/astral_Core.png', discord: 'https://discord.gg/5nJgPbdTpy', roblox: 'https://www.roblox.com/communities/13408947/Astral-Core-Games#!/', youtube: 'https://www.youtube.com/@plasmix2' },
    { id: 'gub-studs', name: 'Gub Studs' },
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
    '/studios/astral_Core.png', '/favicon.svg',
];

// Session storage
const sessions = new Map<string, { username: string; expires: number; role: string; allowedStudios: string[] }>();

function generateSessionToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

function isValidSession(token: string | null): boolean {
    if (!token) return false;
    const session = sessions.get(token);
    if (!session) return false;
    if (Date.now() > session.expires) { sessions.delete(token); return false; }
    return true;
}

function getSessionToken(request: Request): string | null {
    const cookie = request.headers.get('cookie');
    if (!cookie) return null;
    const match = cookie.match(/panel_session=([^;]+)/);
    return match ? match[1] : null;
}

function getSessionUser(request: Request) {
    const token = getSessionToken(request);
    return token ? sessions.get(token) : null;
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
	<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="robots" content="noindex, nofollow"><title>Login | AstralCore Panel</title>
	<script src="https://cdn.tailwindcss.com"></script>
	<style>
		@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
		body { font-family: 'Inter', sans-serif; }
		.glass { background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); }
		.glow { box-shadow: 0 0 60px rgba(124,58,237,0.3); }
		.input-glow:focus { box-shadow: 0 0 0 2px rgba(124,58,237,0.5); }
		@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
		.float { animation: float 6s ease-in-out infinite; }
	</style>
</head>
<body class="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
	<div class="fixed inset-0 overflow-hidden pointer-events-none">
		<div class="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl"></div>
		<div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl"></div>
	</div>
	<div class="relative z-10 w-full max-w-md float">
		<div class="glass rounded-3xl p-8 glow">
			<div class="text-center mb-8"><p class="text-gray-400 text-sm">Sign in to access the dashboard</p></div>
			${error ? `<div class="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"><p class="text-red-400 text-sm text-center">${error}</p></div>` : ''}
			<form method="POST" action="/api/login" class="space-y-5">
				<div><label class="block text-sm font-medium text-gray-300 mb-2">Username</label><input type="text" name="username" required class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none input-glow" placeholder="Username"></div>
				<div><label class="block text-sm font-medium text-gray-300 mb-2">Password</label><input type="password" name="password" required class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none input-glow" placeholder="Password"></div>
				<button type="submit" class="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform">Sign In</button>
			</form>
		</div>
	</div>
</body></html>`;
}

// Helper to migrate old genre string to array
function migrateGame(game: any): Game {
    if (typeof game.genre === 'string') {
        game.genres = game.genre.split(',').map((g: string) => g.trim()).filter(Boolean);
        delete game.genre;
    }
    if (!game.genres) game.genres = [];
    return game as Game;
}

// Helper to check user permission for a studio
function hasStudioPermission(user: { role: string; allowedStudios: string[] }, studioName: string): boolean {
    if (user.role === 'admin') return true;
    if (user.allowedStudios.includes('*')) return true;
    return user.allowedStudios.includes(studioName);
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
            const currentUser = sessionToken ? sessions.get(sessionToken) : null;

            // Login
            if (pathname === '/api/login' && request.method === 'POST') {
                const formData = await request.formData();
                const username = formData.get('username')?.toString() || '';
                const password = formData.get('password')?.toString() || '';

                // Check against users DB first
                let users = await env.GAMES_DATABASE.get('users', 'json') as User[] | null;
                if (!users) {
                    // Init default users if DB is empty
                    await env.GAMES_DATABASE.put('users', JSON.stringify(DEFAULT_USERS));
                    users = DEFAULT_USERS;
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
                    const token = generateSessionToken();
                    // Store minimal user info in session
                    const role = (user?.role) || 'user'; // Default to user if not in DB (shouldn't happen if we seed)
                    const allowedStudios = (user?.allowedStudios) || [];
                    sessions.set(token, { username, expires: Date.now() + 86400000, role, allowedStudios });
                    return new Response(null, { status: 302, headers: { 'Location': '/', 'Set-Cookie': `panel_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400` } });
                }
                return new Response(getLoginPageHTML('Invalid credentials'), { status: 401, headers: { 'Content-Type': 'text/html' } });
            }

            // Logout
            if (pathname === '/api/logout') {
                if (sessionToken) sessions.delete(sessionToken);
                return new Response(null, { status: 302, headers: { 'Location': '/', 'Set-Cookie': 'panel_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0' } });
            }

            // Assets
            if (pathname.startsWith('/assets/')) return env.ASSETS.fetch(request);

            // API routes (require auth)
            if (pathname.startsWith('/api/')) {
                if (!isValidSession(sessionToken) || !currentUser) return jsonResponse({ error: 'Unauthorized' }, 401);

                // Session/User Info
                if (pathname === '/api/me' && request.method === 'GET') {
                    return jsonResponse({
                        username: currentUser.username,
                        role: currentUser.role,
                        allowedStudios: currentUser.allowedStudios
                    });
                }

                // Users Management (Admin only)
                if (pathname.startsWith('/api/users')) {
                    if (currentUser.role !== 'admin') return jsonResponse({ error: 'Forbidden' }, 403);

                    if (pathname === '/api/users' && request.method === 'GET') {
                        let users = await env.GAMES_DATABASE.get('users', 'json') as User[] | null;
                        if (!users) users = DEFAULT_USERS;
                        // Don't return passwords
                        return jsonResponse(users.map(u => ({ ...u, password: undefined })));
                    }
                    if (pathname === '/api/users' && request.method === 'POST') {
                        let users = await env.GAMES_DATABASE.get('users', 'json') as User[] | null || [...DEFAULT_USERS];
                        const newUser = await request.json() as User;
                        if (users.find(u => u.username === newUser.username)) return jsonResponse({ error: 'User already exists' }, 400);
                        users.push(newUser);
                        await env.GAMES_DATABASE.put('users', JSON.stringify(users));
                        // Also set password in legacy KV for compatibility if needed, but primarily use DB
                        // Actually, let's just stick to the JSON DB for new users.
                        return jsonResponse({ ...newUser, password: undefined }, 201);
                    }
                    const userMatch = pathname.match(/^\/api\/users\/([^/]+)$/);
                    if (userMatch && request.method === 'PUT') {
                        let users = await env.GAMES_DATABASE.get('users', 'json') as User[] | null || [...DEFAULT_USERS];
                        const idx = users.findIndex(u => u.username === userMatch[1]);
                        if (idx === -1) return jsonResponse({ error: 'Not found' }, 404);
                        const updates = await request.json() as Partial<User>;
                        // Don't allow changing username easily as it's the ID
                        users[idx] = { ...users[idx], ...updates, username: userMatch[1] };
                        await env.GAMES_DATABASE.put('users', JSON.stringify(users));
                        return jsonResponse({ ...users[idx], password: undefined });
                    }
                    if (userMatch && request.method === 'DELETE') {
                        if (userMatch[1] === currentUser.username) return jsonResponse({ error: 'Cannot delete yourself' }, 400);
                        let users = await env.GAMES_DATABASE.get('users', 'json') as User[] | null || [...DEFAULT_USERS];
                        users = users.filter(u => u.username !== userMatch[1]);
                        await env.GAMES_DATABASE.put('users', JSON.stringify(users));
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
                    return jsonResponse(newGame, 201);
                }
                if (gameMatch && request.method === 'DELETE') {
                    let games = (await env.GAMES_DATABASE.get('games', 'json') as any[] || [...DEFAULT_GAMES]).map(migrateGame);

                    // Permission check
                    const game = games.find(g => g.id === gameMatch[1]);
                    if (game && !hasStudioPermission(currentUser, game.ownedBy)) return jsonResponse({ error: 'Forbidden' }, 403);

                    games = games.filter(g => g.id !== gameMatch[1]);
                    await env.GAMES_DATABASE.put('games', JSON.stringify(games));
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

                    notifications = notifications.filter(n => n.id !== notifMatch[1]);
                    await env.GAMES_DATABASE.put('notifications', JSON.stringify(notifications));
                    return jsonResponse({ success: true });
                }

                // Studios
                if (pathname === '/api/studios' && request.method === 'GET') {
                    let studios = await env.GAMES_DATABASE.get('studios', 'json') as Studio[] | null;
                    if (!studios) { await env.GAMES_DATABASE.put('studios', JSON.stringify(DEFAULT_STUDIOS)); studios = DEFAULT_STUDIOS; }
                    return jsonResponse(studios);
                }

                // Media
                if (pathname === '/api/media') return jsonResponse(MEDIA_FILES);

                return jsonResponse({ error: 'Not found' }, 404);
            }

            // Panel pages (require auth)
            if (!isValidSession(sessionToken)) return new Response(getLoginPageHTML(), { headers: { 'Content-Type': 'text/html' } });

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

        // Serve static files
        let response = await env.ASSETS.fetch(request);
        if (response.status === 404 && !url.pathname.match(/\.[a-zA-Z0-9]+$/)) {
            const indexUrl = new URL(url); indexUrl.pathname = '/index.html';
            response = await env.ASSETS.fetch(new Request(indexUrl.toString(), { method: request.method, headers: request.headers }));
        }
        return response;
    },
};

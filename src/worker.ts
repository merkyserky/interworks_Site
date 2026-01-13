/**
 * Cloudflare Worker - Multi-subdomain Router with Panel Authentication
 * Routes requests to either the main site or panel based on hostname
 * Panel requires login - credentials stored in KV (editable via Cloudflare Dashboard)
 */

export interface Env {
    ASSETS: { fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> };
    PANEL_AUTH: KVNamespace;
}

// Session storage (in-memory for simplicity - resets on worker restart)
const sessions = new Map<string, { username: string; expires: number }>();

// Generate a random session token
function generateSessionToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Check if session is valid
function isValidSession(token: string | null): boolean {
    if (!token) return false;
    const session = sessions.get(token);
    if (!session) return false;
    if (Date.now() > session.expires) {
        sessions.delete(token);
        return false;
    }
    return true;
}

// Get session token from cookie
function getSessionToken(request: Request): string | null {
    const cookie = request.headers.get('cookie');
    if (!cookie) return null;
    const match = cookie.match(/panel_session=([^;]+)/);
    return match ? match[1] : null;
}

// Login page HTML
function getLoginPageHTML(error?: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="robots" content="noindex, nofollow">
	<title>Login | AstralCore Panel</title>
	<script src="https://cdn.tailwindcss.com"></script>
	<style>
		@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
		body { font-family: 'Inter', sans-serif; }
		.glass {
			background: rgba(255, 255, 255, 0.05);
			backdrop-filter: blur(20px);
			-webkit-backdrop-filter: blur(20px);
			border: 1px solid rgba(255, 255, 255, 0.1);
		}
		.glow {
			box-shadow: 0 0 60px rgba(124, 58, 237, 0.3);
		}
		.input-glow:focus {
			box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.5);
		}
		@keyframes float {
			0%, 100% { transform: translateY(0px); }
			50% { transform: translateY(-10px); }
		}
		.float { animation: float 6s ease-in-out infinite; }
		@keyframes pulse-slow {
			0%, 100% { opacity: 0.4; }
			50% { opacity: 0.6; }
		}
		.pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
	</style>
</head>
<body class="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 overflow-hidden">
	<!-- Animated background -->
	<div class="fixed inset-0 overflow-hidden pointer-events-none">
		<div class="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pulse-slow"></div>
		<div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pulse-slow" style="animation-delay: 2s;"></div>
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl"></div>
	</div>
	
	<!-- Login Card -->
	<div class="relative z-10 w-full max-w-md float">
		<div class="glass rounded-3xl p-8 glow">
			<!-- Logo/Header -->
			<div class="text-center mb-8">
				<p class="text-gray-400 text-sm">Sign in to access the dashboard</p>
			</div>
			
			${error ? `
			<div class="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
				<p class="text-red-400 text-sm text-center">${error}</p>
			</div>
			` : ''}
			
			<!-- Login Form -->
			<form method="POST" action="/api/login" class="space-y-5">
				<div>
					<label class="block text-sm font-medium text-gray-300 mb-2">Username</label>
					<input 
						type="text" 
						name="username" 
						required
						autocomplete="username"
						class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none input-glow transition-all duration-200"
						placeholder="Enter your username"
					>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-300 mb-2">Password</label>
					<input 
						type="password" 
						name="password" 
						required
						autocomplete="current-password"
						class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none input-glow transition-all duration-200"
						placeholder="Enter your password"
					>
				</div>
				
				<button 
					type="submit"
					class="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-500/30"
				>
					Sign In
				</button>
			</form>
		</div>
	</div>
</body>
</html>`;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const hostname = request.headers.get('host') || url.hostname;
        const isPanelSubdomain = hostname.startsWith('panel.');

        if (isPanelSubdomain) {
            const pathname = url.pathname;
            const sessionToken = getSessionToken(request);

            // Handle login POST
            if (pathname === '/api/login' && request.method === 'POST') {
                const formData = await request.formData();
                const username = formData.get('username')?.toString() || '';
                const password = formData.get('password')?.toString() || '';

                // Check credentials from KV
                const storedPassword = await env.PANEL_AUTH.get(`user:${username}`);

                if (storedPassword && storedPassword === password) {
                    // Create session
                    const token = generateSessionToken();
                    sessions.set(token, {
                        username,
                        expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
                    });

                    return new Response(null, {
                        status: 302,
                        headers: {
                            'Location': '/',
                            'Set-Cookie': `panel_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
                        }
                    });
                }

                // Invalid credentials
                return new Response(getLoginPageHTML('Invalid username or password'), {
                    status: 401,
                    headers: { 'Content-Type': 'text/html' }
                });
            }

            // Handle logout
            if (pathname === '/api/logout') {
                if (sessionToken) {
                    sessions.delete(sessionToken);
                }
                return new Response(null, {
                    status: 302,
                    headers: {
                        'Location': '/',
                        'Set-Cookie': 'panel_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
                    }
                });
            }

            // Assets don't require auth
            if (pathname.startsWith('/assets/')) {
                return env.ASSETS.fetch(request);
            }

            // Check if user is authenticated for all other panel routes
            if (!isValidSession(sessionToken)) {
                // Show login page
                return new Response(getLoginPageHTML(), {
                    status: 200,
                    headers: { 'Content-Type': 'text/html' }
                });
            }

            // User is authenticated - serve panel content
            if (pathname === '/' || !pathname.match(/\.[a-zA-Z0-9]+$/)) {
                const panelIndexUrl = new URL(url);
                panelIndexUrl.pathname = '/panel/index.html';
                const panelRequest = new Request(panelIndexUrl.toString(), {
                    method: request.method,
                    headers: request.headers,
                });
                return env.ASSETS.fetch(panelRequest);
            }

            // Try to serve from /panel/ directory
            const panelUrl = new URL(url);
            panelUrl.pathname = '/panel' + pathname;
            const panelRequest = new Request(panelUrl.toString(), {
                method: request.method,
                headers: request.headers,
            });
            let response = await env.ASSETS.fetch(panelRequest);

            if (response.status === 404) {
                response = await env.ASSETS.fetch(request);
            }

            return response;
        }

        // Main site: serve from root
        let response = await env.ASSETS.fetch(request);

        if (response.status === 404 && !url.pathname.match(/\.[a-zA-Z0-9]+$/)) {
            const indexUrl = new URL(url);
            indexUrl.pathname = '/index.html';
            const indexRequest = new Request(indexUrl.toString(), {
                method: request.method,
                headers: request.headers,
            });
            response = await env.ASSETS.fetch(indexRequest);
        }

        return response;
    },
};

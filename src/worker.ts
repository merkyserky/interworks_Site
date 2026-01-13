/**
 * Cloudflare Worker - Multi-subdomain Router
 * Routes requests to either the main site or panel based on hostname
 */

export interface Env {
    ASSETS: { fetch: typeof fetch };
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        // Use Host header for accurate hostname detection (works in production)
        const hostname = request.headers.get('host') || url.hostname;

        // Check if this is the panel subdomain
        const isPanelSubdomain = hostname.startsWith('panel.');

        if (isPanelSubdomain) {
            // For panel subdomain:
            // - Root path "/" -> serve /panel/index.html
            // - Other paths without extension -> serve /panel/index.html (SPA)
            // - Asset paths (/assets/*) -> serve directly from root (shared assets)
            // - Panel-specific paths -> try /panel prefix first

            const pathname = url.pathname;

            // Assets are at the root level, serve them directly
            if (pathname.startsWith('/assets/')) {
                return env.ASSETS.fetch(request);
            }

            // For root or paths without file extension, serve panel's index.html
            if (pathname === '/' || !pathname.match(/\.[a-zA-Z0-9]+$/)) {
                const panelIndexUrl = new URL(request.url);
                panelIndexUrl.pathname = '/panel/index.html';
                return env.ASSETS.fetch(panelIndexUrl);
            }

            // Try to serve from /panel/ directory first
            const panelUrl = new URL(request.url);
            panelUrl.pathname = '/panel' + pathname;
            let response = await env.ASSETS.fetch(panelUrl);

            // If not found in /panel/, try root
            if (response.status === 404) {
                response = await env.ASSETS.fetch(request);
            }

            return response;
        }

        // Main site: serve from root
        let response = await env.ASSETS.fetch(request);

        // SPA fallback for main site
        if (response.status === 404 && !url.pathname.match(/\.[a-zA-Z0-9]+$/)) {
            const indexUrl = new URL(request.url);
            indexUrl.pathname = '/index.html';
            response = await env.ASSETS.fetch(indexUrl);
        }

        return response;
    },
};

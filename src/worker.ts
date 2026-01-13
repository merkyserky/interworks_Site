/**
 * Cloudflare Worker - Multi-subdomain Router
 * Routes requests to either the main site or panel based on hostname
 */

export interface Env {
    ASSETS: { fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> };
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        // Use Host header for accurate hostname detection (works in production)
        const hostname = request.headers.get('host') || url.hostname;

        // Check if this is the panel subdomain
        const isPanelSubdomain = hostname.startsWith('panel.');

        if (isPanelSubdomain) {
            // For panel subdomain, serve from /panel/ directory
            const pathname = url.pathname;

            // Assets are at the root level, serve them directly
            if (pathname.startsWith('/assets/')) {
                return env.ASSETS.fetch(request);
            }

            // For root or paths without file extension, serve panel's index.html
            if (pathname === '/' || !pathname.match(/\.[a-zA-Z0-9]+$/)) {
                // Create a new URL pointing to the panel index
                const panelIndexUrl = new URL(url);
                panelIndexUrl.pathname = '/panel/index.html';

                // Create a new request with the modified URL
                const panelRequest = new Request(panelIndexUrl.toString(), {
                    method: request.method,
                    headers: request.headers,
                });

                return env.ASSETS.fetch(panelRequest);
            }

            // Try to serve from /panel/ directory first
            const panelUrl = new URL(url);
            panelUrl.pathname = '/panel' + pathname;

            const panelRequest = new Request(panelUrl.toString(), {
                method: request.method,
                headers: request.headers,
            });

            let response = await env.ASSETS.fetch(panelRequest);

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

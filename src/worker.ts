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
        const hostname = url.hostname;

        // Check if this is the panel subdomain
        const isPanelSubdomain = hostname.startsWith('panel.');

        if (isPanelSubdomain) {
            // Rewrite the path to serve from /panel directory
            const panelUrl = new URL(request.url);

            // If root or doesn't start with /panel, prepend /panel
            if (panelUrl.pathname === '/' || !panelUrl.pathname.startsWith('/panel')) {
                panelUrl.pathname = '/panel' + panelUrl.pathname;
            }

            // Try to fetch the asset
            let response = await env.ASSETS.fetch(panelUrl);

            // If 404 and it's not a file request (no extension), serve panel's index.html for SPA routing
            if (response.status === 404 && !panelUrl.pathname.match(/\.[a-zA-Z0-9]+$/)) {
                panelUrl.pathname = '/panel/index.html';
                response = await env.ASSETS.fetch(panelUrl);
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

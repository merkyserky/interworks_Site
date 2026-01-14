/**
 * Cookie Consent Banner Component
 * GDPR-compliant cookie consent with smooth animations
 */

const COOKIE_KEY = 'cookie-consent';

export function createCookieConsent(): HTMLElement {
    const banner = document.createElement('div');
    banner.id = 'cookie-consent';

    // Check if already accepted
    if (localStorage.getItem(COOKIE_KEY) === 'accepted') {
        banner.style.display = 'none';
        return banner;
    }

    banner.className = 'fixed bottom-0 left-0 right-0 z-[999] p-4 md:p-6 bg-black/95 backdrop-blur-xl border-t border-white/10 transform translate-y-full animate-slide-up';
    banner.innerHTML = `
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="flex-1 text-center md:text-left">
                <h3 class="text-lg font-bold text-white mb-1">🍪 Cookie Notice</h3>
                <p class="text-sm text-gray-400">
                    We use cookies to enhance your browsing experience and analyze site traffic. 
                    By clicking "Accept", you consent to our use of cookies.
                </p>
            </div>
            <div class="flex items-center gap-3 shrink-0">
                <button id="cookie-decline" class="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                    Decline
                </button>
                <button id="cookie-accept" class="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-violet-900/30 hover:shadow-violet-900/50 hover:scale-105">
                    Accept All
                </button>
            </div>
        </div>
    `;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        #cookie-consent.animate-slide-up {
            animation: slide-up 0.5s ease-out 0.5s forwards;
        }
        @keyframes slide-down {
            from { transform: translateY(0); }
            to { transform: translateY(100%); }
        }
        #cookie-consent.animate-slide-down {
            animation: slide-down 0.3s ease-in forwards;
        }
    `;
    document.head.appendChild(style);

    // Event handlers
    setTimeout(() => {
        const acceptBtn = document.getElementById('cookie-accept');
        const declineBtn = document.getElementById('cookie-decline');

        acceptBtn?.addEventListener('click', () => {
            localStorage.setItem(COOKIE_KEY, 'accepted');
            banner.classList.remove('animate-slide-up');
            banner.classList.add('animate-slide-down');
            setTimeout(() => banner.remove(), 300);
        });

        declineBtn?.addEventListener('click', () => {
            localStorage.setItem(COOKIE_KEY, 'declined');
            banner.classList.remove('animate-slide-up');
            banner.classList.add('animate-slide-down');
            setTimeout(() => banner.remove(), 300);
        });
    }, 100);

    return banner;
}

/**
 * Loading Skeleton Component
 * Animated placeholder while content loads
 */
export function createLoadingSkeleton(): HTMLElement {
    const skeleton = document.createElement('div');
    skeleton.id = 'loading-skeleton';
    skeleton.className = 'fixed inset-0 z-[1000] bg-[#0a0a0a] flex items-center justify-center transition-opacity duration-500';

    skeleton.innerHTML = `
        <div class="text-center">
            <div class="relative mb-8">
                <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 animate-pulse mx-auto"></div>
                <div class="absolute inset-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 animate-ping opacity-20 mx-auto"></div>
            </div>
            <div class="space-y-3 mb-8">
                <div class="h-2 w-48 bg-white/10 rounded-full mx-auto animate-pulse"></div>
                <div class="h-2 w-32 bg-white/5 rounded-full mx-auto animate-pulse" style="animation-delay: 0.1s"></div>
            </div>
            <p class="text-sm text-gray-500 animate-pulse">Loading experience...</p>
        </div>
    `;

    return skeleton;
}

export function hideLoadingSkeleton(): void {
    const skeleton = document.getElementById('loading-skeleton');
    if (skeleton) {
        skeleton.style.opacity = '0';
        setTimeout(() => skeleton.remove(), 500);
    }
}

/**
 * Game Card Skeleton for lazy loading
 */
export function createGameCardSkeleton(): HTMLElement {
    const skeleton = document.createElement('div');
    skeleton.className = 'bg-white/5 rounded-3xl overflow-hidden animate-pulse';

    skeleton.innerHTML = `
        <div class="aspect-video bg-white/5"></div>
        <div class="p-6 space-y-4">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-white/5"></div>
                <div class="flex-1 space-y-2">
                    <div class="h-4 bg-white/10 rounded w-3/4"></div>
                    <div class="h-3 bg-white/5 rounded w-1/2"></div>
                </div>
            </div>
            <div class="space-y-2">
                <div class="h-3 bg-white/5 rounded"></div>
                <div class="h-3 bg-white/5 rounded w-5/6"></div>
            </div>
            <div class="flex gap-2">
                <div class="h-6 w-16 bg-white/5 rounded"></div>
                <div class="h-6 w-16 bg-white/5 rounded"></div>
            </div>
        </div>
    `;

    return skeleton;
}

/**
 * Share Buttons Component
 * Social sharing for games
 */
export function createShareButtons(game: { name: string; link?: string; description?: string }): HTMLElement {
    const container = document.createElement('div');
    container.className = 'flex items-center gap-2';

    const url = game.link || window.location.href;
    const text = `Check out ${game.name}! ${game.description || ''}`.slice(0, 200);

    const shareLinks = [
        {
            name: 'Twitter',
            icon: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            color: 'bg-black hover:bg-zinc-800'
        },
        {
            name: 'Discord',
            icon: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037 13.486 13.486 0 00-.594 1.226c-2.176-.328-4.352-.328-6.505 0a13.482 13.482 0 00-.602-1.226.075.075 0 00-.079-.037A19.736 19.736 0 002.66 4.37a.072.072 0 00-.03.047C.612 10.976 1.765 17.58 4.295 21.054a.077.077 0 00.088.026 19.988 19.988 0 006.014-3.03.076.076 0 00.038-.052z"/></svg>`,
            url: '#', // Discord doesn't have direct share
            color: 'bg-[#5865F2] hover:bg-[#4752C4]',
            copyText: true
        },
        {
            name: 'Copy Link',
            icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`,
            url: '#',
            color: 'bg-white/10 hover:bg-white/20',
            copy: true
        }
    ];

    container.innerHTML = `
        <span class="text-xs text-gray-500 mr-1">Share:</span>
        ${shareLinks.map(link => `
            <button 
                class="p-2 ${link.color} rounded-lg transition-all hover:scale-110 text-white" 
                title="Share on ${link.name}"
                data-share="${link.name.toLowerCase()}"
                data-url="${link.url}"
                ${link.copy ? 'data-copy="true"' : ''}
            >
                ${link.icon}
            </button>
        `).join('')}
    `;

    // Add click handlers
    setTimeout(() => {
        container.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const shareUrl = btn.getAttribute('data-url');
                const isCopy = btn.getAttribute('data-copy');

                if (isCopy) {
                    navigator.clipboard.writeText(url);
                    btn.innerHTML = `<svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
                    setTimeout(() => {
                        btn.innerHTML = shareLinks.find(l => l.name === 'Copy Link')?.icon || '';
                    }, 2000);
                } else if (shareUrl && shareUrl !== '#') {
                    window.open(shareUrl, '_blank', 'width=600,height=400');
                }
            });
        });
    }, 100);

    return container;
}

/**
 * Lazy Loading Image Component
 */
export function createLazyImage(src: string, alt: string, className: string = ''): HTMLElement {
    const container = document.createElement('div');
    container.className = `relative overflow-hidden ${className}`;

    // Placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 animate-pulse';
    container.appendChild(placeholder);

    // Actual image
    const img = document.createElement('img');
    img.alt = alt;
    img.className = 'w-full h-full object-cover opacity-0 transition-opacity duration-500';
    img.loading = 'lazy';

    // Use Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                img.src = src;
                img.onload = () => {
                    img.classList.remove('opacity-0');
                    placeholder.remove();
                };
                observer.disconnect();
            }
        });
    }, { rootMargin: '100px' });

    container.appendChild(img);
    observer.observe(container);

    return container;
}

/**
 * Add View Transitions API support
 */
export function enableViewTransitions(): void {
    // Add CSS for view transitions
    const style = document.createElement('style');
    style.textContent = `
        @view-transition {
            navigation: auto;
        }
        
        ::view-transition-old(root),
        ::view-transition-new(root) {
            animation-duration: 0.3s;
        }
        
        ::view-transition-old(root) {
            animation-name: fade-out;
        }
        
        ::view-transition-new(root) {
            animation-name: fade-in;
        }
        
        @keyframes fade-out {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.95); }
        }
        
        @keyframes fade-in {
            from { opacity: 0; transform: scale(1.05); }
            to { opacity: 1; transform: scale(1); }
        }
        
        /* Smooth transitions for modals */
        .modal-enter {
            animation: modal-enter 0.3s ease-out;
        }
        
        .modal-exit {
            animation: modal-exit 0.2s ease-in forwards;
        }
        
        @keyframes modal-enter {
            from { opacity: 0; transform: scale(0.9) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        @keyframes modal-exit {
            from { opacity: 1; transform: scale(1) translateY(0); }
            to { opacity: 0; transform: scale(0.9) translateY(20px); }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Smooth scroll with transitions
 */
export function smoothNavigate(targetId: string): void {
    const target = document.getElementById(targetId);
    if (!target) return;

    // Use View Transitions API if supported
    if ('startViewTransition' in document) {
        (document as any).startViewTransition(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

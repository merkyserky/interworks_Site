/**
 * Share Modal Component
 * Beautiful modal for sharing game links with preview
 */

interface ShareModalConfig {
    game: {
        id: string;
        name: string;
        description?: string;
        logo?: string;
        link?: string;
        thumbnails?: readonly string[];
    };
}

let currentShareModal: HTMLElement | null = null;

export function openShareModal(config: ShareModalConfig): void {
    closeShareModal();

    const { game } = config;
    const shareUrl = game.link || window.location.href;
    const shareText = `Check out ${game.name}! ${game.description?.slice(0, 100) || ''}`;
    const thumbnail = game.thumbnails?.[0] || game.logo || '';

    const modal = document.createElement('div');
    modal.id = 'share-modal';
    modal.className = 'fixed inset-0 z-[250] flex items-center justify-center p-4';

    modal.innerHTML = `
        <div class="absolute inset-0 bg-black/80 backdrop-blur-lg" onclick="window.closeShareModal()"></div>
        <div class="relative w-full max-w-md bg-[#0f0f0f] rounded-3xl border border-white/10 shadow-2xl overflow-hidden modal-enter">
            <!-- Header -->
            <div class="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-violet-500/10 to-purple-500/10">
                <h2 class="text-lg font-bold text-white flex items-center gap-2">
                    <svg class="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                    </svg>
                    Share ${game.name}
                </h2>
                <button onclick="window.closeShareModal()" class="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all hover:rotate-90 duration-300">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <!-- Preview Card -->
            <div class="p-6">
                <div class="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">
                    ${thumbnail ? `
                        <div class="aspect-video bg-black/50">
                            <img src="${thumbnail}" alt="${game.name}" class="w-full h-full object-cover">
                        </div>
                    ` : ''}
                    <div class="p-4">
                        <div class="flex items-center gap-3 mb-2">
                            ${game.logo ? `<img src="${game.logo}" alt="${game.name}" class="w-10 h-10 rounded-lg object-contain bg-black/50">` : ''}
                            <div>
                                <h3 class="font-bold text-white">${game.name}</h3>
                                <p class="text-xs text-gray-500">interworksdevs.pages.dev</p>
                            </div>
                        </div>
                        ${game.description ? `<p class="text-sm text-gray-400 line-clamp-2">${game.description}</p>` : ''}
                    </div>
                </div>
                
                <!-- Share Platforms -->
                <div class="grid grid-cols-2 gap-3 mb-6">
                    <button 
                        onclick="window.shareToDiscord('${encodeURIComponent(shareUrl)}', '${encodeURIComponent(game.name)}', '${encodeURIComponent(game.description?.slice(0, 100) || '')}')"
                        class="flex items-center justify-center gap-2 py-3 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-semibold transition-all hover:scale-105"
                    >
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037 13.486 13.486 0 00-.594 1.226c-2.176-.328-4.352-.328-6.505 0a13.482 13.482 0 00-.602-1.226.075.075 0 00-.079-.037A19.736 19.736 0 002.66 4.37a.072.072 0 00-.03.047C.612 10.976 1.765 17.58 4.295 21.054a.077.077 0 00.088.026 19.988 19.988 0 006.014-3.03.076.076 0 00.038-.052z"/>
                        </svg>
                        Discord
                    </button>
                    
                    <button 
                        onclick="window.shareToTwitter('${encodeURIComponent(shareUrl)}', '${encodeURIComponent(shareText)}')"
                        class="flex items-center justify-center gap-2 py-3 px-4 bg-black border border-white/20 hover:bg-zinc-800 text-white rounded-xl font-semibold transition-all hover:scale-105"
                    >
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        X / Twitter
                    </button>
                    
                    <button 
                        onclick="window.shareToReddit('${encodeURIComponent(shareUrl)}', '${encodeURIComponent(game.name)}')"
                        class="flex items-center justify-center gap-2 py-3 px-4 bg-[#FF4500] hover:bg-[#CC3700] text-white rounded-xl font-semibold transition-all hover:scale-105"
                    >
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                        </svg>
                        Reddit
                    </button>
                    
                    <button 
                        onclick="window.copyShareLink('${encodeURIComponent(shareUrl)}')"
                        id="copy-link-btn"
                        class="flex items-center justify-center gap-2 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all hover:scale-105 border border-white/10"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        <span id="copy-btn-text">Copy Link</span>
                    </button>
                </div>
                
                <!-- Link Preview -->
                <div class="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3">
                    <input 
                        type="text" 
                        value="${shareUrl}" 
                        readonly 
                        class="flex-1 bg-transparent text-sm text-gray-400 outline-none truncate"
                    >
                    <button 
                        onclick="window.copyShareLink('${encodeURIComponent(shareUrl)}')"
                        class="shrink-0 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add modal animation styles if not present
    if (!document.getElementById('share-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'share-modal-styles';
        style.textContent = `
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

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    currentShareModal = modal;

    // Track share event
    trackEvent('share', game.id, game.name);

    // Close on Escape
    const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeShareModal();
    };
    document.addEventListener('keydown', handleEscape);
}

export function closeShareModal(): void {
    if (currentShareModal) {
        const content = currentShareModal.querySelector('.modal-enter');
        if (content) {
            content.classList.remove('modal-enter');
            content.classList.add('modal-exit');
        }

        setTimeout(() => {
            currentShareModal?.remove();
            currentShareModal = null;
            document.body.style.overflow = '';
        }, 200);
    }
}

// Analytics tracking helper
function trackEvent(type: 'pageview' | 'game_click' | 'share' | 'play_click', gameId?: string, gameName?: string): void {
    fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, gameId, gameName })
    }).catch(() => { }); // Silently fail
}

// Global share functions
(window as any).closeShareModal = closeShareModal;
(window as any).openShareModal = openShareModal;

(window as any).shareToTwitter = (url: string, text: string) => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
};

(window as any).shareToDiscord = (url: string, title: string, description: string) => {
    // Discord doesn't have a direct share API, so we copy a formatted message
    const message = `**${decodeURIComponent(title)}**\n${decodeURIComponent(description)}\n\n${decodeURIComponent(url)}`;
    navigator.clipboard.writeText(message).then(() => {
        // Show success state
        showCopySuccess('Copied for Discord! Paste in any Discord chat.');
    });
};

(window as any).shareToReddit = (url: string, title: string) => {
    const shareUrl = `https://www.reddit.com/submit?url=${url}&title=${title}`;
    window.open(shareUrl, '_blank', 'width=800,height=600');
};

(window as any).copyShareLink = (url: string) => {
    navigator.clipboard.writeText(decodeURIComponent(url)).then(() => {
        showCopySuccess('Link copied!');
    });
};

function showCopySuccess(message: string): void {
    const btn = document.getElementById('copy-link-btn');
    const btnText = document.getElementById('copy-btn-text');
    if (btn && btnText) {
        const originalText = btnText.textContent;
        btnText.textContent = message;
        btn.classList.add('bg-emerald-500/20', 'border-emerald-500/30');
        btn.classList.remove('bg-white/10', 'border-white/10');

        setTimeout(() => {
            btnText.textContent = originalText;
            btn.classList.remove('bg-emerald-500/20', 'border-emerald-500/30');
            btn.classList.add('bg-white/10', 'border-white/10');
        }, 2000);
    }
}

// Export tracking function for use elsewhere
export { trackEvent };

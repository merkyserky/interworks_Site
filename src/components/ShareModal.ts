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

// Generate a URL-friendly slug from game name or ID
function generateGameSlug(game: { id: string; name: string }): string {
    // Prefer name-based slug for readability
    const slug = game.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    return slug || game.id;
}

export function openShareModal(config: ShareModalConfig): void {
    closeShareModal();

    const { game } = config;

    // Generate a shareable URL that will show rich Discord embed
    const baseUrl = window.location.origin;
    const gameSlug = generateGameSlug(game);
    const shareUrl = `${baseUrl}/${gameSlug}`; // e.g., https://astralcore.ca/unseen-floors

    const shareText = `Check out ${game.name}! ${game.description?.slice(0, 100) || ''}`;
    const thumbnail = game.thumbnails?.[0] || game.logo || '';


    const modal = document.createElement('div');
    modal.id = 'share-modal';
    modal.className = 'fixed inset-0 z-[250] flex items-center justify-center p-4';

    modal.innerHTML = `
        <div class="absolute inset-0 bg-black/80 backdrop-blur-xl" onclick="window.closeShareModal()"></div>
        <div class="relative w-full max-w-lg bg-[#0f0f0f]/90 rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden modal-enter ring-1 ring-white/5 mx-4">
            
            <!-- Modern Header -->
            <div class="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
                <div class="flex flex-col">
                    <h2 class="text-xl font-black text-white tracking-tight">Share Game</h2>
                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">Spread the word</p>
                </div>
                <button onclick="window.closeShareModal()" class="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all hover:rotate-90">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            
            <!-- Content -->
            <div class="p-8">
                <!-- Game Card Preview -->
                <div class="relative overflow-hidden rounded-2xl border border-white/10 bg-black/50 mb-8 group">
                    <!-- Background with Blur -->
                    <div class="absolute inset-0 bg-cover bg-center opacity-30 blur-xl scale-125" style="background-image: url('${thumbnail || '/placeholder_hero.png'}')"></div>
                    
                    <div class="relative z-10 p-5 flex items-center gap-5">
                        <div class="w-20 h-20 shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-black">
                            ${thumbnail ? `<img src="${thumbnail}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center bg-violet-600 font-bold text-2xl">${game.name[0]}</div>`}
                        </div>
                        <div class="min-w-0">
                            <h3 class="font-black text-white text-2xl leading-none mb-2 truncate">${game.name}</h3>
                            <p class="text-xs font-medium text-violet-300 mb-1 flex items-center gap-1.5">
                                <span class="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
                                ${window.location.hostname}/${gameSlug}
                            </p>
                            <p class="text-xs text-gray-400 line-clamp-1">${game.description || 'Check out this game!'}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Share Grid -->
                <div class="grid grid-cols-2 gap-4 mb-8">
                    <button 
                         onclick="window.shareToDiscord('${encodeURIComponent(shareUrl)}', '${encodeURIComponent(game.name)}', '')"
                         class="col-span-2 group relative flex items-center justify-center gap-3 py-4 px-6 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-2xl font-bold text-lg transition-all hover:translate-y-[-2px] shadow-lg shadow-[#5865F2]/20 hover:shadow-[#5865F2]/40"
                    >
                        <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037 13.486 13.486 0 00-.594 1.226c-2.176-.328-4.352-.328-6.505 0a13.482 13.482 0 00-.602-1.226.075.075 0 00-.079-.037A19.736 19.736 0 002.66 4.37a.072.072 0 00-.03.047C.612 10.976 1.765 17.58 4.295 21.054a.077.077 0 00.088.026 19.988 19.988 0 006.014-3.03.076.076 0 00.038-.052 14.167 14.167 0 01-2.261-1.077.073.073 0 01.002-.122 10.02 10.02 0 00.916-.445.075.075 0 01.078.006 14.28 14.28 0 004.977 1.018 14.285 14.285 0 004.982-1.018.075.075 0 01.078-.006 10.063 10.063 0 00.911.445.074.074 0 01.003.122 14.074 14.074 0 01-2.266 1.077.075.075 0 00.037.052 19.967 19.967 0 006.02 3.03.078.078 0 00.087-.026c2.617-3.593 3.738-10.292 1.638-16.637a.072.072 0 00-.03-.047z"/></svg>
                        <span>Share on Discord</span>
                        <div class="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white animate-ping opacity-50"></div>
                    </button>
                    
                    <button onclick="window.shareToTwitter('${encodeURIComponent(shareUrl)}', '${encodeURIComponent(shareText)}')" class="flex flex-col items-center justify-center p-4 bg-black border border-white/10 hover:border-white/30 rounded-2xl hover:bg-zinc-900 transition-all group">
                         <svg class="w-6 h-6 text-white mb-2 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                         <span class="text-sm font-semibold text-gray-300 group-hover:text-white">X / Twitter</span>
                    </button>
                    
                     <button onclick="window.shareToReddit('${encodeURIComponent(shareUrl)}', '${encodeURIComponent(game.name)}')" class="flex flex-col items-center justify-center p-4 bg-[#FF4500]/10 border border-[#FF4500]/20 hover:bg-[#FF4500] hover:border-[#FF4500] rounded-2xl transition-all group">
                         <svg class="w-6 h-6 text-[#FF4500] group-hover:text-white mb-2 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                         <span class="text-sm font-semibold text-[#FF4500] group-hover:text-white">Reddit</span>
                    </button>
                    
                </div>
                
                <!-- Quick Copy Link -->
                <div class="relative group">
                    <div class="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl opacity-30 group-hover:opacity-75 transition duration-500 blur"></div>
                    <div class="relative flex items-center bg-black rounded-xl p-1.5 border border-white/10">
                         <div class="flex-1 px-4 py-2 font-mono text-sm text-gray-400 select-all truncate">${shareUrl}</div>
                         <button 
                            id="copy-link-btn"
                            onclick="window.copyShareLink('${encodeURIComponent(shareUrl)}')"
                            class="px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-lg font-bold text-sm transition-all flex items-center gap-2"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                            <span id="copy-btn-text">Copy</span>
                        </button>
                    </div>
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

(window as any).shareToDiscord = (url: string, _title: string, _description: string) => {
    // Just copy the URL - Discord will automatically generate a rich embed from the OG meta tags
    navigator.clipboard.writeText(decodeURIComponent(url)).then(() => {
        showCopySuccess('Link copied! Paste in Discord for a rich embed preview.');
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
            if (btn && btnText) {
                btnText.textContent = originalText;
                // Revert to original styling
                btn.className = "px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-lg font-bold text-sm transition-all flex items-center gap-2";
            }
        }, 2000);
    }
}

// Export tracking function for use elsewhere
export { trackEvent };

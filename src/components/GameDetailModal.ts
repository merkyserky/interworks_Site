/**
 * Game Detail Modal Component
 * Full-featured modal for viewing game details
 */

import { createShareButtons } from './SiteEnhancements'

interface SpotifyAlbum { name: string; spotifyId: string; }
type EventIcon = 'rocket' | 'star' | 'calendar' | 'clock' | 'gift' | 'fire' | 'sparkles' | 'trophy';

interface GameEvent {
    id: string;
    type: 'countdown' | 'event' | 'announcement';
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    color: string;
    icon?: EventIcon;
    showOnCard?: boolean;
    showOnHero?: boolean;
    showCountdown?: boolean;
    active: boolean;
    priority?: number;
}

interface GameDetail {
    id: string;
    name: string;
    logo: string;
    description?: string;
    ownedBy?: string;
    ownedByUrl?: string;
    link?: string;
    youtubeVideoId?: string;
    thumbnails?: readonly string[];
    spotifyAlbums?: readonly SpotifyAlbum[];
    status?: 'coming-soon' | 'playable' | 'beta' | 'in-development';
    genres?: readonly string[];
    events?: readonly GameEvent[];
}

let currentModal: HTMLElement | null = null;

function getStatusBadge(status: string): string {
    const statusMap: Record<string, { color: string; text: string }> = {
        'playable': { color: 'bg-green-500 text-black', text: 'PLAYABLE' },
        'coming-soon': { color: 'bg-yellow-500 text-black', text: 'COMING SOON' },
        'beta': { color: 'bg-blue-500 text-white', text: 'BETA' },
        'in-development': { color: 'bg-purple-500 text-white', text: 'IN DEV' }
    };
    const s = statusMap[status] || { color: 'bg-white/20 text-white', text: status.toUpperCase() };
    return `<span class="px-3 py-1.5 rounded-lg text-xs font-black tracking-wider ${s.color}">${s.text}</span>`;
}

function getCountdown(targetDate: string): { days: number; hours: number; minutes: number; seconds: number; isPast: boolean } {
    const target = new Date(targetDate).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        isPast: false
    };
}

export function openGameDetailModal(game: GameDetail): void {
    closeGameDetailModal(); // Close any existing modal

    const modal = document.createElement('div');
    modal.id = 'game-detail-modal';
    modal.className = 'fixed inset-0 z-[200] flex items-center justify-center p-4';

    // Get active events with countdowns
    const activeEvents = (game.events || []).filter(e =>
        e.active && e.type === 'countdown' && e.startDate && new Date(e.startDate).getTime() > Date.now()
    );

    modal.innerHTML = `
        <div class="absolute inset-0 bg-black/80 backdrop-blur-lg" onclick="window.closeGameDetail()"></div>
        <div class="relative w-full max-w-4xl max-h-[90vh] bg-[#0f0f0f] rounded-3xl border border-white/10 shadow-2xl overflow-hidden modal-enter">
            <!-- Header with thumbnail -->
            <div class="relative h-64 md:h-80 overflow-hidden">
                ${game.thumbnails && game.thumbnails.length > 0
            ? `<img src="${game.thumbnails[0]}" alt="${game.name}" class="w-full h-full object-cover">`
            : game.youtubeVideoId
                ? `<iframe src="https://www.youtube.com/embed/${game.youtubeVideoId}?autoplay=1&mute=1&controls=0&loop=1" class="w-full h-full" frameborder="0" allow="autoplay"></iframe>`
                : `<div class="w-full h-full bg-gradient-to-br from-violet-900/50 to-purple-900/50 flex items-center justify-center">
                            ${game.logo ? `<img src="${game.logo}" alt="${game.name}" class="h-32 object-contain">` : `<span class="text-4xl font-black text-white/20">${game.name}</span>`}
                           </div>`
        }
                <div class="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent"></div>
                
                <!-- Close button -->
                <button onclick="window.closeGameDetail()" class="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 rounded-xl text-white transition-all hover:scale-110 backdrop-blur-sm">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
                
                <!-- Status badge -->
                ${game.status ? `<div class="absolute top-4 left-4">${getStatusBadge(game.status)}</div>` : ''}
            </div>
            
            <!-- Content -->
            <div class="p-6 md:p-8 overflow-y-auto max-h-[calc(90vh-20rem)]">
                <div class="flex flex-col md:flex-row gap-6">
                    <!-- Left: Info -->
                    <div class="flex-1 space-y-6">
                        <!-- Title & Studio -->
                        <div class="flex items-start gap-4">
                            ${game.logo ? `<img src="${game.logo}" alt="${game.name}" class="w-16 h-16 rounded-xl object-contain bg-black/50 p-2 border border-white/10 shrink-0">` : ''}
                            <div>
                                <h2 class="text-2xl md:text-3xl font-black text-white">${game.name}</h2>
                                ${game.ownedBy ? `
                                    <p class="text-sm text-gray-400 mt-1">
                                        By 
                                        ${game.ownedByUrl
                ? `<a href="${game.ownedByUrl}" target="_blank" class="text-violet-400 hover:text-violet-300">${game.ownedBy}</a>`
                : `<span class="text-violet-400">${game.ownedBy}</span>`
            }
                                    </p>
                                ` : ''}
                            </div>
                        </div>
                        
                        <!-- Description -->
                        <p class="text-gray-300 leading-relaxed">${game.description || 'No description available.'}</p>
                        
                        <!-- Genres -->
                        ${game.genres && game.genres.length > 0 ? `
                            <div class="flex flex-wrap gap-2">
                                ${game.genres.map(g => `<span class="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-gray-400">${g}</span>`).join('')}
                            </div>
                        ` : ''}
                        
                        <!-- Share & Play buttons -->
                        <div class="flex flex-wrap items-center gap-4">
                            ${game.link ? `
                                <a href="${game.link}" target="_blank" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-violet-900/30 hover:shadow-violet-900/50 hover:scale-105">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    Play Now
                                </a>
                            ` : ''}
                            <div id="share-buttons-container"></div>
                        </div>
                    </div>
                    
                    <!-- Right: Sidebar -->
                    <div class="w-full md:w-72 space-y-4">
                        <!-- Events/Countdowns -->
                        ${activeEvents.length > 0 ? `
                            <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <h4 class="text-sm font-bold text-white mb-3">Upcoming</h4>
                                ${activeEvents.slice(0, 2).map(event => {
                const cd = event.startDate ? getCountdown(event.startDate) : null;
                return `
                                        <div class="p-3 rounded-xl mb-2" style="background: ${event.color}15; border: 1px solid ${event.color}30;">
                                            <p class="font-semibold text-sm" style="color: ${event.color}">${event.title}</p>
                                            ${cd && !cd.isPast ? `
                                                <div class="grid grid-cols-4 gap-1 mt-2 text-center">
                                                    <div><div class="text-lg font-bold text-white">${cd.days}</div><div class="text-[9px] text-gray-500">DAYS</div></div>
                                                    <div><div class="text-lg font-bold text-white">${cd.hours}</div><div class="text-[9px] text-gray-500">HRS</div></div>
                                                    <div><div class="text-lg font-bold text-white">${cd.minutes}</div><div class="text-[9px] text-gray-500">MIN</div></div>
                                                    <div><div class="text-lg font-bold text-white">${cd.seconds}</div><div class="text-[9px] text-gray-500">SEC</div></div>
                                                </div>
                                            ` : ''}
                                        </div>
                                    `;
            }).join('')}
                            </div>
                        ` : ''}
                        
                        <!-- Spotify -->
                        ${game.spotifyAlbums && game.spotifyAlbums.length > 0 ? `
                            <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <h4 class="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                                    </svg>
                                    Soundtrack
                                </h4>
                                <iframe 
                                    src="https://open.spotify.com/embed/album/${game.spotifyAlbums[0].spotifyId}?theme=0" 
                                    width="100%" 
                                    height="152" 
                                    frameborder="0" 
                                    allowtransparency="true" 
                                    allow="encrypted-media"
                                    class="rounded-xl"
                                ></iframe>
                            </div>
                        ` : ''}
                        
                        <!-- YouTube -->
                        ${game.youtubeVideoId ? `
                            <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <h4 class="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                                    </svg>
                                    Trailer
                                </h4>
                                <a href="https://youtube.com/watch?v=${game.youtubeVideoId}" target="_blank" class="block py-3 text-center bg-red-600 hover:bg-red-500 rounded-xl text-white text-sm font-bold transition-all">
                                    Watch on YouTube
                                </a>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add to DOM
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    currentModal = modal;

    // Add share buttons
    setTimeout(() => {
        const container = document.getElementById('share-buttons-container');
        if (container) {
            container.appendChild(createShareButtons(game));
        }
    }, 100);

    // Close on Escape
    const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeGameDetailModal();
    };
    document.addEventListener('keydown', handleEscape);
    modal.dataset.escapeHandler = 'true';
}

export function closeGameDetailModal(): void {
    if (currentModal) {
        const content = currentModal.querySelector('.modal-enter');
        if (content) {
            content.classList.remove('modal-enter');
            content.classList.add('modal-exit');
        }

        setTimeout(() => {
            currentModal?.remove();
            currentModal = null;
            document.body.style.overflow = '';
        }, 200);
    }
}

// Global access
(window as any).closeGameDetail = closeGameDetailModal;
(window as any).openGameDetail = openGameDetailModal;

/**
 * Main Application Module
 * Initializes and renders all components - NOW FETCHES DATA FROM API
 */

import { createHeader, createHero, createGamesSection, createHeroFooter, createPageFooter, createSocialModal } from '@components/index'
import { initCarousel, type CarouselItem } from '@utils/carousel'
import { onDOMReady } from '@utils/dom'
import { createCookieConsent, createLoadingSkeleton, hideLoadingSkeleton, enableViewTransitions } from '@components/SiteEnhancements'
import '@components/GameDetailModal' // Register global handlers
import '@components/ShareModal' // Register share modal handlers
import { trackEvent } from '@components/ShareModal'

// Types matching API
interface SpotifyAlbum { name: string; spotifyId: string; }
interface GameNotification { id: string; gameId: string; title: string; description: string; countdownTo?: string; youtubeVideoId?: string; link?: string; active: boolean; }

// Event types
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

interface Game { id: string; name: string; logo: string; description: string; ownedBy: string; status: 'coming-soon' | 'playable' | 'beta' | 'in-development'; genres: string[]; youtubeVideoId?: string; thumbnails?: string[]; spotifyAlbums?: SpotifyAlbum[]; link?: string; order?: number; visible?: boolean; events?: GameEvent[]; }
interface Studio { id: string; name: string; description?: string; logo?: string; thumbnail?: string; hero?: boolean; media?: string[]; discord?: string; roblox?: string; youtube?: string; }

interface SiteConfig {
    specialCountdown: {
        enabled: boolean;
        title: string;
        description: string;
        targetDate: string;
        logo?: string;
        backgroundImage?: string;
        youtubeVideoId?: string;
        youtubeRevealDate?: string;
    }
}


// Modifying CONFIG to support new modals
const SITE_CONFIG = {
    company: { name: 'ASTRAL CORE + INTERWORKS INC', displayName: 'Astral Core + Interworks Inc' },
    // Removed specific links, handled by click events now
    hero: { ctaText: 'View Games', ctaHref: '#' },
    games: { heading: 'Games', subheading: 'Explore our upcoming games' },
} as const

function convertGame(game: Game) {
    const studio = studios.find(s => s.name === game.ownedBy);
    return {
        id: game.id,
        name: game.name,
        logo: game.logo,
        description: game.description,
        ownedBy: game.ownedBy,
        ownedByUrl: studio?.discord,
        status: game.status,
        genres: game.genres, // Keep as array
        youtubeVideoId: game.youtubeVideoId,
        thumbnails: game.thumbnails,
        spotifyAlbums: game.spotifyAlbums,
        link: game.link,
        events: game.events // Pass events through
    }
}

// State
let notifications: GameNotification[] = []
let games: Game[] = []
let studios: Studio[] = []
let siteConfig: SiteConfig | null = null
let notificationModalOpen = false
let studiosModalOpen = false
let gamesModalOpen = false
let countdownInterval: number | null = null

// Format countdown
function formatCountdown(targetDate?: string): { days: number; hours: number; minutes: number; seconds: number; expired: boolean } | null {
    if (!targetDate) return null
    const date = new Date(targetDate)
    const now = Date.now()
    const diff = date.getTime() - now
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        expired: false
    }
}

// Create hero countdown widget - integrated into hero content
function createHeroCountdownWidget(): HTMLElement {
    const widget = document.createElement('div')
    widget.id = 'hero-countdown-widget'
    // Modified positioning: Absolute right within the max-w-7xl container
    widget.className = 'absolute right-8 md:right-16 top-1/2 -translate-y-1/2 z-20 hidden lg:block'
    return widget
}

// Render and update the hero countdown
function updateHeroCountdown() {
    const widget = document.getElementById('hero-countdown-widget')
    if (!widget) return

    // Only show active notifications WITH future countdowns in the hero widget
    const activeCountdownNotifs = notifications.filter(n => {
        if (!n.countdownTo) return false
        const target = new Date(n.countdownTo)
        return target.getTime() > Date.now()
    })

    if (activeCountdownNotifs.length === 0) {
        widget.classList.add('hidden')
        return
    }

    widget.classList.remove('hidden')
    const notif = activeCountdownNotifs[0] // Show first active countdown
    const game = games.find(g => g.id === notif.gameId)
    const countdown = formatCountdown(notif.countdownTo)

    if (!countdown) return // Should not happen given filter above

    widget.innerHTML = `
        <div class="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 w-80 shadow-2xl animate-fade-in">
            <div class="flex flex-col items-center text-center mb-5">
                ${game?.logo ? `<img src="${game.logo}" alt="${game?.name}" class="h-24 w-auto object-contain mb-3 drop-shadow-2xl">` : '<div class="w-20 h-20 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-3"><svg class="w-10 h-10 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg></div>'}
                <h3 class="font-bold text-white text-lg leading-tight mb-1">${notif.title}</h3>
                <p class="text-sm text-violet-300 font-medium">${game?.name || 'Game Update'}</p>
            </div>
            <p class="text-sm text-gray-300 mb-5 text-center leading-relaxed opacity-90">${notif.description}</p>
            <div class="grid grid-cols-4 gap-2 text-center mb-5 bg-white/5 rounded-2xl p-2 border border-white/5">
                <div class="py-1">
                    <div class="text-2xl font-bold text-white font-mono" id="cd-days">${countdown.days}</div>
                    <div class="text-[10px] text-gray-400 uppercase tracking-wider">Days</div>
                </div>
                <div class="py-1 border-l border-white/10">
                    <div class="text-2xl font-bold text-white font-mono" id="cd-hours">${countdown.hours}</div>
                    <div class="text-[10px] text-gray-400 uppercase tracking-wider">Hrs</div>
                </div>
                <div class="py-1 border-l border-white/10">
                    <div class="text-2xl font-bold text-white font-mono" id="cd-mins">${countdown.minutes}</div>
                    <div class="text-[10px] text-gray-400 uppercase tracking-wider">Min</div>
                </div>
                <div class="py-1 border-l border-white/10">
                    <div class="text-2xl font-bold text-white font-mono" id="cd-secs">${countdown.seconds}</div>
                    <div class="text-[10px] text-gray-400 uppercase tracking-wider">Sec</div>
                </div>
            </div>
            <div class="flex gap-3">
                ${notif.youtubeVideoId ? `<a href="https://youtube.com/watch?v=${notif.youtubeVideoId}" target="_blank" class="flex-1 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>Watch</a>` : ''}
                ${notif.link ? `<a href="${notif.link}" target="_blank" class="flex-1 py-2.5 bg-white text-black hover:bg-gray-200 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Play</a>` : ''}
            </div>
        </div>
    `
}

// Live countdown tick (updates every second)
function startCountdownTicker() {
    if (countdownInterval) clearInterval(countdownInterval)
    countdownInterval = window.setInterval(() => {
        // Update hero widget countdown
        const activeCountdownNotifs = notifications.filter(n => n.countdownTo && new Date(n.countdownTo).getTime() > Date.now())
        if (activeCountdownNotifs.length > 0) {
            const notif = activeCountdownNotifs[0]
            const cd = formatCountdown(notif.countdownTo)
            if (cd) {
                const dayEl = document.getElementById('cd-days'); if (dayEl) dayEl.textContent = String(cd.days)
                const hrEl = document.getElementById('cd-hours'); if (hrEl) hrEl.textContent = String(cd.hours)
                const minEl = document.getElementById('cd-mins'); if (minEl) minEl.textContent = String(cd.minutes)
                const secEl = document.getElementById('cd-secs'); if (secEl) secEl.textContent = String(cd.seconds)
            }
        }
        // Update modal countdowns if open
        if (notificationModalOpen) renderNotifications()
    }, 1000)
}

// Create notification button for header
function createNotificationButton(): HTMLElement {
    const container = document.createElement('div')
    container.className = 'relative'
    container.id = 'notification-container'

    const button = document.createElement('button')
    button.className = 'relative p-2 text-gray-400 hover:text-white transition-colors'
    button.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>`
    button.onclick = () => toggleNotificationModal()

    const badge = document.createElement('span')
    badge.id = 'notification-badge'
    badge.className = 'absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full items-center justify-center hidden'

    container.appendChild(button)
    container.appendChild(badge)
    return container
}

// Create notification modal
function createNotificationModal(): HTMLElement {
    const modal = document.createElement('div')
    modal.id = 'notification-modal'
    modal.className = 'fixed inset-0 z-[100] hidden'
    modal.innerHTML = `
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="window.closeNotificationModal()"></div>
        <div class="absolute top-20 right-4 sm:right-8 w-full max-w-md bg-[#1a1a1a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div class="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-white">Notifications</h2>
                <button onclick="window.closeNotificationModal()" class="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div id="notification-list" class="max-h-[60vh] overflow-auto"></div>
        </div>
    `
    return modal
}

// Custom studio icons
function getStudioIcon(index: number): string {
    const icons = [
        // Gamepad icon
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg>`,
        // Music icon
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
        // Film icon
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`,
        // Code icon
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/></svg>`,
        // Palette icon
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c0.926 0 1.648-0.746 1.648-1.688 0-0.437-0.18-0.835-0.437-1.125-0.29-0.289-0.438-0.652-0.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/></svg>`,
        // Rocket icon
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
        // Star icon
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        // Zap icon
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
    ]
    return icons[index % icons.length]
}

function getStudioGradient(index: number): string {
    const gradients = [
        'from-violet-500 to-purple-600',
        'from-pink-500 to-rose-600',
        'from-blue-500 to-cyan-600',
        'from-emerald-500 to-teal-600',
        'from-amber-500 to-orange-600',
        'from-red-500 to-pink-600',
        'from-indigo-500 to-blue-600',
        'from-fuchsia-500 to-purple-600'
    ]
    return gradients[index % gradients.length]
}

// STUDIOS MODAL
function createStudiosModal(): HTMLElement {
    const modal = document.createElement('div')
    modal.id = 'studios-modal'
    modal.className = 'fixed inset-0 z-[100] hidden flex items-center justify-center p-4'
    // Modified content: Center-aligned list of studios with thicker fonts and custom icons
    const studiosList = studios.map((s, index) => `
        <div class="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-violet-500/10 cursor-pointer" onclick="window.openSocials('${s.name}')">
            <div class="w-18 h-18 rounded-xl bg-gradient-to-br ${getStudioGradient(index)} mb-4 overflow-hidden flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                ${s.logo
            ? `<img src="${s.logo}" class="w-full h-full object-cover">`
            : `<span class="text-white">${getStudioIcon(index)}</span>`
        }
            </div>
            <h3 class="text-white font-extrabold text-base text-center truncate px-1 group-hover:text-violet-300 transition-colors">${s.name}</h3>
            ${s.description ? `<p class="text-xs text-gray-500 text-center mt-2 line-clamp-2 px-1 font-medium">${s.description}</p>` : ''}
            <div class="mt-3 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                ${s.discord ? '<div class="w-6 h-6 rounded-full bg-[#5865F2]/20 flex items-center justify-center"><svg class="w-3.5 h-3.5 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037 13.486 13.486 0 00-.594 1.226c-2.176-.328-4.352-.328-6.505 0a13.482 13.482 0 00-.602-1.226.075.075 0 00-.079-.037A19.736 19.736 0 002.66 4.37a.072.072 0 00-.03.047C.612 10.976 1.765 17.58 4.295 21.054a.077.077 0 00.088.026 19.988 19.988 0 006.014-3.03.076.076 0 00.038-.052 14.167 14.167 0 01-2.261-1.077.073.073 0 01.002-.122 10.02 10.02 0 00.916-.445.075.075 0 01.078.006 14.28 14.28 0 004.977 1.018 14.285 14.285 0 004.982-1.018.075.075 0 01.078-.006 10.063 10.063 0 00.911.445.074.074 0 01.003.122 14.074 14.074 0 01-2.266 1.077.075.075 0 00.037.052 19.967 19.967 0 006.02 3.03.078.078 0 00.087-.026c2.617-3.593 3.738-10.292 1.638-16.637a.072.072 0 00-.03-.047z"/></svg></div>' : ''}
                ${s.youtube ? '<div class="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center"><svg class="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg></div>' : ''}
                ${s.roblox ? '<div class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"><svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M5.164 0L0 18.627 18.836 24 24 5.373 5.164 0zm7.998 14.305l-4.26-1.132 1.133-4.263 4.261 1.132-1.134 4.263z"/></svg></div>' : ''}
            </div>
        </div>
    `).join('')

    modal.innerHTML = `
        <div class="absolute inset-0 bg-black/85 backdrop-blur-lg" onclick="window.closeStudiosModal()"></div>
        <div class="relative w-full max-w-5xl bg-[#0f0f0f] rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-fade-in-up">
            <div class="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-violet-500/10 to-purple-500/10">
                <div>
                    <h2 class="text-3xl font-black text-white tracking-tight">Our Studios</h2>
                    <p class="text-gray-400 text-sm font-medium mt-1">Explore the creative teams behind our games</p>
                </div>
                <button onclick="window.closeStudiosModal()" class="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all hover:rotate-90 duration-300">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div class="p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                ${studiosList.length ? studiosList : '<p class="text-gray-500 text-center col-span-full py-12 font-semibold">No studios found</p>'}
            </div>
        </div>
    `
    return modal
}

// Status badge helper function
function getStatusBadge(status: string): string {
    const statusMap: Record<string, { color: string; text: string }> = {
        'playable': { color: 'bg-green-500/90 text-black', text: 'PLAYABLE' },
        'coming-soon': { color: 'bg-yellow-500/90 text-black', text: 'COMING SOON' },
        'beta': { color: 'bg-blue-500/90 text-white', text: 'BETA' },
        'in-development': { color: 'bg-purple-500/90 text-white', text: 'IN DEV' }
    }
    const s = statusMap[status] || { color: 'bg-white/20 text-white', text: status.toUpperCase() }
    return `<span class="px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest ${s.color} shadow-lg backdrop-blur-sm">${s.text}</span>`
}

// GAMES MODAL (Replaces scroll-to-games usage)
function createGamesModal(): HTMLElement {
    const modal = document.createElement('div')
    modal.id = 'games-modal'
    modal.className = 'fixed inset-0 z-[100] hidden flex items-center justify-center p-4'

    // Filter by visible flag only for MAIN SITE display
    // Sort by order
    const visibleGames = games
        .filter(g => g.visible !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0))

    // Create specific modal cards for consistency with badge on top-right of image
    const gamesList = visibleGames.map(g => `
        <div class="relative group bg-[#161616] border border-white/10 rounded-2xl overflow-hidden hover:border-violet-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-900/20 hover:-translate-y-1">
             <div class="aspect-video relative overflow-hidden bg-black/50">
                 ${g.thumbnails && g.thumbnails.length > 0
            ? `<img src="${g.thumbnails[0]}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">`
            : g.logo
                ? `<img src="${g.logo}" class="w-full h-full object-cover blur-sm opacity-50"><img src="${g.logo}" class="absolute inset-0 w-2/3 h-2/3 m-auto object-contain z-10">`
                : `<div class="w-full h-full flex items-center justify-center text-gray-600">No Image</div>`
        }
                 <div class="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-transparent opacity-80"></div>
                 <!-- Status Badge - Top Right Corner of Image -->
                 ${g.status ? `<div class="absolute top-3 right-3">${getStatusBadge(g.status)}</div>` : ''}
             </div>
             <div class="p-5">
                  <div class="flex items-center gap-3 mb-3">
                    ${g.logo ? `<img src="${g.logo}" class="w-10 h-10 rounded-lg object-contain bg-black/50 p-1.5 border border-white/10 shadow-lg">` : ''}
                    <div class="min-w-0 flex-1">
                        <h3 class="text-base font-extrabold text-white leading-tight group-hover:text-violet-400 transition-colors truncate">${g.name}</h3>
                        ${(() => {
            const studio = studios.find(s => s.name === g.ownedBy);
            return studio?.discord
                ? `<a href="${studio.discord}" target="_blank" class="text-[10px] text-gray-500 uppercase tracking-widest font-bold hover:text-violet-400 transition-colors flex items-center gap-1 mt-0.5">BY: ${g.ownedBy} <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037 13.486 13.486 0 00-.594 1.226c-2.176-.328-4.352-.328-6.505 0a13.482 13.482 0 00-.602-1.226.075.075 0 00-.079-.037A19.736 19.736 0 002.66 4.37a.072.072 0 00-.03.047C.612 10.976 1.765 17.58 4.295 21.054a.077.077 0 00.088.026 19.988 19.988 0 006.014-3.03.076.076 0 00.038-.052 14.167 14.167 0 01-2.261-1.077.073.073 0 01.002-.122 10.02 10.02 0 00.916-.445.075.075 0 01.078.006 14.28 14.28 0 004.977 1.018 14.285 14.285 0 004.982-1.018.075.075 0 01.078-.006 10.063 10.063 0 00.911.445.074.074 0 01.003.122 14.074 14.074 0 01-2.266 1.077.075.075 0 00.037.052 19.967 19.967 0 006.02 3.03.078.078 0 00.087-.026c2.617-3.593 3.738-10.292 1.638-16.637a.072.072 0 00-.03-.047z"/></svg></a>`
                : `<p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">BY: ${g.ownedBy}</p>`
        })()}
                    </div>
                 </div>
                 <p class="text-sm text-gray-400 line-clamp-2 mb-4 leading-relaxed">${g.description}</p>
                 <div class="flex flex-wrap gap-1.5 mb-4">
                     ${g.genres.slice(0, 3).map(gen => `<span class="text-[10px] px-2 py-1 bg-white/5 rounded-md text-gray-400 border border-white/5 font-medium">${gen}</span>`).join('')}
                 </div>
                 ${g.link ? `<a href="${g.link}" target="_blank" class="block w-full text-center py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl transition-all text-sm font-bold shadow-lg shadow-violet-900/30 hover:shadow-violet-900/50 hover:scale-[1.02]">Play Now</a>` : ''}
             </div>
        </div>
    `).join('')

    modal.innerHTML = `
        <div class="absolute inset-0 bg-black/85 backdrop-blur-lg" onclick="window.closeGamesModal()"></div>
        <div class="relative w-full max-w-6xl h-[85vh] bg-[#0f0f0f] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-fade-in-up">
             <div class="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-violet-500/10 to-purple-500/10 shrink-0">
                <div>
                    <h2 class="text-3xl font-black text-white tracking-tight">All Games</h2>
                    <p class="text-gray-400 text-sm font-medium mt-1">Explore our collection of games</p>
                </div>
                <button onclick="window.closeGamesModal()" class="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all hover:rotate-90 duration-300">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
                 <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${gamesList.length ? gamesList : '<p class="text-gray-500 text-center col-span-full py-12 font-semibold">No games visible currently.</p>'}
                 </div>
            </div>
        </div>
    `
    return modal
}

// Render notifications in modal with game info
function renderNotifications() {
    const list = document.getElementById('notification-list')
    if (!list) return

    if (notifications.length === 0) {
        list.innerHTML = '<div class="p-8 text-center text-gray-400">No active notifications</div>'
        return
    }

    list.innerHTML = notifications.map(notif => {
        const game = games.find(g => g.id === notif.gameId)
        const cd = formatCountdown(notif.countdownTo)
        const hasCountdown = !!cd

        return `
        <div class="p-5 border-b border-white/5 hover:bg-white/5 transition-colors">
            <div class="flex items-start gap-3 mb-3">
                ${game?.logo ? `<img src="${game.logo}" alt="${game.name}" class="w-14 h-14 rounded-xl object-contain bg-black/20 flex-shrink-0">` : '<div class="w-14 h-14 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0"><svg class="w-7 h-7 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>'}
                <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-white">${notif.title}</h3>
                    <p class="text-sm text-violet-400 font-medium">${game?.name || 'Game Update'}</p>
                    <p class="text-xs text-gray-400 mt-1">${notif.description}</p>
                </div>
            </div>
            ${hasCountdown && cd ? `
            <div class="grid grid-cols-4 gap-2 text-center mb-3">
                <div class="bg-violet-500/20 rounded-lg py-1.5 border border-violet-500/20">
                    <div class="text-lg font-bold text-white leading-none">${cd.days}</div>
                    <div class="text-[9px] text-violet-300 mt-0.5">DAYS</div>
                </div>
                <div class="bg-violet-500/10 rounded-lg py-1.5 border border-white/5">
                    <div class="text-lg font-bold text-white leading-none">${cd.hours}</div>
                    <div class="text-[9px] text-gray-400 mt-0.5">HRS</div>
                </div>
                <div class="bg-violet-500/10 rounded-lg py-1.5 border border-white/5">
                    <div class="text-lg font-bold text-white leading-none">${cd.minutes}</div>
                    <div class="text-[9px] text-gray-400 mt-0.5">MIN</div>
                </div>
                <div class="bg-violet-500/10 rounded-lg py-1.5 border border-white/5">
                    <div class="text-lg font-bold text-white leading-none">${cd.seconds}</div>
                    <div class="text-[9px] text-gray-400 mt-0.5">SEC</div>
                </div>
            </div>
            ` : '<div class="mb-3 px-3 py-2 bg-white/5 rounded-lg text-xs text-center text-gray-400">No Countdown</div>'}
            <div class="flex gap-2">
                ${notif.youtubeVideoId ? `<a href="https://youtube.com/watch?v=${notif.youtubeVideoId}" target="_blank" class="flex-1 py-2 bg-red-600/20 text-red-400 rounded-lg text-xs font-medium flex items-center justify-center gap-2 hover:bg-red-600/30 transition-colors border border-red-500/20"><svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>Watch</a>` : ''}
                ${notif.link ? `<a href="${notif.link}" target="_blank" class="flex-1 py-2 bg-violet-500/20 text-violet-300 rounded-lg text-xs font-medium flex items-center justify-center gap-2 hover:bg-violet-500/30 transition-colors border border-violet-500/20"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Play</a>` : ''}
            </div>
        </div>
        `
    }).join('')
}

function toggleNotificationModal() {
    notificationModalOpen = !notificationModalOpen
    const modal = document.getElementById('notification-modal')
    if (modal) {
        if (notificationModalOpen) { modal.classList.remove('hidden'); renderNotifications() }
        else modal.classList.add('hidden')
    }
}

// TOGGLE HANDLERS FOR NEW MODALS
; (window as any).toggleStudiosModal = () => {
    studiosModalOpen = !studiosModalOpen
    const modal = document.getElementById('studios-modal')
    if (modal) {
        if (studiosModalOpen) modal.classList.remove('hidden')
        else modal.classList.add('hidden')
    }
}
    ; (window as any).closeStudiosModal = () => { studiosModalOpen = false; document.getElementById('studios-modal')?.classList.add('hidden') }

    ; (window as any).toggleGamesModal = () => {
        gamesModalOpen = !gamesModalOpen
        const modal = document.getElementById('games-modal')
        if (modal) {
            if (gamesModalOpen) modal.classList.remove('hidden')
            else modal.classList.add('hidden')
        }
    }
    ; (window as any).closeGamesModal = () => { gamesModalOpen = false; document.getElementById('games-modal')?.classList.add('hidden') }


function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge')
    const activeNotifs = notifications.filter(n => n.active)
    if (badge) {
        if (activeNotifs.length > 0) {
            badge.textContent = String(activeNotifs.length > 9 ? '9+' : activeNotifs.length)
            badge.classList.remove('hidden'); badge.classList.add('flex')
        } else { badge.classList.add('hidden'); badge.classList.remove('flex') }
    }
}

; (window as any).closeNotificationModal = () => {
    notificationModalOpen = false
    document.getElementById('notification-modal')?.classList.add('hidden')
}

// Special Countdown Hero Component
function createSpecialCountdownHero(config: SiteConfig['specialCountdown']): HTMLElement {
    const section = document.createElement('section');
    section.className = 'relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-black';
    section.id = 'special-countdown-hero';

    // Determine if video should be shown
    const showVideo = config.youtubeVideoId && (!config.youtubeRevealDate || new Date(config.youtubeRevealDate).getTime() <= Date.now());
    const bgImage = config.backgroundImage || '/astral_hero_background.png';

    section.innerHTML = `
        <div class="absolute inset-0 bg-cover bg-center opacity-30 blur-2xl scale-110 animate-pulse-slow" style="background-image: url('${bgImage}')"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40"></div>
        
        <div class="relative z-10 text-center px-6 max-w-5xl mx-auto flex flex-col items-center animate-fade-in-up">
            ${config.logo ? `<img src="${config.logo}" class="h-24 md:h-32 w-auto object-contain mb-8 drop-shadow-[0_0_25px_rgba(255,255,255,0.2)] animate-float" alt="Event Logo">` : ''}
            
            <h1 class="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter mb-8 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] uppercase font-display leading-tight">
                ${config.title}
            </h1>
            <p class="text-2xl md:text-3xl text-gray-300 font-light mb-16 max-w-3xl leading-relaxed tracking-wide">
                ${config.description}
            </p>
            
            <div class="grid grid-cols-4 gap-4 md:gap-12 text-center mb-16">
                 <div class="flex flex-col items-center gap-2">
                    <div class="text-5xl md:text-7xl lg:text-8xl font-black text-white font-mono bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400" id="sc-days">00</div>
                    <div class="text-xs md:text-sm text-gray-500 uppercase tracking-[0.2em] font-bold">Days</div>
                 </div>
                 <div class="flex flex-col items-center gap-2">
                    <div class="text-5xl md:text-7xl lg:text-8xl font-black text-white font-mono bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400" id="sc-hours">00</div>
                    <div class="text-xs md:text-sm text-gray-500 uppercase tracking-[0.2em] font-bold">Hours</div>
                 </div>
                 <div class="flex flex-col items-center gap-2">
                    <div class="text-5xl md:text-7xl lg:text-8xl font-black text-white font-mono bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400" id="sc-mins">00</div>
                    <div class="text-xs md:text-sm text-gray-500 uppercase tracking-[0.2em] font-bold">Minutes</div>
                 </div>
                 <div class="flex flex-col items-center gap-2">
                    <div class="text-5xl md:text-7xl lg:text-8xl font-black text-white font-mono bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400" id="sc-secs">00</div>
                    <div class="text-xs md:text-sm text-gray-500 uppercase tracking-[0.2em] font-bold">Seconds</div>
                 </div>
            </div>

            ${showVideo ? `
            <a href="https://youtube.com/watch?v=${config.youtubeVideoId}" target="_blank" class="group flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold text-lg transition-all hover:scale-105 shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(220,38,38,0.6)]">
                <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                <span>Watch Trailer</span>
            </a>
            ` : ''}
        </div>

        <audio id="countdown-audio" loop src="/clock.ogg"></audio>
        <button id="unmute-btn" class="absolute bottom-10 right-10 z-50 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full text-white transition-all hidden animate-pulse">
             <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
        </button>
    `;

    setTimeout(() => {
        // Audio Logic
        const audio = section.querySelector('audio') as HTMLAudioElement;
        const btn = section.querySelector('#unmute-btn') as HTMLButtonElement;

        if (audio && btn) {
            audio.volume = 0.5;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Autoplay blocked
                    btn.classList.remove('hidden');
                    btn.onclick = () => {
                        audio.play();
                        btn.classList.add('hidden');
                    };
                });
            }

            // Volume Fade on Scroll Calculation
            const maxVol = 0.5;
            const handleScroll = () => {
                const scrollY = window.scrollY;
                const heroHeight = window.innerHeight;
                // Fade out as we scroll down the hero section
                // 1.0 at top, 0.0 at bottom
                const fadeFactor = 1 - Math.min(scrollY / (heroHeight * 0.8), 1);
                audio.volume = Math.max(0, Math.min(maxVol, maxVol * fadeFactor));
            };

            window.addEventListener('scroll', handleScroll, { passive: true });
        }
    }, 100);

    return section;
}

function startSpecialCountdownLoader(targetDate: string) {
    if (countdownInterval) clearInterval(countdownInterval);

    const update = () => {
        const cd = formatCountdown(targetDate);
        if (cd) {
            const dayEl = document.getElementById('sc-days'); if (dayEl) dayEl.textContent = String(cd.days).padStart(2, '0');
            const hrEl = document.getElementById('sc-hours'); if (hrEl) hrEl.textContent = String(cd.hours).padStart(2, '0');
            const minEl = document.getElementById('sc-mins'); if (minEl) minEl.textContent = String(cd.minutes).padStart(2, '0');
            const secEl = document.getElementById('sc-secs'); if (secEl) secEl.textContent = String(cd.seconds).padStart(2, '0');
        }
    };

    update();
    countdownInterval = window.setInterval(update, 1000);
}


export async function initApp(): Promise<void> {
    const app = document.getElementById('app')
    if (!app) { console.error('❌ App container not found'); return }

    // Fetch data
    try {
        const [gamesRes, notifsRes, studiosRes, configRes] = await Promise.all([
            fetch('/api/games').then(r => r.json()),
            fetch('/api/announcements').then(r => r.json()),
            fetch('/api/studios').then(r => r.json()),
            fetch('/api/config').then(r => r.json()).catch(() => null)
        ])
        games = gamesRes as Game[]
        notifications = notifsRes as GameNotification[]
        studios = studiosRes as Studio[]
        siteConfig = configRes as SiteConfig | null
    } catch (e) { console.error('Failed to fetch:', e); games = []; notifications = []; studios = [] }

    // Build Carousel Items from Studios
    const carouselItems: CarouselItem[] = studios
        .filter(s => s.hero)
        .map(s => ({
            logo: s.logo ? { type: 'image', value: s.logo, alt: s.name } : { type: 'text', value: s.name.toUpperCase() },
            heroBackground: s.thumbnail || (s.media && s.media.length > 0 ? s.media[0] : '/placeholder_hero.png'), // Fallback if no thumbnail
            title: s.name.toUpperCase(),
            description: s.description || ''
        }))

    // Default fallback if no studios found/hero enabled
    if (carouselItems.length === 0) {
        carouselItems.push({ logo: { type: 'text', value: 'INTERWORKS INC' }, heroBackground: '/interworks_hero_background.png', title: 'INTERWORKS INC', description: 'Owned by EggCow' })
    }

    // Build Studio Socials
    const studioSocials = studios.map(s => ({
        studioName: s.name,
        studioLogo: s.logo,
        discord: s.discord,
        roblox: s.roblox,
        youtube: s.youtube
    }))

    initCarousel({ items: carouselItems, interval: 5000 })
    createSocialModal({ studios: studioSocials })

    // Manually create header because we want custom Buttons with custom actions, not just Href links
    // createHeader from shared components might be rigid if it only takes navLinks with hrefs.
    // However, I can pass href="javascript:toggleGamesModal()" if CSP allows or just attach listeners later.
    // Cleaner way: Use the standard createHeader but hijack the links.

    // UPDATED Navigation Links
    const NAV_LINKS = [
        { label: 'GAMES', href: '#' }, // Will intercept
        { label: 'STUDIOS', href: '#' }, // Will intercept
    ]

    const header = createHeader({ carouselItems: carouselItems, navLinks: NAV_LINKS })
    const navContainer = header.querySelector('nav > div:last-child')
    if (navContainer) navContainer.appendChild(createNotificationButton())

    // Intercept clicks on GAMES and STUDIOS
    const links = header.querySelectorAll('nav a')
    links.forEach(link => {
        if (link.textContent?.trim() === 'GAMES') {
            link.addEventListener('click', (e) => { e.preventDefault(); (window as any).toggleGamesModal(); })
        }
        if (link.textContent?.trim() === 'STUDIOS') {
            link.addEventListener('click', (e) => { e.preventDefault(); (window as any).toggleStudiosModal(); })
        }
    })

    app.appendChild(header)

    app.appendChild(header)

    // CHECK FOR SPECIAL COUNTDOWN MODE
    if (siteConfig && siteConfig.specialCountdown && siteConfig.specialCountdown.enabled) {
        // Render Special Countdown
        const hero = createSpecialCountdownHero(siteConfig.specialCountdown);
        app.appendChild(hero);
    } else {
        // Standard Hero
        const hero = createHero({ carouselItems: carouselItems, ctaText: SITE_CONFIG.hero.ctaText, ctaHref: SITE_CONFIG.hero.ctaHref })
        // Hijack Hero CTA as well
        const heroBtn = hero.querySelector('a')
        if (heroBtn) {
            heroBtn.addEventListener('click', (e) => { e.preventDefault(); (window as any).toggleGamesModal(); })
        }

        // Inject hero countdown widget into hero content
        const heroContent = hero.querySelector('.max-w-7xl')
        if (heroContent) {
            heroContent.appendChild(createHeroCountdownWidget())
        }
        app.appendChild(hero)
    }

    app.appendChild(createHeroFooter({ companyName: SITE_CONFIG.company.displayName, year: 2026 }))

    // SECTION: Games List (Filtered and Sorted)
    // Even though user wants a modal, having a section on page is standard. I'll update it to respect visibility/order.
    const visibleGames = games
        .filter(g => g.visible !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0))

    app.appendChild(createGamesSection({ heading: SITE_CONFIG.games.heading, subheading: SITE_CONFIG.games.subheading, games: visibleGames.map(convertGame) }))
    app.appendChild(createPageFooter({ companyName: SITE_CONFIG.company.displayName, year: 2026 }))

    // Append Modals
    app.appendChild(createNotificationModal())
    app.appendChild(createStudiosModal())
    app.appendChild(createGamesModal())

    // Cookie Consent
    app.appendChild(createCookieConsent())

    updateNotificationBadge()
    updateNotificationBadge()

    if (siteConfig?.specialCountdown?.enabled) {
        startSpecialCountdownLoader(siteConfig.specialCountdown.targetDate);
    } else {
        updateHeroCountdown()
        startCountdownTicker() // Start live updates for standard mode
    }

    // Hide loading skeleton after content is ready
    setTimeout(() => hideLoadingSkeleton(), 300)

    // Track page view for analytics
    trackEvent('pageview')

    console.log("ASTRAL CORE + INTERWORKS INC - Site Loaded")
}

// Show loading skeleton immediately
onDOMReady(() => {
    const app = document.getElementById('app')
    if (app) {
        app.appendChild(createLoadingSkeleton())
    }
    enableViewTransitions()
    initApp()
})

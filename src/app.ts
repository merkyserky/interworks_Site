/**
 * Main Application Module
 * Initializes and renders all components - NOW FETCHES DATA FROM API
 */

import { createHeader, createHero, createGamesSection, createHeroFooter, createPageFooter, createSocialModal } from '@components/index'
import { initCarousel, type CarouselItem } from '@utils/carousel'
import { onDOMReady } from '@utils/dom'

// Types matching API
interface SpotifyAlbum { name: string; spotifyId: string; }
interface GameNotification { id: string; gameId: string; title: string; description: string; countdownTo?: string; youtubeVideoId?: string; link?: string; active: boolean; }
interface Game { id: string; name: string; logo: string; description: string; ownedBy: string; status: 'coming-soon' | 'playable' | 'beta' | 'in-development'; genres: string[]; youtubeVideoId?: string; thumbnails?: string[]; spotifyAlbums?: SpotifyAlbum[]; link?: string; }
interface Studio { id: string; name: string; description?: string; logo?: string; thumbnail?: string; hero?: boolean; media?: string[]; discord?: string; roblox?: string; youtube?: string; }

const SITE_CONFIG = {
    company: { name: 'ASTRAL CORE + INTERWORKS INC', displayName: 'Astral Core + Interworks Inc' },
    navigation: [{ label: 'Games', href: '#games' }],
    hero: { ctaText: 'View Games', ctaHref: '#games' },
    games: { heading: 'Games', subheading: 'Explore our upcoming games' },
} as const

function convertGame(game: Game) {
    return { id: game.id, name: game.name, logo: game.logo, description: game.description, ownedBy: game.ownedBy, status: game.status, genre: game.genres.join(', '), youtubeVideoId: game.youtubeVideoId, thumbnails: game.thumbnails, spotifyAlbums: game.spotifyAlbums, link: game.link }
}

// State
let notifications: GameNotification[] = []
let games: Game[] = []
let studios: Studio[] = []
let notificationModalOpen = false
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

export async function initApp(): Promise<void> {
    const app = document.getElementById('app')
    if (!app) { console.error('❌ App container not found'); return }

    // Fetch data
    try {
        const [gamesRes, notifsRes, studiosRes] = await Promise.all([
            fetch('/api/games').then(r => r.json()),
            fetch('/api/announcements').then(r => r.json()),
            fetch('/api/studios').then(r => r.json())
        ])
        games = gamesRes as Game[]
        notifications = notifsRes as GameNotification[]
        studios = studiosRes as Studio[]
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

    const header = createHeader({ carouselItems: carouselItems, navLinks: SITE_CONFIG.navigation })
    const navContainer = header.querySelector('nav > div:last-child')
    if (navContainer) navContainer.appendChild(createNotificationButton())
    app.appendChild(header)

    const hero = createHero({ carouselItems: carouselItems, ctaText: SITE_CONFIG.hero.ctaText, ctaHref: SITE_CONFIG.hero.ctaHref })
    // Inject hero countdown widget into hero content
    const heroContent = hero.querySelector('.max-w-7xl')
    if (heroContent) {
        heroContent.appendChild(createHeroCountdownWidget())
    }
    app.appendChild(hero)

    app.appendChild(createHeroFooter({ companyName: SITE_CONFIG.company.displayName, year: 2026 }))
    app.appendChild(createGamesSection({ heading: SITE_CONFIG.games.heading, subheading: SITE_CONFIG.games.subheading, games: games.map(convertGame) }))
    app.appendChild(createPageFooter({ companyName: SITE_CONFIG.company.displayName, year: 2026 }))
    app.appendChild(createNotificationModal())

    updateNotificationBadge()
    updateHeroCountdown()
    startCountdownTicker() // Start live updates

    console.log("ASTRAL CORE + INTERWORKS INC - Site Loaded")
}

onDOMReady(initApp)

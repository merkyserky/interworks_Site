/**
 * Games Section Component
 * Full-width games showcase with video backgrounds, Spotify embeds, and event countdowns
 */

export interface SpotifyAlbum {
    name: string
    spotifyId: string
}

// Event types matching the panel
export type EventIcon = 'rocket' | 'star' | 'calendar' | 'clock' | 'gift' | 'fire' | 'sparkles' | 'trophy';

export interface GameEvent {
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

export interface Game {
    id: string
    name: string
    logo: string
    studioLogo?: string
    description?: string
    ownedBy?: string
    ownedByUrl?: string
    link?: string
    youtubeVideoId?: string
    thumbnails?: readonly string[]
    spotifyAlbums?: readonly SpotifyAlbum[]
    status?: 'coming-soon' | 'playable' | 'beta' | 'in-development'
    releaseDate?: string
    genres?: readonly string[]
    platforms?: readonly string[]
    events?: readonly GameEvent[]
}

export interface GamesSectionConfig {
    heading: string
    subheading?: string
    games: ReadonlyArray<Game>
}

// Icon SVGs for events
const EVENT_ICONS: Record<EventIcon, string> = {
    rocket: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
    star: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    clock: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    gift: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`,
    fire: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-5.5 5.5-5 10-5 10a5 5 0 0 0 10 0s.5-4.5-5-10z"/></svg>`,
    sparkles: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
    trophy: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
};

// Icon helpers
function getPlayIcon(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`
}

function getPauseIcon(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
}

function getVolumeOnIcon(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`
}

function getVolumeMutedIcon(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`
}

// Calculate countdown
function getCountdown(targetDate: string): { days: number; hours: number; minutes: number; seconds: number; isPast: boolean } {
    const target = new Date(targetDate).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isPast: false };
}

// Create event badge for game card
function createEventBadge(event: GameEvent): HTMLElement {
    const badge = document.createElement('div');
    badge.className = 'flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-md text-sm font-medium';
    badge.style.backgroundColor = `${event.color}30`;
    badge.style.color = event.color;
    badge.style.border = `1px solid ${event.color}40`;

    // Icon
    if (event.icon && EVENT_ICONS[event.icon]) {
        const iconSpan = document.createElement('span');
        iconSpan.className = 'flex-shrink-0';
        iconSpan.innerHTML = EVENT_ICONS[event.icon];
        badge.appendChild(iconSpan);
    }

    // Title
    const title = document.createElement('span');
    title.className = 'font-semibold tracking-wide uppercase text-xs';
    title.textContent = event.title;
    badge.appendChild(title);

    return badge;
}

// Create countdown timer element
function createCountdownTimer(event: GameEvent, targetDate: string): HTMLElement {
    const container = document.createElement('div');
    container.className = 'flex items-center gap-3 px-4 py-2 rounded-xl backdrop-blur-md';
    container.style.backgroundColor = `${event.color}20`;
    container.style.border = `1px solid ${event.color}30`;

    // Icon and title
    const header = document.createElement('div');
    header.className = 'flex items-center gap-2';

    if (event.icon && EVENT_ICONS[event.icon]) {
        const iconSpan = document.createElement('span');
        iconSpan.style.color = event.color;
        iconSpan.innerHTML = EVENT_ICONS[event.icon];
        header.appendChild(iconSpan);
    }

    const title = document.createElement('span');
    title.className = 'text-sm font-semibold uppercase tracking-wide';
    title.style.color = event.color;
    title.textContent = event.title;
    header.appendChild(title);
    container.appendChild(header);

    // Countdown digits
    const countdown = document.createElement('div');
    countdown.className = 'flex items-center gap-1 text-white font-mono';
    countdown.id = `countdown-${event.id}`;
    container.appendChild(countdown);

    // Update countdown every second
    const updateCountdown = () => {
        const { days, hours, minutes, seconds, isPast } = getCountdown(targetDate);

        if (isPast) {
            countdown.innerHTML = `<span class="text-sm" style="color: ${event.color}">Live Now!</span>`;
            return;
        }

        countdown.innerHTML = `
            ${days > 0 ? `<span class="bg-black/40 px-2 py-1 rounded text-sm">${days}d</span>` : ''}
            <span class="bg-black/40 px-2 py-1 rounded text-sm">${hours.toString().padStart(2, '0')}h</span>
            <span class="bg-black/40 px-2 py-1 rounded text-sm">${minutes.toString().padStart(2, '0')}m</span>
            <span class="bg-black/40 px-2 py-1 rounded text-sm">${seconds.toString().padStart(2, '0')}s</span>
        `;
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);

    return container;
}

export function createGamesSection(config: GamesSectionConfig): HTMLElement {
    const { heading, subheading, games } = config

    const section = document.createElement('section')
    section.id = 'games'
    section.className = 'relative bg-gradient-to-b from-[#0a0a12] via-[#0d0d18] to-[#0a0a12] pt-32 pb-8'

    const content = document.createElement('div')
    content.className = 'relative z-10'

    const headerContainer = document.createElement('div')
    headerContainer.className = 'max-w-7xl mx-auto px-8 mb-12'

    const h2 = document.createElement('h2')
    h2.className = 'text-white text-3xl md:text-4xl font-light tracking-[0.2em] uppercase mb-4 text-center'
    h2.textContent = heading
    headerContainer.appendChild(h2)

    const sub = document.createElement('p')
    sub.className = 'text-gray-500 text-center tracking-wide'
    sub.textContent = subheading || 'Explore our collection of games'
    headerContainer.appendChild(sub)

    content.appendChild(headerContainer)

    const gamesContainer = document.createElement('div')
    gamesContainer.className = 'flex flex-col'

    games.forEach(game => {
        const card = createGameCard(game)
        gamesContainer.appendChild(card)
    })

    content.appendChild(gamesContainer)
    section.appendChild(content)

    return section
}

function createGameCard(game: Game): HTMLElement {
    const card = document.createElement('article')
    card.className = 'group relative w-full min-h-[70vh] overflow-hidden'

    // Get active events for this game
    const activeEvents = (game.events || [])
        .filter(e => e.active && e.showOnCard)
        .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    const activeCountdownEvent = activeEvents.find(e =>
        (e.type === 'countdown' || e.type === 'event') &&
        e.showCountdown &&
        e.startDate
    );

    // Video or image background
    if (game.youtubeVideoId) {
        let isPlaying = true
        let pauseTimeout: number | null = null

        const videoBg = document.createElement('div')
        videoBg.className = 'absolute inset-0 z-0 transition-opacity duration-500'
        videoBg.id = `video-bg-${game.id}`

        const videoWrapper = document.createElement('div')
        videoWrapper.className = 'absolute inset-0'
        videoWrapper.style.pointerEvents = 'none'
        videoWrapper.innerHTML = `
      <iframe 
        id="video-iframe-${game.id}"
        class="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2"
        src="https://www.youtube.com/embed/${game.youtubeVideoId}?autoplay=1&mute=1&loop=1&playlist=${game.youtubeVideoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&fs=0&iv_load_policy=3&enablejsapi=1"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        style="border: 0;"
      ></iframe>
    `
        videoBg.appendChild(videoWrapper)
        card.appendChild(videoBg)

        const thumbnails = game.thumbnails || [game.logo]
        let currentThumbnailIndex = 0
        let thumbnailInterval: number | null = null

        const thumbnailBg = document.createElement('div')
        thumbnailBg.className = 'absolute inset-0 z-0 opacity-0 transition-opacity duration-1000'
        thumbnailBg.id = `thumbnail-bg-${game.id}`
        thumbnailBg.style.backgroundImage = `url(${thumbnails[0]})`
        thumbnailBg.style.backgroundSize = 'cover'
        thumbnailBg.style.backgroundPosition = 'center'
        card.appendChild(thumbnailBg)

        const cycleThumbnails = () => {
            if (thumbnails.length > 1) {
                thumbnailInterval = window.setInterval(() => {
                    currentThumbnailIndex = (currentThumbnailIndex + 1) % thumbnails.length
                    thumbnailBg.style.backgroundImage = `url(${thumbnails[currentThumbnailIndex]})`
                }, 4000)
            }
        }

        const stopThumbnailCycle = () => {
            if (thumbnailInterval) {
                clearInterval(thumbnailInterval)
                thumbnailInterval = null
            }
        }

        const gradient = document.createElement('div')
        gradient.className = 'absolute inset-0 z-[1]'
        gradient.style.background = 'linear-gradient(to right, rgba(10,10,18,0.95) 0%, rgba(10,10,18,0.8) 30%, rgba(10,10,18,0.3) 60%, transparent 100%)'
        card.appendChild(gradient)

        const controlsContainer = document.createElement('div')
        controlsContainer.className = 'absolute bottom-6 right-6 z-20 flex items-center gap-2'

        const playPauseBtn = document.createElement('button')
        playPauseBtn.className = `
            w-10 h-10 rounded-full
            bg-black/70 backdrop-blur-md
            flex items-center justify-center
            text-white
            hover:bg-black/90 hover:scale-110
            transition-all duration-200
            border border-white/20
        `.trim().replace(/\s+/g, ' ')
        playPauseBtn.innerHTML = getPauseIcon()
        playPauseBtn.title = 'Pause video'

        playPauseBtn.onclick = () => {
            const iframe = document.getElementById(`video-iframe-${game.id}`) as HTMLIFrameElement

            if (isPlaying) {
                if (iframe?.contentWindow) {
                    iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*')
                }
                playPauseBtn.innerHTML = getPlayIcon()
                playPauseBtn.title = 'Play video'
                isPlaying = false

                pauseTimeout = window.setTimeout(() => {
                    videoBg.classList.add('opacity-0')
                    thumbnailBg.classList.remove('opacity-0')
                    thumbnailBg.classList.add('opacity-100')
                    cycleThumbnails()
                }, 2000)
            } else {
                if (pauseTimeout) {
                    clearTimeout(pauseTimeout)
                    pauseTimeout = null
                }

                stopThumbnailCycle()
                videoBg.classList.remove('opacity-0')
                thumbnailBg.classList.remove('opacity-100')
                thumbnailBg.classList.add('opacity-0')

                if (iframe?.contentWindow) {
                    iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*')
                }
                playPauseBtn.innerHTML = getPauseIcon()
                playPauseBtn.title = 'Pause video'
                isPlaying = true
            }
        }

        controlsContainer.appendChild(playPauseBtn)

        let isMuted = true
        const muteBtn = document.createElement('button')
        muteBtn.className = `
            w-10 h-10 rounded-full
            bg-black/70 backdrop-blur-md
            flex items-center justify-center
            text-white
            hover:bg-black/90 hover:scale-110
            transition-all duration-200
            border border-white/20
        `.trim().replace(/\s+/g, ' ')
        muteBtn.innerHTML = getVolumeMutedIcon()
        muteBtn.title = 'Unmute'

        muteBtn.onclick = () => {
            const iframe = document.getElementById(`video-iframe-${game.id}`) as HTMLIFrameElement

            if (isMuted) {
                if (iframe?.contentWindow) {
                    iframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*')
                }
                muteBtn.innerHTML = getVolumeOnIcon()
                muteBtn.title = 'Mute'
                isMuted = false
            } else {
                if (iframe?.contentWindow) {
                    iframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*')
                }
                muteBtn.innerHTML = getVolumeMutedIcon()
                muteBtn.title = 'Unmute'
                isMuted = true
            }
        }

        controlsContainer.appendChild(muteBtn)
        card.appendChild(controlsContainer)
    } else {
        const bgContainer = document.createElement('div')
        bgContainer.className = 'absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-br from-[#0d0d18] to-[#15152a]'

        const bgLogo = document.createElement('img')
        bgLogo.src = game.logo
        bgLogo.alt = ''
        bgLogo.className = 'absolute right-[10%] top-1/2 -translate-y-1/2 w-[40%] max-w-[500px] object-contain opacity-20 blur-sm'
        bgContainer.appendChild(bgLogo)

        card.appendChild(bgContainer)

        const gradient = document.createElement('div')
        gradient.className = 'absolute inset-0 z-[1]'
        gradient.style.background = 'linear-gradient(to right, rgba(10,10,18,0.95) 0%, rgba(10,10,18,0.7) 40%, transparent 100%)'
        card.appendChild(gradient)
    }

    // Content overlay
    const contentOverlay = document.createElement('div')
    contentOverlay.className = 'relative z-10 flex min-h-[70vh] px-8 md:px-16 lg:px-24 py-16'

    const infoContainer = document.createElement('div')
    infoContainer.className = 'flex-1 flex flex-col justify-center max-w-xl'

    // Event countdown (if applicable)
    if (activeCountdownEvent && activeCountdownEvent.startDate) {
        const countdownEl = createCountdownTimer(activeCountdownEvent, activeCountdownEvent.startDate);
        countdownEl.className += ' mb-6 w-fit';
        infoContainer.appendChild(countdownEl);
    }

    // Badges row (status + genres + events)
    const badgesRow = document.createElement('div')
    badgesRow.className = 'flex flex-wrap gap-2 mb-6'

    if (game.status) {
        const badge = document.createElement('span')
        let badgeColor = 'bg-gray-500/30 text-gray-300'
        let badgeText = 'Unknown'

        if (game.status === 'playable') {
            badgeColor = 'bg-green-500/30 text-green-300'
            badgeText = 'Playable Now'
        } else if (game.status === 'coming-soon') {
            badgeColor = 'bg-yellow-500/30 text-yellow-300'
            badgeText = 'Coming Soon'
        } else if (game.status === 'beta') {
            badgeColor = 'bg-blue-500/30 text-blue-300'
            badgeText = 'Beta'
        } else if (game.status === 'in-development') {
            badgeColor = 'bg-purple-500/30 text-purple-300'
            badgeText = 'In Development'
        }

        badge.className = `inline-block px-4 py-1.5 text-xs tracking-widest uppercase rounded-full backdrop-blur-sm ${badgeColor}`
        badge.textContent = badgeText
        badgesRow.appendChild(badge)
    }

    // Genre badges
    if (game.genres && game.genres.length > 0) {
        game.genres.slice(0, 3).forEach(genre => {
            const genreBadge = document.createElement('span')
            genreBadge.className = 'inline-block px-4 py-1.5 text-xs tracking-widest uppercase rounded-full bg-white/10 text-gray-200 backdrop-blur-sm'
            genreBadge.textContent = genre
            badgesRow.appendChild(genreBadge)
        });
    }

    // Event badges (non-countdown ones)
    activeEvents
        .filter(e => e.type === 'announcement' || !e.showCountdown)
        .slice(0, 2)
        .forEach(event => {
            const eventBadge = createEventBadge(event);
            badgesRow.appendChild(eventBadge);
        });

    if (badgesRow.children.length > 0) {
        infoContainer.appendChild(badgesRow)
    }

    // Game logo/name
    const logoWrapper = document.createElement('div')
    logoWrapper.className = 'mb-6'

    const logoImg = document.createElement('img')
    logoImg.src = game.logo
    logoImg.alt = game.name
    logoImg.className = 'max-h-[300px] object-contain drop-shadow-2xl'
    logoWrapper.appendChild(logoImg)

    infoContainer.appendChild(logoWrapper)

    // Description
    if (game.description) {
        const desc = document.createElement('p')
        desc.className = 'text-gray-300 text-lg leading-relaxed mb-8'
        desc.textContent = game.description
        infoContainer.appendChild(desc)
    }

    // Meta info
    const metaRow = document.createElement('div')
    metaRow.className = 'flex flex-wrap gap-6 text-sm text-gray-400 mb-8'

    if (game.ownedBy) {
        const ownedByEl = document.createElement('div')
        const label = '<span class="text-gray-500">Owned By:</span>'
        const value = `<span class="${game.ownedByUrl ? 'text-indigo-400 hover:text-indigo-300 transition-colors' : 'text-indigo-400'}">${game.ownedBy}</span>`

        if (game.ownedByUrl) {
            ownedByEl.innerHTML = `${label} <a href="${game.ownedByUrl}" target="_blank" class="inline-flex items-center gap-1 hover:underline decoration-indigo-400/30">${value} <svg class="w-3.5 h-3.5 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037 13.486 13.486 0 00-.594 1.226c-2.176-.328-4.352-.328-6.505 0a13.482 13.482 0 00-.602-1.226.075.075 0 00-.079-.037A19.736 19.736 0 002.66 4.37a.072.072 0 00-.03.047C.612 10.976 1.765 17.58 4.295 21.054a.077.077 0 00.088.026 19.988 19.988 0 006.014-3.03.076.076 0 00.038-.052 14.167 14.167 0 01-2.261-1.077.073.073 0 01.002-.122 10.02 10.02 0 00.916-.445.075.075 0 01.078.006 14.28 14.28 0 004.977 1.018 14.285 14.285 0 004.982-1.018.075.075 0 01.078-.006 10.063 10.063 0 00.911.445.074.074 0 01.003.122 14.074 14.074 0 01-2.266 1.077.075.075 0 00.037.052 19.967 19.967 0 006.02 3.03.078.078 0 00.087-.026c2.617-3.593 3.738-10.292 1.638-16.637a.072.072 0 00-.03-.047zM8.534 14.896c-1.12 0-2.036-1.03-2.036-2.296 0-1.266.896-2.296 2.036-2.296 1.137 0 2.053 1.03 2.053 2.296 0 1.266-.897 2.296-2.053 2.296zm6.983 0c-1.12 0-2.036-1.03-2.036-2.296 0-1.266.896-2.296 2.036-2.296 1.137 0 2.053 1.03 2.053 2.296 0 1.266-.897 2.296-2.053 2.296z"/></svg></a>`
        } else {
            ownedByEl.innerHTML = `${label} ${value}`
        }
        metaRow.appendChild(ownedByEl)
    }

    if (game.platforms && game.platforms.length > 0) {
        const platformsEl = document.createElement('div')
        platformsEl.innerHTML = `<span class="text-gray-500">Platforms:</span> ${game.platforms.join(', ')}`
        metaRow.appendChild(platformsEl)
    }

    if (metaRow.children.length > 0) {
        infoContainer.appendChild(metaRow)
    }

    // Action buttons row
    const buttonsRow = document.createElement('div')
    buttonsRow.className = 'flex flex-wrap items-center gap-3'

    // Play button
    if (game.link) {
        const playBtn = document.createElement('a')
        playBtn.href = game.link
        playBtn.target = '_blank'
        playBtn.rel = 'noopener noreferrer'
        playBtn.className = `
            inline-flex items-center justify-center gap-1.5 px-4 py-2.5
            bg-white text-black font-semibold
            text-xs tracking-wide uppercase
            rounded-lg
            hover:scale-105 active:scale-95
            transition-transform duration-200
            shadow-lg shadow-white/10
        `.trim().replace(/\s+/g, ' ')
        playBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
            </svg>
            <span>Play</span>
        `
        buttonsRow.appendChild(playBtn)
    }

    // More Details button
    const detailsBtn = document.createElement('button')
    detailsBtn.className = `
        inline-flex items-center justify-center gap-1.5 px-4 py-2.5
        bg-white/10 text-white font-semibold
        text-xs tracking-wide uppercase
        rounded-lg border border-white/20
        hover:bg-white/20 hover:scale-105 active:scale-95
        transition-all duration-200
    `.trim().replace(/\s+/g, ' ')
    detailsBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
        </svg>
        <span>More Details</span>
    `
    detailsBtn.onclick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        // Open game detail modal
        if ((window as any).openGameDetail) {
            (window as any).openGameDetail(game)
        }
    }
    buttonsRow.appendChild(detailsBtn)

    infoContainer.appendChild(buttonsRow)

    contentOverlay.appendChild(infoContainer)

    // Spotify embed
    if (game.spotifyAlbums && game.spotifyAlbums.length > 0) {
        const spotifyContainer = document.createElement('div')
        spotifyContainer.className = 'hidden lg:flex flex-col items-end ml-auto self-start mt-8'

        const spotifyLabel = document.createElement('div')
        spotifyLabel.className = 'text-gray-400 text-xs tracking-widest uppercase mb-3'
        spotifyLabel.textContent = 'Soundtrack'
        spotifyContainer.appendChild(spotifyLabel)

        if (game.spotifyAlbums.length > 1) {
            const selector = document.createElement('div')
            selector.className = 'flex gap-2 mb-3'

            const embedContainer = document.createElement('div')
            embedContainer.className = 'spotify-embed'

            game.spotifyAlbums.forEach((album, index) => {
                const btn = document.createElement('button')
                btn.className = `px-3 py-1 text-xs rounded-full transition-all ${index === 0 ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`
                btn.textContent = album.name
                btn.onclick = () => {
                    selector.querySelectorAll('button').forEach((b, i) => {
                        if (i === index) {
                            b.className = 'px-3 py-1 text-xs rounded-full transition-all bg-green-500 text-black'
                        } else {
                            b.className = 'px-3 py-1 text-xs rounded-full transition-all bg-white/10 text-gray-300 hover:bg-white/20'
                        }
                    })
                    embedContainer.innerHTML = createSpotifyEmbed(album.spotifyId)
                }
                selector.appendChild(btn)
            })

            spotifyContainer.appendChild(selector)
            embedContainer.innerHTML = createSpotifyEmbed(game.spotifyAlbums[0].spotifyId)
            spotifyContainer.appendChild(embedContainer)
        } else {
            const embedContainer = document.createElement('div')
            embedContainer.innerHTML = createSpotifyEmbed(game.spotifyAlbums[0].spotifyId)
            spotifyContainer.appendChild(embedContainer)
        }

        contentOverlay.appendChild(spotifyContainer)
    }

    card.appendChild(contentOverlay)

    return card
}

function createSpotifyEmbed(spotifyId: string): string {
    return `
    <iframe
      style="border-radius: 12px"
      src="https://open.spotify.com/embed/album/${spotifyId}?utm_source=generator&theme=0"
      width="500"
      height="380"
      frameborder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    ></iframe>
  `
}

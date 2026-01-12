/**
 * Games Section Component
 * Full-width games showcase with video backgrounds and Spotify embeds
 */

export interface SpotifyAlbum {
    name: string
    spotifyId: string  // The Spotify album/playlist ID
}

export interface Game {
    id: string
    name: string
    logo: string
    studioLogo?: string
    description?: string
    ownedBy?: string
    link?: string
    youtubeVideoId?: string
    thumbnails?: readonly string[]    // Array of thumbnail images (cycles when paused)
    spotifyAlbums?: readonly SpotifyAlbum[]
    status?: 'coming-soon' | 'playable' | 'beta' | 'in-development'
    releaseDate?: string
    genre?: string
    platforms?: readonly string[]
}

export interface GamesSectionConfig {
    heading: string
    subheading?: string
    games: ReadonlyArray<Game>
}

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


export function createGamesSection(config: GamesSectionConfig): HTMLElement {
    const { heading, subheading, games } = config

    const section = document.createElement('section')
    section.id = 'games'
    section.className = 'relative bg-gradient-to-b from-[#0a0a12] via-[#0d0d18] to-[#0a0a12] pt-32 pb-8'

    // Content container
    const content = document.createElement('div')
    content.className = 'relative z-10'

    // Section heading
    const headerContainer = document.createElement('div')
    headerContainer.className = 'max-w-7xl mx-auto px-8 mb-12'

    const h2 = document.createElement('h2')
    h2.className = 'text-white text-3xl md:text-4xl font-light tracking-[0.2em] uppercase mb-4 text-center'
    h2.textContent = heading
    headerContainer.appendChild(h2)

    const sub = document.createElement('p')
    sub.className = 'text-gray-500 text-center tracking-wide'
    sub.textContent = subheading || 'Explore our collection of immersive experiences'
    headerContainer.appendChild(sub)

    content.appendChild(headerContainer)

    // Games - full width
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

    // Video or image background - FULL WIDTH
    if (game.youtubeVideoId) {
        let isPlaying = true
        let pauseTimeout: number | null = null

        // Video container
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

        // Thumbnail container (hidden by default) - supports multiple thumbnails that cycle
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

        // Function to cycle thumbnails
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

        // Gradient overlay
        const gradient = document.createElement('div')
        gradient.className = 'absolute inset-0 z-[1]'
        gradient.style.background = 'linear-gradient(to right, rgba(10,10,18,0.95) 0%, rgba(10,10,18,0.8) 30%, rgba(10,10,18,0.3) 60%, transparent 100%)'
        card.appendChild(gradient)

        // Video controls container
        const controlsContainer = document.createElement('div')
        controlsContainer.className = 'absolute bottom-6 right-6 z-20 flex items-center gap-2'

        // Pause/Play button
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

        // Volume control - simple mute button (no slider for now since YouTube API is limited)
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

    // Content overlay - main layout
    const contentOverlay = document.createElement('div')
    contentOverlay.className = 'relative z-10 flex min-h-[70vh] px-8 md:px-16 lg:px-24 py-16'

    // Left side - Game info
    const infoContainer = document.createElement('div')
    infoContainer.className = 'flex-1 flex flex-col justify-center max-w-xl'

    // Badges row
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

    if (game.genre) {
        const genreBadge = document.createElement('span')
        genreBadge.className = 'inline-block px-4 py-1.5 text-xs tracking-widest uppercase rounded-full bg-white/10 text-gray-200 backdrop-blur-sm'
        genreBadge.textContent = game.genre
        badgesRow.appendChild(genreBadge)
    }

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

    // Owned By
    if (game.ownedBy) {
        const ownedByEl = document.createElement('div')
        ownedByEl.innerHTML = `<span class="text-gray-500">Owned By:</span> <span class="text-indigo-400">${game.ownedBy}</span>`
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
        infoContainer.appendChild(playBtn)
    }

    contentOverlay.appendChild(infoContainer)

    // Right side - Spotify embed (top right)
    if (game.spotifyAlbums && game.spotifyAlbums.length > 0) {
        const spotifyContainer = document.createElement('div')
        spotifyContainer.className = 'hidden lg:flex flex-col items-end ml-auto self-start mt-8'

        // Spotify label
        const spotifyLabel = document.createElement('div')
        spotifyLabel.className = 'text-gray-400 text-xs tracking-widest uppercase mb-3'
        spotifyLabel.textContent = 'Soundtrack'
        spotifyContainer.appendChild(spotifyLabel)

        // Album selector if multiple albums
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
                    // Update active button
                    selector.querySelectorAll('button').forEach((b, i) => {
                        if (i === index) {
                            b.className = 'px-3 py-1 text-xs rounded-full transition-all bg-green-500 text-black'
                        } else {
                            b.className = 'px-3 py-1 text-xs rounded-full transition-all bg-white/10 text-gray-300 hover:bg-white/20'
                        }
                    })
                    // Update embed
                    embedContainer.innerHTML = createSpotifyEmbed(album.spotifyId)
                }
                selector.appendChild(btn)
            })

            spotifyContainer.appendChild(selector)

            // Initial embed
            embedContainer.innerHTML = createSpotifyEmbed(game.spotifyAlbums[0].spotifyId)
            spotifyContainer.appendChild(embedContainer)
        } else {
            // Single album
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

/**
 * Games Section Component
 * Full-width games showcase with video backgrounds
 */

export interface Game {
    id: string
    name: string
    logo: string
    studioLogo?: string
    description?: string
    link?: string
    youtubeVideoId?: string
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
        // Video background container
        const videoBg = document.createElement('div')
        videoBg.className = 'absolute inset-0 z-0'

        // YouTube embed with all UI hidden
        const videoWrapper = document.createElement('div')
        videoWrapper.className = 'absolute inset-0'
        videoWrapper.style.pointerEvents = 'none'
        videoWrapper.innerHTML = `
      <iframe 
        class="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2"
        src="https://www.youtube.com/embed/${game.youtubeVideoId}?autoplay=1&mute=1&loop=1&playlist=${game.youtubeVideoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&fs=0&iv_load_policy=3"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        style="border: 0;"
      ></iframe>
    `
        videoBg.appendChild(videoWrapper)
        card.appendChild(videoBg)

        // Gradient overlay on left side for text readability
        const gradient = document.createElement('div')
        gradient.className = 'absolute inset-0 z-[1]'
        gradient.style.background = 'linear-gradient(to right, rgba(10,10,18,0.95) 0%, rgba(10,10,18,0.8) 30%, rgba(10,10,18,0.3) 60%, transparent 100%)'
        card.appendChild(gradient)
    } else {
        // Static background with logo
        const bgContainer = document.createElement('div')
        bgContainer.className = 'absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-br from-[#0d0d18] to-[#15152a]'

        const bgLogo = document.createElement('img')
        bgLogo.src = game.logo
        bgLogo.alt = ''
        bgLogo.className = 'absolute right-[10%] top-1/2 -translate-y-1/2 w-[40%] max-w-[500px] object-contain opacity-20 blur-sm'
        bgContainer.appendChild(bgLogo)

        card.appendChild(bgContainer)

        // Gradient overlay
        const gradient = document.createElement('div')
        gradient.className = 'absolute inset-0 z-[1]'
        gradient.style.background = 'linear-gradient(to right, rgba(10,10,18,0.95) 0%, rgba(10,10,18,0.7) 40%, transparent 100%)'
        card.appendChild(gradient)
    }

    // Content overlay
    const contentOverlay = document.createElement('div')
    contentOverlay.className = 'relative z-10 flex items-center min-h-[70vh] px-8 md:px-16 lg:px-24 py-16'

    const infoContainer = document.createElement('div')
    infoContainer.className = 'max-w-xl'

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
    logoImg.className = 'max-h-[120px] object-contain drop-shadow-2xl'
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
      inline-flex items-center gap-3 px-8 py-4
      bg-white text-black font-semibold
      text-sm tracking-widest uppercase
      rounded-xl
      hover:bg-indigo-500 hover:text-white hover:scale-105
      transition-all duration-300
      shadow-lg shadow-white/10
    `.trim().replace(/\s+/g, ' ')
        playBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z"/>
      </svg>
      <span>Play Now</span>
    `
        infoContainer.appendChild(playBtn)
    }

    contentOverlay.appendChild(infoContainer)
    card.appendChild(contentOverlay)

    return card
}

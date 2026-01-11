/**
 * Main Application Module
 * Initializes and renders all components
 */

import { createHeader, createHero, createGamesSection, createHeroFooter, createPageFooter, createSocialModal } from '@components/index'
import { initCarousel, type CarouselItem } from '@utils/carousel'
import { onDOMReady } from '@utils/dom'

// Carousel items - logo + matching hero background + title/description
const CAROUSEL_ITEMS: CarouselItem[] = [
    {
        logo: { type: 'text', value: 'INTERWORKS INC' },
        heroBackground: '/interworks_hero_background.png',
        title: 'INTERWORKS INC',
        description: 'Owned by EggCow',
    },
    {
        logo: { type: 'image', value: '/studios/astral_Core.png', alt: 'Astral Core' },
        heroBackground: '/astral_hero_background.png',
        title: 'ASTRAL CORE',
        description: 'Astral Core is a roblox development studio owned by plasmix2 and wafflynutria116.',
    },
]

// Studio social links for modal
const STUDIO_SOCIALS = [
    {
        studioName: 'Interworks Inc',
        discord: 'https://discord.gg/C2wGG8KHRr',
        roblox: 'https://www.roblox.com/communities/34862200/Interworks-Inc#!/',
        // youtube: 'https://youtube.com/@interworksinc', // Add when available
    },
    {
        studioName: 'Astral Core',
        studioLogo: '/studios/astral_Core.png',
        discord: 'https://discord.gg/5nJgPbdTpy', // Replace with actual invite
        roblox: 'https://www.roblox.com/communities/13408947/Astral-Core-Games#!/', // Replace with actual group
        youtube: 'https://www.youtube.com/@plasmix2', // Add when available
    },
]

// Site configuration
const SITE_CONFIG = {
    company: {
        name: 'ASTRAL CORE + INTERWORKS INC',
        displayName: 'Astral Core + Interworks Inc',
    },
    navigation: [
        { label: 'Games', href: '#games' },
        { label: 'Contact', href: '#contact' },
    ],
    hero: {
        ctaText: 'View Games',
        ctaHref: '#games',
    },
    games: {
        heading: 'Games',
        subheading: 'Explore our upcoming games',
        list: [
            {
                id: 'ashmoor-casefiles',
                name: 'Ashmoor Casefiles',
                logo: '/ashmoor.png',
                description: 'After the disaster, when humanity fell onto itself, you the traveler came upon the small town of Ashmoor. Discover unsolved cases, encountering friends and foes on your journey, and by your side a handy shotgun which feeds off you blood. The heart is like a rose, like the one that bloomed years ago.',
                ownedBy: 'Interworks Inc',
                status: 'coming-soon' as const,
                genre: 'Horror Mystery',
            },
            {
                id: 'unseen-floors',
                name: 'Unseen Floors',
                logo: '/LogoUnseen.png',
                description: 'There is no description at this time.',
                ownedBy: 'Astral Core',
                status: 'coming-soon' as const,
                genre: 'Horror',
                youtubeVideoId: '23Mq7j-O88E',
                spotifyAlbums: [
                    { name: 'OST Vol. 1', spotifyId: '78ZlzFurP42walRtyiRbN8' },
                ],
            },
        ],
    },
} as const

/**
 * Initialize the application
 */
export function initApp(): void {
    const app = document.getElementById('app')

    if (!app) {
        console.error('❌ App container not found')
        return
    }

    // Initialize carousel (5 seconds per slide)
    initCarousel({
        items: CAROUSEL_ITEMS,
        interval: 5000,
    })

    // Create social modal
    createSocialModal({
        studios: STUDIO_SOCIALS,
    })

    // Render Header with synced logo carousel
    const header = createHeader({
        carouselItems: CAROUSEL_ITEMS,
        navLinks: SITE_CONFIG.navigation,
    })
    app.appendChild(header)

    // Render Hero Section with synced background and content
    const hero = createHero({
        carouselItems: CAROUSEL_ITEMS,
        ctaText: SITE_CONFIG.hero.ctaText,
        ctaHref: SITE_CONFIG.hero.ctaHref,
    })
    app.appendChild(hero)

    // Render fixed footer for hero section (hides on scroll)
    const heroFooter = createHeroFooter({
        companyName: SITE_CONFIG.company.displayName,
        year: 2026,
    })
    app.appendChild(heroFooter)

    // Render Games Section
    const gamesSection = createGamesSection({
        heading: SITE_CONFIG.games.heading,
        subheading: SITE_CONFIG.games.subheading,
        games: SITE_CONFIG.games.list,
    })
    app.appendChild(gamesSection)

    // Render static Footer at page bottom
    const pageFooter = createPageFooter({
        companyName: SITE_CONFIG.company.displayName,
        year: 2026,
    })
    app.appendChild(pageFooter)

    console.log('🚀 ASTRAL CORE + INTERWORKS INC - App initialized')
}

// Auto-initialize when DOM is ready
onDOMReady(initApp)

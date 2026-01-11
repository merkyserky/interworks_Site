/**
 * Main Application Module
 * Initializes and renders all components
 */

import { createHeader, createHero, createGamesSection, createHeroFooter, createPageFooter } from '@components/index'
import { initCarousel, type CarouselItem } from '@utils/carousel'
import { onDOMReady } from '@utils/dom'

// Carousel items - logo + matching hero background + title/description
const CAROUSEL_ITEMS: CarouselItem[] = [
    {
        logo: { type: 'text', value: 'INTERWORKS INC' },
        heroBackground: '/interworks_hero_background.png',
        title: 'INTERWORKS INC',
        description: 'idk man add some egg stuff',
    },
    {
        logo: { type: 'image', value: '/studios/astral_Core.png', alt: 'Astral Core' },
        heroBackground: '/astral_hero_background.png',
        title: 'ASTRAL CORE',
        description: 'man im astral core ',
    },
]

// Site configuration
const SITE_CONFIG = {
    company: {
        name: 'INTERWORKS INC',
        displayName: 'Interworks Inc',
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
                description: 'There is no description at this time.',
                status: 'coming-soon' as const,
                genre: 'Horror Mystery',
                // spotifyAlbums: [
                //     { name: 'OST Vol. 1', spotifyId: 'ALBUM_ID_HERE' },
                //     { name: 'Ambience', spotifyId: 'ALBUM_ID_HERE' },
                // ],
            },
            {
                id: 'unseen-floors',
                name: 'Unseen Floors',
                logo: '/LogoUnseen.png',
                description: 'There is no description at this time.',
                status: 'coming-soon' as const,
                genre: 'Horror',
                youtubeVideoId: '23Mq7j-O88E',
                // link: 'https://www.roblox.com/games/113322775247353/SPOOKY-FLOORS',
                spotifyAlbums: [
                    { name: 'OST Vol. 1', spotifyId: '78ZlzFurP42walRtyiRbN8' },
                ],
            },
        ],
    },
    social: [
        {
            type: 'discord' as const,
            label: 'Discord',
            href: 'https://discord.gg/C2wGG8KHRr',
        },
        {
            type: 'roblox' as const,
            label: 'Roblox Group',
            href: 'https://www.roblox.com/communities/34862200/Interworks-Inc#!/',
        },
    ],
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
        socialLinks: SITE_CONFIG.social,
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
        socialLinks: SITE_CONFIG.social,
    })
    app.appendChild(pageFooter)

    console.log('🚀 INTERWORKS INC - App initialized')
}

// Auto-initialize when DOM is ready
onDOMReady(initApp)

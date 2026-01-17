/**
 * Header/Navigation Component
 * Top navigation bar with synced logo carousel and search bar
 */

import { onCarouselChange, type CarouselItem } from '@utils/carousel'

export interface NavLink {
    label: string
    href: string
}

export interface HeaderConfig {
    carouselItems: ReadonlyArray<CarouselItem>
    navLinks: ReadonlyArray<NavLink>
    onSearch?: (query: string) => void
}

// Search icon SVG
function getSearchIcon(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`
}

export function createHeader(config: HeaderConfig): HTMLElement {
    const { carouselItems, navLinks } = config

    const header = document.createElement('header')
    header.className = `
    fixed top-0 left-0 right-0 z-50 px-8 py-4
    bg-black/50 backdrop-blur-xl
    border-b border-white/10
  `.trim().replace(/\s+/g, ' ')

    const nav = document.createElement('nav')
    nav.className = 'max-w-7xl mx-auto flex items-center justify-between gap-6'

    // Logo container
    const logoContainer = document.createElement('a')
    logoContainer.href = '/'
    logoContainer.className = 'relative h-10 flex items-center flex-shrink-0'
    logoContainer.style.minWidth = '180px'

    // Create logo elements for each item
    const logoElements: HTMLElement[] = []

    carouselItems.forEach((item, index) => {
        const logoWrapper = document.createElement('div')
        logoWrapper.className = `absolute inset-0 flex items-center transition-opacity duration-700 ${index === 0 ? 'opacity-100' : 'opacity-0'}`

        if (item.logo.type === 'text') {
            const textSpan = document.createElement('span')
            textSpan.className = 'text-white font-bold text-lg tracking-[0.2em] uppercase font-display'
            textSpan.textContent = item.logo.value
            logoWrapper.appendChild(textSpan)
        } else {
            const img = document.createElement('img')
            img.src = item.logo.value
            img.alt = item.logo.alt || 'Logo'
            img.className = 'h-10 object-contain'
            logoWrapper.appendChild(img)
        }

        logoElements.push(logoWrapper)
        logoContainer.appendChild(logoWrapper)
    })

    // Listen for carousel changes
    onCarouselChange((index) => {
        logoElements.forEach((el, i) => {
            if (i === index) {
                el.classList.remove('opacity-0')
                el.classList.add('opacity-100')
            } else {
                el.classList.remove('opacity-100')
                el.classList.add('opacity-0')
            }
        })
    })

    nav.appendChild(logoContainer)

    // Center section - Search bar
    const searchContainer = document.createElement('div')
    searchContainer.className = 'flex-1 max-w-md mx-4 hidden md:block'

    const searchWrapper = document.createElement('div')
    searchWrapper.className = `
        relative flex items-center
        bg-white/5 hover:bg-white/10
        border border-white/10 hover:border-white/20
        rounded-xl
        transition-all duration-300
        focus-within:border-violet-500/50 focus-within:bg-white/10
        focus-within:ring-2 focus-within:ring-violet-500/20
    `.trim().replace(/\s+/g, ' ')

    const searchIconSpan = document.createElement('span')
    searchIconSpan.className = 'absolute left-3 text-gray-400 pointer-events-none'
    searchIconSpan.innerHTML = getSearchIcon()

    const searchInput = document.createElement('input')
    searchInput.type = 'text'
    searchInput.placeholder = 'Search games, studios...'
    searchInput.className = `
        w-full py-2.5 pl-10 pr-4
        bg-transparent
        text-white text-sm
        placeholder-gray-500
        outline-none
    `.trim().replace(/\s+/g, ' ')

    searchInput.addEventListener('input', (e) => {
        const query = (e.target as HTMLInputElement).value
        if (config.onSearch) config.onSearch(query)
    })

    searchWrapper.appendChild(searchIconSpan)
    searchWrapper.appendChild(searchInput)
    searchContainer.appendChild(searchWrapper)

    nav.appendChild(searchContainer)

    // Right section - Nav Links only (no profile dropdown on main site)
    const navLinksContainer = document.createElement('div')
    navLinksContainer.className = 'flex items-center gap-6'

    navLinks.forEach(link => {
        const a = document.createElement('a')
        a.href = link.href
        a.className = 'text-gray-400 text-sm font-medium tracking-[0.1em] uppercase hover:text-white transition-colors'
        a.textContent = link.label
        navLinksContainer.appendChild(a)
    })

    nav.appendChild(navLinksContainer)
    header.appendChild(nav)

    return header
}


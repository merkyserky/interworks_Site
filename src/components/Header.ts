/**
 * Header/Navigation Component
 * Top navigation bar with synced logo carousel
 */

import { onCarouselChange, type CarouselItem } from '@utils/carousel'

export interface NavLink {
    label: string
    href: string
}

export interface HeaderConfig {
    carouselItems: ReadonlyArray<CarouselItem>
    navLinks: ReadonlyArray<NavLink>
}

export function createHeader(config: HeaderConfig): HTMLElement {
    const { carouselItems, navLinks } = config

    const header = document.createElement('header')
    header.className = `
    fixed top-0 left-0 right-0 z-50 px-8 py-5
    bg-black/40 backdrop-blur-xl
    border-b border-white/5
  `.trim().replace(/\s+/g, ' ')

    const nav = document.createElement('nav')
    nav.className = 'max-w-7xl mx-auto flex items-center justify-between'

    // Logo container
    const logoContainer = document.createElement('a')
    logoContainer.href = '/'
    logoContainer.className = 'relative h-10 flex items-center'
    logoContainer.style.minWidth = '220px'

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

    // Nav Links
    const navLinksContainer = document.createElement('div')
    navLinksContainer.className = 'flex items-center gap-8'

    navLinks.forEach(link => {
        const a = document.createElement('a')
        a.href = link.href
        a.className = 'text-gray-400 text-sm tracking-[0.15em] uppercase hover:text-white transition-colors'
        a.textContent = link.label
        navLinksContainer.appendChild(a)
    })

    nav.appendChild(navLinksContainer)
    header.appendChild(nav)

    return header
}

/**
 * Hero Section Component
 * Full-screen hero with synced background carousel
 */

import { onCarouselChange, type CarouselItem } from '@utils/carousel'

export interface HeroConfig {
    carouselItems: ReadonlyArray<CarouselItem>
    ctaText: string
    ctaHref: string
}

export function createHero(config: HeroConfig): HTMLElement {
    const { carouselItems, ctaText, ctaHref } = config

    const hero = document.createElement('section')
    hero.className = 'relative min-h-screen flex items-center justify-center overflow-hidden'
    hero.id = 'hero'

    // Background images container
    const bgContainer = document.createElement('div')
    bgContainer.className = 'absolute inset-0 z-0'

    const bgElements: HTMLElement[] = []

    carouselItems.forEach((item, index) => {
        const bg = document.createElement('div')
        bg.className = `absolute inset-0 transition-opacity duration-1000 ${index === 0 ? 'opacity-100' : 'opacity-0'}`
        bg.style.backgroundImage = `url(${item.heroBackground})`
        bg.style.backgroundSize = 'cover'
        bg.style.backgroundPosition = 'center'

        bgElements.push(bg)
        bgContainer.appendChild(bg)
    })

    hero.appendChild(bgContainer)

    // Listen for carousel changes
    onCarouselChange((index) => {
        bgElements.forEach((el, i) => {
            if (i === index) {
                el.classList.remove('opacity-0')
                el.classList.add('opacity-100')
            } else {
                el.classList.remove('opacity-100')
                el.classList.add('opacity-0')
            }
        })
    })

    // Dark overlay
    const overlay = document.createElement('div')
    overlay.className = 'absolute inset-0 z-[1] bg-black/50'
    hero.appendChild(overlay)

    // Vignette
    const vignette = document.createElement('div')
    vignette.className = 'absolute inset-0 z-[2]'
    vignette.style.background = 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 100%)'
    hero.appendChild(vignette)

    // Content - just the CTA button centered
    const content = document.createElement('div')
    content.className = 'relative z-10 text-center px-8'

    // CTA Button
    const cta = document.createElement('a')
    cta.href = ctaHref
    cta.className = `
    inline-flex items-center gap-3 px-12 py-5
    bg-white/10 backdrop-blur-sm
    border border-white/30
    text-white text-sm tracking-[0.25em] uppercase font-medium
    hover:bg-white hover:text-black 
    transition-all duration-300
    rounded-xl
  `.trim().replace(/\s+/g, ' ')

    cta.innerHTML = `
    <span>${ctaText}</span>
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 5v14M19 12l-7 7-7-7"/>
    </svg>
  `
    content.appendChild(cta)

    hero.appendChild(content)

    // Scroll indicator
    const scrollIndicator = document.createElement('div')
    scrollIndicator.className = 'absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce opacity-50'
    scrollIndicator.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-white">
      <path d="M12 5v14M19 12l-7 7-7-7"/>
    </svg>
  `
    hero.appendChild(scrollIndicator)

    return hero
}

/**
 * Hero Section Component
 * Full-screen hero with synced background carousel and smooth content transitions
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
    hero.className = 'relative min-h-screen flex items-center overflow-hidden'
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

    // Dark overlay
    const overlay = document.createElement('div')
    overlay.className = 'absolute inset-0 z-[1]'
    overlay.style.background = 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.4) 100%)'
    hero.appendChild(overlay)

    // Vignette
    const vignette = document.createElement('div')
    vignette.className = 'absolute inset-0 z-[2]'
    vignette.style.background = 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)'
    hero.appendChild(vignette)

    // Content - left aligned with fixed height container to prevent layout shift
    const content = document.createElement('div')
    content.className = 'relative z-10 max-w-7xl mx-auto px-8 md:px-16 py-32 w-full'

    // Fixed height content wrapper to prevent layout shift
    const contentWrapper = document.createElement('div')
    contentWrapper.className = 'relative h-[280px] md:h-[300px]' // Fixed height

    // Content elements for each carousel item - stacked with absolute positioning
    const contentElements: HTMLElement[] = []

    carouselItems.forEach((item, index) => {
        const itemContent = document.createElement('div')
        itemContent.className = `absolute inset-0 flex flex-col justify-center transition-all duration-700 ease-out ${index === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`
        itemContent.style.maxWidth = '600px'

        const title = document.createElement('h1')
        title.className = 'text-white text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider uppercase mb-4 font-display'
        title.textContent = item.title
        itemContent.appendChild(title)

        const desc = document.createElement('p')
        desc.className = 'text-gray-300 text-base md:text-lg leading-relaxed'
        desc.innerHTML = item.description
        itemContent.appendChild(desc)

        contentElements.push(itemContent)
        contentWrapper.appendChild(itemContent)
    })

    content.appendChild(contentWrapper)

    // CTA Button (always visible, below the content wrapper)
    const ctaWrapper = document.createElement('div')
    ctaWrapper.className = 'mt-10'

    const cta = document.createElement('a')
    cta.href = ctaHref
    cta.className = `
    inline-flex items-center gap-3 px-10 py-4
    bg-white/10 backdrop-blur-sm
    border border-white/30
    text-white text-sm tracking-[0.2em] uppercase font-medium
    hover:bg-white hover:text-black 
    transition-all duration-300
    rounded-xl
  `.trim().replace(/\s+/g, ' ')

    cta.innerHTML = `
    <span>${ctaText}</span>
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 5v14M19 12l-7 7-7-7"/>
    </svg>
  `
    ctaWrapper.appendChild(cta)
    content.appendChild(ctaWrapper)

    hero.appendChild(content)

    // Listen for carousel changes
    onCarouselChange((index) => {
        // Update backgrounds
        bgElements.forEach((el, i) => {
            if (i === index) {
                el.classList.remove('opacity-0')
                el.classList.add('opacity-100')
            } else {
                el.classList.remove('opacity-100')
                el.classList.add('opacity-0')
            }
        })

        // Update content with smooth slide animation
        contentElements.forEach((el, i) => {
            if (i === index) {
                el.classList.remove('opacity-0', 'translate-y-4')
                el.classList.add('opacity-100', 'translate-y-0')
            } else {
                el.classList.remove('opacity-100', 'translate-y-0')
                el.classList.add('opacity-0', 'translate-y-4')
            }
        })
    })

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

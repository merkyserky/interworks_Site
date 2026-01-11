/**
 * Footer Component
 * Shows social buttons that open the social modal
 */

import { openSocialModal } from './SocialModal'

export interface FooterConfig {
    companyName: string
    year?: number
}

// SVG Icons
const ICONS = {
    discord: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`,
    roblox: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5.164 0L.16 18.928 18.836 24l5.004-18.928L5.164 0zm9.086 14.318l-4.222-1.12 1.12-4.222 4.222 1.12-1.12 4.222z"/></svg>`,
    youtube: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
}

function createSocialButtons(): HTMLElement {
    const socialContainer = document.createElement('div')
    socialContainer.className = 'flex items-center gap-3'

    // Discord button
    const discordBtn = document.createElement('button')
    discordBtn.title = 'Discord'
    discordBtn.className = `
        flex items-center justify-center w-10 h-10
        bg-black/20 hover:bg-[#5865F2] text-gray-300 hover:text-white
        rounded-full border border-white/10
        transition-all duration-300 cursor-pointer
    `.trim().replace(/\s+/g, ' ')
    discordBtn.innerHTML = ICONS.discord
    discordBtn.onclick = () => openSocialModal()
    socialContainer.appendChild(discordBtn)

    // Roblox button
    const robloxBtn = document.createElement('button')
    robloxBtn.title = 'Roblox'
    robloxBtn.className = `
        flex items-center justify-center w-10 h-10
        bg-black/20 hover:bg-[#E2231A] text-gray-300 hover:text-white
        rounded-full border border-white/10
        transition-all duration-300 cursor-pointer
    `.trim().replace(/\s+/g, ' ')
    robloxBtn.innerHTML = ICONS.roblox
    robloxBtn.onclick = () => openSocialModal()
    socialContainer.appendChild(robloxBtn)

    // YouTube button
    const youtubeBtn = document.createElement('button')
    youtubeBtn.title = 'YouTube'
    youtubeBtn.className = `
        flex items-center justify-center w-10 h-10
        bg-black/20 hover:bg-[#FF0000] text-gray-300 hover:text-white
        rounded-full border border-white/10
        transition-all duration-300 cursor-pointer
    `.trim().replace(/\s+/g, ' ')
    youtubeBtn.innerHTML = ICONS.youtube
    youtubeBtn.onclick = () => openSocialModal()
    socialContainer.appendChild(youtubeBtn)

    return socialContainer
}

/**
 * Creates a fixed footer that shows at bottom of hero section
 */
export function createHeroFooter(config: FooterConfig): HTMLElement {
    const { companyName, year = new Date().getFullYear() } = config

    const footer = document.createElement('div')
    footer.id = 'hero-footer'
    footer.className = `
        fixed bottom-0 left-0 right-0 z-40 px-8 py-6
        bg-gradient-to-t from-black/80 to-transparent
        transition-opacity duration-300
    `.trim().replace(/\s+/g, ' ')

    const container = document.createElement('div')
    container.className = 'max-w-7xl mx-auto flex items-center justify-between'

    // Copyright
    const copyright = document.createElement('p')
    copyright.className = 'text-gray-600 text-xs tracking-wide uppercase'
    copyright.innerHTML = `&copy; ${year} ${companyName}. All rights reserved.`
    container.appendChild(copyright)

    // Social Buttons
    container.appendChild(createSocialButtons())

    footer.appendChild(container)

    // Add scroll listener to hide/show
    let ticking = false
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const heroSection = document.getElementById('hero')
                if (heroSection) {
                    const heroBottom = heroSection.offsetTop + heroSection.offsetHeight
                    if (window.scrollY > heroBottom - window.innerHeight) {
                        footer.style.opacity = '0'
                        footer.style.pointerEvents = 'none'
                    } else {
                        footer.style.opacity = '1'
                        footer.style.pointerEvents = 'auto'
                    }
                }
                ticking = false
            })
            ticking = true
        }
    })

    return footer
}

/**
 * Creates a static footer at the very bottom of the page
 */
export function createPageFooter(config: FooterConfig): HTMLElement {
    const { companyName, year = new Date().getFullYear() } = config

    const footer = document.createElement('footer')
    footer.className = 'relative z-40 px-8 py-8 bg-black border-t border-white/5'

    const container = document.createElement('div')
    container.className = 'max-w-7xl mx-auto flex items-center justify-between'

    // Copyright
    const copyright = document.createElement('p')
    copyright.className = 'text-gray-600 text-xs tracking-wide uppercase'
    copyright.innerHTML = `&copy; ${year} ${companyName}. All rights reserved.`
    container.appendChild(copyright)

    // Social Buttons
    container.appendChild(createSocialButtons())

    footer.appendChild(container)
    return footer
}

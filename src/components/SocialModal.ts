/**
 * Social Modal Component
 * Modal popup for selecting between different studio social links
 */

export interface StudioSocialLinks {
    studioName: string
    studioLogo?: string
    discord?: string
    roblox?: string
    youtube?: string
}

export interface SocialModalConfig {
    studios: StudioSocialLinks[]
}

let modalElement: HTMLElement | null = null

// SVG Icons
const ICONS = {
    discord: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`,
    roblox: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5.164 0L.16 18.928 18.836 24l5.004-18.928L5.164 0zm9.086 14.318l-4.222-1.12 1.12-4.222 4.222 1.12-1.12 4.222z"/></svg>`,
    youtube: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    close: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
}

export function createSocialModal(config: SocialModalConfig): void {
    // Create modal overlay
    const modal = document.createElement('div')
    modal.id = 'social-modal'
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 opacity-0 pointer-events-none transition-opacity duration-300'
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
    modal.style.backdropFilter = 'blur(8px)'

    // Modal content
    const content = document.createElement('div')
    content.className = 'bg-[#12121a] border border-white/10 rounded-2xl p-6 max-w-md w-full transform scale-95 transition-transform duration-300'

    // Close button
    const closeBtn = document.createElement('button')
    closeBtn.className = 'absolute top-4 right-4 text-gray-400 hover:text-white transition-colors'
    closeBtn.innerHTML = ICONS.close
    closeBtn.onclick = () => closeSocialModal()
    content.appendChild(closeBtn)

    // Title
    const title = document.createElement('h3')
    title.className = 'text-white text-xl font-semibold mb-6 text-center'
    title.textContent = 'Choose a Studio'
    content.appendChild(title)

    // Studios list
    const studiosList = document.createElement('div')
    studiosList.className = 'flex flex-col gap-4'

    config.studios.forEach(studio => {
        const studioCard = document.createElement('div')
        studioCard.className = 'bg-white/5 rounded-xl p-4 border border-white/10'

        // Studio header
        const studioHeader = document.createElement('div')
        studioHeader.className = 'flex items-center gap-3 mb-4'

        if (studio.studioLogo) {
            const logo = document.createElement('img')
            logo.src = studio.studioLogo
            logo.alt = studio.studioName
            logo.className = 'h-8 object-contain'
            studioHeader.appendChild(logo)
        }

        const studioName = document.createElement('span')
        studioName.className = 'text-white font-medium'
        studioName.textContent = studio.studioName
        studioHeader.appendChild(studioName)

        studioCard.appendChild(studioHeader)

        // Social links
        const linksRow = document.createElement('div')
        linksRow.className = 'flex flex-wrap gap-2'

        if (studio.discord) {
            const discordBtn = createSocialButton('Discord', ICONS.discord, studio.discord, 'bg-[#5865F2]')
            linksRow.appendChild(discordBtn)
        }

        if (studio.roblox) {
            const robloxBtn = createSocialButton('Roblox', ICONS.roblox, studio.roblox, 'bg-[#E2231A]')
            linksRow.appendChild(robloxBtn)
        }

        if (studio.youtube) {
            const youtubeBtn = createSocialButton('YouTube', ICONS.youtube, studio.youtube, 'bg-[#FF0000]')
            linksRow.appendChild(youtubeBtn)
        }

        studioCard.appendChild(linksRow)
        studiosList.appendChild(studioCard)
    })

    content.appendChild(studiosList)
    modal.appendChild(content)

    // Close on backdrop click
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeSocialModal()
        }
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalElement) {
            closeSocialModal()
        }
    })

    document.body.appendChild(modal)
    modalElement = modal
}

function createSocialButton(label: string, icon: string, href: string, bgColor: string): HTMLElement {
    const btn = document.createElement('a')
    btn.href = href
    btn.target = '_blank'
    btn.rel = 'noopener noreferrer'
    btn.className = `
        flex items-center gap-2 px-4 py-2
        ${bgColor} text-white
        text-sm font-medium
        rounded-lg
        hover:opacity-80
        transition-all duration-200
    `.trim().replace(/\s+/g, ' ')
    btn.innerHTML = `${icon}<span>${label}</span>`
    return btn
}

export function openSocialModal(): void {
    if (modalElement) {
        modalElement.classList.remove('opacity-0', 'pointer-events-none')
        modalElement.classList.add('opacity-100', 'pointer-events-auto')
        const content = modalElement.querySelector('div')
        if (content) {
            content.classList.remove('scale-95')
            content.classList.add('scale-100')
        }
    }
}

export function closeSocialModal(): void {
    if (modalElement) {
        modalElement.classList.remove('opacity-100', 'pointer-events-auto')
        modalElement.classList.add('opacity-0', 'pointer-events-none')
        const content = modalElement.querySelector('div')
        if (content) {
            content.classList.remove('scale-100')
            content.classList.add('scale-95')
        }
    }
}

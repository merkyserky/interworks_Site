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

// SVG Icons (Matching ShareModal style)
const ICONS = {
    discord: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`,
    roblox: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5.164 0L.16 18.928 18.836 24l5.004-18.928L5.164 0zm9.086 14.318l-4.222-1.12 1.12-4.222 4.222 1.12-1.12 4.222z"/></svg>`,
    youtube: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    close: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`
}

export function createSocialModal(config: SocialModalConfig): void {
    // Create modal overlay
    const modal = document.createElement('div')
    modal.id = 'social-modal'
    // Use backdrop-blur-xl and black/80 background like ShareModal
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 opacity-0 pointer-events-none transition-all duration-300'
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
    modal.style.backdropFilter = 'blur(16px)'

    // Modal content
    const content = document.createElement('div')
    // Match ShareModal styles: bg-[#0f0f0f]/90, rounded-[2rem], border-white/10
    content.className = `
        relative w-full max-w-lg 
        bg-[#0f0f0f]/90 border border-white/10 rounded-[2rem] 
        shadow-2xl overflow-hidden ring-1 ring-white/5 
        transform scale-95 transition-all duration-300
    `.trim().replace(/\s+/g, ' ')

    // Modern Header
    const header = document.createElement('div')
    header.className = 'px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md'
    header.innerHTML = `
        <div class="flex flex-col">
            <h2 class="text-xl font-black text-white tracking-tight">Our Studios</h2>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">Connect with us</p>
        </div>
        <button id="social-modal-close" class="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all hover:rotate-90">
            ${ICONS.close}
        </button>
    `
    content.appendChild(header)

    // Scrollable Content Area
    const scrollArea = document.createElement('div')
    scrollArea.className = 'p-8 max-h-[70vh] overflow-y-auto custom-scrollbar'

    const studiosList = document.createElement('div')
    studiosList.className = 'flex flex-col gap-6'

    config.studios.forEach(studio => {
        const studioCard = document.createElement('div')
        studioCard.className = 'group relative overflow-hidden bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition-all p-5'

        // Background hover effect
        const bgGlow = document.createElement('div')
        bgGlow.className = 'absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none'
        studioCard.appendChild(bgGlow)

        // Studio Info
        const infoRow = document.createElement('div')
        infoRow.className = 'relative z-10 flex items-center gap-4 mb-5'

        // Logo Loop
        if (studio.studioLogo) {
            const logoContainer = document.createElement('div')
            logoContainer.className = 'w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 p-2'
            const logo = document.createElement('img')
            logo.src = studio.studioLogo
            logo.alt = studio.studioName
            logo.className = 'w-full h-full object-contain'
            logoContainer.appendChild(logo)
            infoRow.appendChild(logoContainer)
        } else {
            const logoContainer = document.createElement('div')
            logoContainer.className = 'w-12 h-12 rounded-xl bg-violet-600/20 flex items-center justify-center border border-violet-500/20 text-violet-400 font-bold'
            logoContainer.innerText = studio.studioName[0]
            infoRow.appendChild(logoContainer)
        }

        const name = document.createElement('span')
        name.className = 'text-lg font-bold text-white tracking-wide'
        name.textContent = studio.studioName
        infoRow.appendChild(name)

        studioCard.appendChild(infoRow)

        // Social Links Grid
        const linksGrid = document.createElement('div')
        linksGrid.className = 'relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3'

        if (studio.discord) {
            linksGrid.appendChild(createSocialButton('Discord', ICONS.discord, studio.discord, 'bg-[#5865F2] hover:bg-[#4752C4] shadow-lg shadow-[#5865F2]/20'))
        }
        if (studio.roblox) {
            linksGrid.appendChild(createSocialButton('Roblox', ICONS.roblox, studio.roblox, 'bg-black border border-white/10 hover:bg-[#E2231A] hover:border-[#E2231A]'))
        }
        if (studio.youtube) {
            linksGrid.appendChild(createSocialButton('YouTube', ICONS.youtube, studio.youtube, 'bg-black border border-white/10 hover:bg-[#FF0000] hover:border-[#FF0000]'))
        }

        studioCard.appendChild(linksGrid)
        studiosList.appendChild(studioCard)
    })

    scrollArea.appendChild(studiosList)
    content.appendChild(scrollArea)
    modal.appendChild(content)

    // Event Listeners
    const closeBtn = content.querySelector('#social-modal-close') as HTMLElement
    if (closeBtn) closeBtn.onclick = () => closeSocialModal()

    modal.onclick = (e) => {
        if (e.target === modal) closeSocialModal()
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalElement) closeSocialModal()
    })

    document.body.appendChild(modal)
    modalElement = modal
}

function createSocialButton(label: string, icon: string, href: string, classes: string): HTMLElement {
    const btn = document.createElement('a')
    btn.href = href
    btn.target = '_blank'
    btn.rel = 'noopener noreferrer'
    btn.className = `
        flex items-center justify-center gap-2 py-2.5 px-4
        text-white text-sm font-bold rounded-xl
        transition-all duration-200 transform hover:scale-105
        ${classes}
    `.trim().replace(/\s+/g, ' ')
    btn.innerHTML = `${icon}<span class="hidden sm:inline">${label}</span>`
    // Mobile only icon view if needed, but flex-col handles it in parent usually. 
    // Actually let's keep text visible but maybe smaller.

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

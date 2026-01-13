/**
 * Header/Navigation Component
 * Top navigation bar with synced logo carousel, search bar, and user profile dropdown
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

// Search icon SVG
function getSearchIcon(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`
}

// User icon SVG
function getUserIcon(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
}

// Chevron down icon
function getChevronDownIcon(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`
}

// Settings icon
function getSettingsIcon(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`
}

// Profile icon
function getProfileIcon(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>`
}

// Studio icon
function getStudioIcon(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>`
}

// Gamepad icon
function getGamepadIcon(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg>`
}

// Logout icon
function getLogoutIcon(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`
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

    searchWrapper.appendChild(searchIconSpan)
    searchWrapper.appendChild(searchInput)
    searchContainer.appendChild(searchWrapper)

    nav.appendChild(searchContainer)

    // Right section - Nav Links + User Profile
    const rightSection = document.createElement('div')
    rightSection.className = 'flex items-center gap-6'

    // Nav Links
    const navLinksContainer = document.createElement('div')
    navLinksContainer.className = 'flex items-center gap-6'

    navLinks.forEach(link => {
        const a = document.createElement('a')
        a.href = link.href
        a.className = 'text-gray-400 text-sm font-medium tracking-[0.1em] uppercase hover:text-white transition-colors'
        a.textContent = link.label
        navLinksContainer.appendChild(a)
    })

    rightSection.appendChild(navLinksContainer)

    // User Profile Dropdown
    const profileContainer = document.createElement('div')
    profileContainer.className = 'relative'

    const profileButton = document.createElement('button')
    profileButton.className = `
        flex items-center gap-2 px-3 py-2
        bg-white/5 hover:bg-white/10
        border border-white/10 hover:border-white/20
        rounded-xl
        transition-all duration-200
    `.trim().replace(/\s+/g, ' ')

    // User avatar
    const avatar = document.createElement('div')
    avatar.className = `
        w-8 h-8 rounded-full
        bg-gradient-to-br from-violet-500 to-purple-600
        flex items-center justify-center
        text-white
    `.trim().replace(/\s+/g, ' ')
    avatar.innerHTML = getUserIcon()

    const chevron = document.createElement('span')
    chevron.className = 'text-gray-400 transition-transform duration-200'
    chevron.innerHTML = getChevronDownIcon()

    profileButton.appendChild(avatar)
    profileButton.appendChild(chevron)

    // Dropdown menu
    const dropdownMenu = document.createElement('div')
    dropdownMenu.className = `
        absolute right-0 top-full mt-2
        w-56
        bg-[#1a1a1a]/95 backdrop-blur-xl
        border border-white/10
        rounded-xl
        shadow-2xl shadow-black/50
        overflow-hidden
        opacity-0 invisible
        transform translate-y-2
        transition-all duration-200
    `.trim().replace(/\s+/g, ' ')

    // User info section
    const userInfo = document.createElement('div')
    userInfo.className = 'px-4 py-3 border-b border-white/10 bg-white/5'
    userInfo.innerHTML = `
        <p class="text-white font-semibold text-sm">Guest User</p>
        <p class="text-gray-500 text-xs">guest@interworks.dev</p>
    `
    dropdownMenu.appendChild(userInfo)

    // Menu items
    const menuItems = [
        { icon: getProfileIcon(), label: 'Profile', href: '#' },
        { icon: getSettingsIcon(), label: 'Settings', href: '#' },
        { icon: getStudioIcon(), label: 'Your Studios', href: '#' },
        { icon: getGamepadIcon(), label: 'Your Games', href: '#' },
    ]

    const menuContainer = document.createElement('div')
    menuContainer.className = 'py-2'

    menuItems.forEach(item => {
        const menuItem = document.createElement('a')
        menuItem.href = item.href
        menuItem.className = `
            flex items-center gap-3 px-4 py-2.5
            text-gray-300 text-sm
            hover:bg-white/10 hover:text-white
            transition-colors
        `.trim().replace(/\s+/g, ' ')
        menuItem.innerHTML = `
            <span class="text-gray-500">${item.icon}</span>
            <span>${item.label}</span>
        `
        menuContainer.appendChild(menuItem)
    })

    dropdownMenu.appendChild(menuContainer)

    // Sign out section
    const signOutSection = document.createElement('div')
    signOutSection.className = 'border-t border-white/10 py-2'

    const signOutBtn = document.createElement('button')
    signOutBtn.className = `
        flex items-center gap-3 w-full px-4 py-2.5
        text-red-400 text-sm
        hover:bg-red-500/10
        transition-colors
    `.trim().replace(/\s+/g, ' ')
    signOutBtn.innerHTML = `
        <span>${getLogoutIcon()}</span>
        <span>Sign Out</span>
    `
    signOutSection.appendChild(signOutBtn)
    dropdownMenu.appendChild(signOutSection)

    profileContainer.appendChild(profileButton)
    profileContainer.appendChild(dropdownMenu)

    // Toggle dropdown
    let isDropdownOpen = false
    profileButton.onclick = (e) => {
        e.stopPropagation()
        isDropdownOpen = !isDropdownOpen
        if (isDropdownOpen) {
            dropdownMenu.classList.remove('opacity-0', 'invisible', 'translate-y-2')
            dropdownMenu.classList.add('opacity-100', 'visible', 'translate-y-0')
            chevron.classList.add('rotate-180')
        } else {
            dropdownMenu.classList.add('opacity-0', 'invisible', 'translate-y-2')
            dropdownMenu.classList.remove('opacity-100', 'visible', 'translate-y-0')
            chevron.classList.remove('rotate-180')
        }
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        if (isDropdownOpen) {
            isDropdownOpen = false
            dropdownMenu.classList.add('opacity-0', 'invisible', 'translate-y-2')
            dropdownMenu.classList.remove('opacity-100', 'visible', 'translate-y-0')
            chevron.classList.remove('rotate-180')
        }
    })

    rightSection.appendChild(profileContainer)

    nav.appendChild(rightSection)
    header.appendChild(nav)

    return header
}

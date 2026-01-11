/**
 * Carousel Manager
 * Syncs header logo carousel with hero background
 */

export interface CarouselItem {
    logo: {
        type: 'text' | 'image'
        value: string
        alt?: string
    }
    heroBackground: string
    title: string
    description: string
}

export interface CarouselConfig {
    items: ReadonlyArray<CarouselItem>
    interval: number // ms between transitions
}

let currentIndex = 0
const listeners: ((index: number) => void)[] = []

export function initCarousel(config: CarouselConfig): void {
    const { items, interval } = config

    if (items.length <= 1) return

    // Start rotating
    window.setInterval(() => {
        currentIndex = (currentIndex + 1) % items.length
        listeners.forEach(fn => fn(currentIndex))
    }, interval)
}

export function onCarouselChange(callback: (index: number) => void): void {
    listeners.push(callback)
    // Immediately call with current index
    callback(currentIndex)
}

export function getCurrentIndex(): number {
    return currentIndex
}

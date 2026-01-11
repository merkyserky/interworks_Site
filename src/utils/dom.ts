/**
 * DOM Utility Functions
 * Helper functions for DOM manipulation
 */

/**
 * Safely get an element by ID with type assertion
 */
export function getElementById<T extends HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null
}

/**
 * Create an HTML element with optional attributes and classes
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    options?: {
        id?: string
        className?: string
        innerHTML?: string
        attributes?: Record<string, string>
    }
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag)

    if (options?.id) element.id = options.id
    if (options?.className) element.className = options.className
    if (options?.innerHTML) element.innerHTML = options.innerHTML
    if (options?.attributes) {
        Object.entries(options.attributes).forEach(([key, value]) => {
            element.setAttribute(key, value)
        })
    }

    return element
}

/**
 * Append multiple children to a parent element
 */
export function appendChildren(parent: HTMLElement, ...children: HTMLElement[]): void {
    children.forEach(child => parent.appendChild(child))
}

/**
 * Run callback when DOM is ready
 */
export function onDOMReady(callback: () => void): void {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback)
    } else {
        callback()
    }
}

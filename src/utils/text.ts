/**
 * Text parsing and formatting utilities
 */

/**
 * Parses rich text strings for custom tags like <game:slug>Text</game>
 * @param text The input text string
 * @returns HTML string with tags replaced by interactive elements
 */
export function parseRichText(text: string | undefined): string {
    if (!text) return '';

    // Replace <game:slug>Text</game> with a premium highlighted button
    // Using window.openGameDetailBySlug which is defined in app.ts
    return text.replace(/<game:([^>]+)>(.*?)<\/game>/g, (_, slug, content) => {
        return `<button onclick="event.stopPropagation(); if (window.openGameDetailBySlug) window.openGameDetailBySlug('${slug}')" class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-600/20 text-violet-400 font-bold rounded-lg border border-violet-500/30 hover:bg-violet-600/30 hover:border-violet-500/50 hover:text-white transition-all text-[10px] uppercase tracking-wider mx-1 align-middle whitespace-nowrap shadow-lg shadow-violet-900/10">
            <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/></svg>
            ${content}
        </button>`;
    });
}

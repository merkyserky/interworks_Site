
export const api = {
    async get<T>(path: string): Promise<T> {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
        return res.json();
    },
    async post<T>(path: string, data: any): Promise<T> {
        const res = await fetch(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
        return res.json();
    },
    async put<T>(path: string, data: any): Promise<T> {
        const res = await fetch(path, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
        return res.json();
    },
    async delete(path: string): Promise<void> {
        const res = await fetch(path, { method: 'DELETE' });
        if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
    },
    logout() {
        window.location.href = '/api/logout';
    }
};

// Types
export interface SpotifyAlbum { name: string; spotifyId: string; }

export type EventIcon = 'rocket' | 'star' | 'calendar' | 'clock' | 'gift' | 'fire' | 'sparkles' | 'trophy';

export interface GameEvent {
    id: string;
    type: 'countdown' | 'event' | 'announcement';
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    color: string;
    icon?: EventIcon;
    showOnCard?: boolean;
    showOnHero?: boolean;
    showCountdown?: boolean;
    active: boolean;
    priority?: number;
}

export interface Game {
    id: string;
    name: string;
    logo: string;
    description: string;
    ownedBy: string;
    status: 'coming-soon' | 'playable' | 'beta' | 'in-development';
    genres: string[];
    youtubeVideoId?: string;
    thumbnails?: string[];
    spotifyAlbums?: SpotifyAlbum[];
    link?: string;
    order?: number;
    visible?: boolean;
    events?: GameEvent[];
}

export interface Studio {
    id: string;
    name: string;
    description?: string;
    logo?: string;
    thumbnail?: string;
    hero?: boolean;
    media?: string[];
    discord?: string;
    roblox?: string;
    youtube?: string;
}

export interface User {
    username: string;
    role: 'admin' | 'user';
    allowedStudios: string[];
    password?: string; // Optional for creating/editing
}

export interface Notification {
    id: string;
    gameId: string;
    title: string;
    description: string;
    countdownTo?: string;
    youtubeVideoId?: string;
    link?: string;
    active: boolean;
}

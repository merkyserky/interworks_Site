// Panel Dashboard - AstralCore
// Improved editor with genres array and notifications management

interface SpotifyAlbum { name: string; spotifyId: string; }
interface GameNotif { id: string; gameId: string; title: string; description: string; countdownTo: string; youtubeVideoId?: string; link?: string; active: boolean; }
interface Game { id: string; name: string; logo: string; description: string; ownedBy: string; status: 'coming-soon' | 'playable' | 'beta' | 'in-development'; genres: string[]; youtubeVideoId?: string; thumbnails?: string[]; spotifyAlbums?: SpotifyAlbum[]; link?: string; order?: number; visible?: boolean; }
interface Studio { id: string; name: string; description?: string; logo?: string; thumbnail?: string; hero?: boolean; media?: string[]; discord?: string; roblox?: string; youtube?: string; }
interface User { username: string; role: 'admin' | 'user'; allowedStudios: string[]; password?: string; } // Password optional in frontend type


// Theme
function getTheme(): 'light' | 'dark' {
  const cookie = document.cookie.split('; ').find(row => row.startsWith('theme='));
  return (cookie ? cookie.split('=')[1] : 'light') as 'light' | 'dark';
}
function toggleTheme() {
  const current = getTheme();
  const next = current === 'light' ? 'dark' : 'light';
  document.cookie = `theme=${next}; path=/; max-age=31536000`; // 1 year
  applyTheme();
  render(); // Re-render to update icon if needed, though icon is in header which is static mostly but we re-render header now
}
function applyTheme() {
  const theme = getTheme();
  if (theme === 'dark') document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
}

// State
let games: Game[] = [];
let studios: Studio[] = [];
let notifications: GameNotif[] = [];
let mediaFiles: string[] = [];
let users: User[] = [];
let currentUser: User | null = null;
let currentView: 'games' | 'notifications' | 'users' | 'studios' = 'games';
let currentStudio = 'all';
let editingGame: Game | null = null;
let editingNotification: GameNotif | null = null;
let editingUser: User | null = null;
let editingStudio: Studio | null = null;
let mediaPickerTarget: string | null = null;
let isDark = getTheme() === 'dark'; // Simplify access for render

// Apply immediately
applyTheme();

// API with error handling
const api = {
  async get<T>(path: string): Promise<T> {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return res.json();
  },
  async post<T>(path: string, data: unknown): Promise<T> {
    const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
    return res.json();
  },
  async put<T>(path: string, data: unknown): Promise<T> {
    const res = await fetch(path, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
    return res.json();
  },
  async del(path: string): Promise<void> {
    const res = await fetch(path, { method: 'DELETE' });
    if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
  },
};

// Helpers
const statusColors: Record<string, string> = { 'playable': 'bg-green-100 text-green-700', 'coming-soon': 'bg-yellow-100 text-yellow-700', 'beta': 'bg-blue-100 text-blue-700', 'in-development': 'bg-purple-100 text-purple-700' };
const statusLabels: Record<string, string> = { 'playable': 'Playable', 'coming-soon': 'Coming Soon', 'beta': 'Beta', 'in-development': 'In Development' };
const getFilteredGames = () => {
  let g = games;
  // Filter by allowed studios first
  if (currentUser?.role !== 'admin' && !currentUser?.allowedStudios.includes('*')) {
    g = g.filter(game => currentUser?.allowedStudios.includes(game.ownedBy));
  }
  // Then filter by selected studio
  return currentStudio === 'all' ? g : g.filter(game => game.ownedBy === studios.find(s => s.id === currentStudio)?.name);
};

const hasPermission = (studioName: string) => {
  if (!currentUser) return false;
  if (currentUser.role === 'admin') return true;
  if (currentUser.allowedStudios.includes('*')) return true;
  return currentUser.allowedStudios.includes(studioName);
};

// Components
function GameCard(game: Game): string {
  const canEdit = hasPermission(game.ownedBy);
  const statusBadge: Record<string, { bg: string; text: string }> = {
    'playable': { bg: 'bg-green-500', text: 'Live' },
    'coming-soon': { bg: 'bg-amber-500', text: 'Soon' },
    'beta': { bg: 'bg-blue-500', text: 'Beta' },
    'in-development': { bg: 'bg-purple-500', text: 'Dev' }
  };
  const badge = statusBadge[game.status] || { bg: 'bg-gray-500', text: game.status };

  return `
	<div class="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer" onclick="editGame('${game.id}')">
		<div class="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
			<img src="${game.logo}" alt="${game.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onerror="this.style.display='none'">
			<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
			<div class="absolute top-3 right-3">
				<span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${badge.bg} text-white shadow-lg">${badge.text}</span>
			</div>
			${canEdit ? `
			<div class="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
				<button onclick="event.stopPropagation(); editGame('${game.id}')" class="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-lg shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors">
					<svg class="w-4 h-4 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
				</button>
				<button onclick="event.stopPropagation(); deleteGame('${game.id}')" class="p-2 bg-red-500/90 backdrop-blur rounded-lg shadow-lg hover:bg-red-600 transition-colors">
					<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
				</button>
			</div>
			` : ''}
		</div>
		<div class="p-4">
			<div class="flex items-start justify-between gap-2 mb-2">
				<h3 class="font-bold text-gray-900 dark:text-white truncate">${game.name}</h3>
				${game.visible !== false ? '' : '<span class="flex-shrink-0 text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded">Hidden</span>'}
			</div>
			<p class="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
				<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
				${game.ownedBy}
			</p>
			<div class="flex flex-wrap gap-1">
				${game.genres.slice(0, 2).map(g => `<span class="px-2 py-0.5 text-[10px] font-medium rounded-md bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">${g}</span>`).join('')}
			</div>
		</div>
	</div>`;
}

function NotificationCard(notif: GameNotif): string {
  const game = games.find(g => g.id === notif.gameId);
  const countdown = notif.countdownTo ? new Date(notif.countdownTo) : null;
  const isExpired = countdown ? countdown.getTime() < Date.now() : false;
  const now = Date.now();
  const canEdit = game ? hasPermission(game.ownedBy) : false;
  let timeDisplay = '';

  if (countdown) {
    const diff = countdown.getTime() - now;
    const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
    timeDisplay = !isExpired
      ? `<div class="bg-violet-50 text-violet-700 font-semibold px-2 py-1 rounded">${days}d ${hours}h</div>`
      : '';
  }

  return `
	<div class="bg-white dark:bg-[#1a1a1a] dark:border-gray-700 rounded-xl border ${notif.active ? 'border-violet-200 dark:border-violet-900' : 'border-gray-200 dark:border-gray-700'} overflow-hidden ${isExpired ? 'opacity-50' : ''}">
		<div class="flex gap-4 p-4">
			<div class="flex-shrink-0">
				${game?.logo ? `<img src="${game.logo}" alt="${game.name}" class="w-16 h-16 rounded-xl object-contain bg-gray-100 dark:bg-gray-800">` : '<div class="w-16 h-16 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center"><svg class="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div>'}
			</div>
			<div class="flex-1 min-w-0">
				<div class="flex justify-between items-start">
					<div>
						<h3 class="font-semibold text-gray-900 dark:text-white">${notif.title}</h3>
						<p class="text-sm text-violet-600 dark:text-violet-400 font-medium">${game?.name || 'Unknown Game'}</p>
					</div>
					<div class="flex gap-1">
						${canEdit ? `
						<button onclick="editNotification('${notif.id}')" class="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
						<button onclick="deleteNotification('${notif.id}')" class="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
						` : ''}
					</div>
				</div>
				<p class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">${notif.description}</p>
			</div>
		</div>
		<div class="px-4 pb-4 flex items-center gap-3">
			<div class="flex-1 flex items-center gap-2 text-xs">
				${timeDisplay}
				${countdown ? `<span class="text-gray-400">${countdown.toLocaleDateString()} ${countdown.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>` : '<span class="text-gray-400 italic">No date set</span>'}
			</div>
			<span class="px-2 py-0.5 rounded-full text-xs font-medium ${notif.active ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}">${notif.active ? 'Active' : 'Inactive'}</span>
			${isExpired ? '<span class="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Expired</span>' : ''}
		</div>
	</div>`;
}

function UserCard(user: User): string {
  return `
    <div class="bg-white dark:bg-[#1a1a1a] dark:border-gray-700 rounded-xl border border-gray-200 p-4 flex items-center justify-between">
        <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">${user.username}</h3>
             <span class="px-2 py-0.5 text-xs font-medium rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'}">${user.role}</span>
             <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Access: ${user.allowedStudios.includes('*') ? 'All Studios' : user.allowedStudios.join(', ')}</p>
        </div>
        <div class="flex gap-2">
            <button onclick="editUser('${user.username}')" class="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
            <button onclick="deleteUser('${user.username}')" class="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
        </div>
    </div>
    `;
}

function StudioCard(studio: Studio): string {
  return `
    <div class="bg-white dark:bg-[#1a1a1a] dark:border-gray-700 rounded-xl border border-gray-200 p-4 relative group">
        <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
             ${hasPermission(studio.name) ? `<button onclick="editStudio('${studio.id}')" class="p-2 bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg shadow-sm border dark:border-gray-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>` : ''}
             ${currentUser?.role === 'admin' ? `<button onclick="deleteStudio('${studio.id}')" class="p-2 bg-red-500 text-white hover:bg-red-600 rounded-lg shadow-sm"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>` : ''}
        </div>
        <div class="flex items-center gap-4 mb-4">
             <div class="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border dark:border-gray-700">
                 ${studio.logo ? `<img src="${studio.logo}" class="w-full h-full object-cover">` : `<span class="text-2xl font-bold text-gray-400">${studio.name.charAt(0)}</span>`}
             </div>
             <div>
                 <h3 class="text-lg font-bold text-gray-900 dark:text-white">${studio.name}</h3>
                 <p class="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: ${studio.id}</p>
                 ${studio.hero ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Hero Front Page</span>' : ''}
             </div>
        </div>
        ${studio.thumbnail ? `<div class="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-3"><img src="${studio.thumbnail}" class="w-full h-full object-cover"></div>` : ''}
        <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">${studio.description || 'No description'}</p>
        <div class="flex gap-2">
            ${['discord', 'roblox', 'youtube'].filter(k => (studio as any)[k]).map(k => `<a href="${(studio as any)[k]}" target="_blank" class="text-gray-400 hover:text-violet-600 dark:hover:text-violet-400"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg></a>`).join('')}
        </div>
    </div>
    `;
}

function GameEditor(game: Game | null): string {
  if (!game) return '';
  const isNew = game.id.startsWith('new-');
  // Filter studios for dropdown based on permissions
  const allowedStudios = studios.filter(s => hasPermission(s.name));

  return `
	<div id="game-editor" class="fixed inset-0 z-50 flex items-center justify-center p-4" onclick="if(event.target===this)closeEditor()">
		<div class="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border dark:border-gray-700">
			<div class="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white">${isNew ? 'Add Game' : 'Edit Game'}</h2>
				<button onclick="closeEditor()" class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
			</div>
			<div class="flex-1 overflow-auto p-6 space-y-4">
				<div class="grid grid-cols-2 gap-4">
					<div class="col-span-2"><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label><input id="ed-name" value="${game.name}" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"></div>
					<div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Studio *</label><select id="ed-ownedBy" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">${allowedStudios.map(s => `<option value="${s.name}" ${game.ownedBy === s.name ? 'selected' : ''}>${s.name}</option>`).join('')}</select></div>
					<div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select id="ed-status" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"><option value="coming-soon" ${game.status === 'coming-soon' ? 'selected' : ''}>Coming Soon</option><option value="in-development" ${game.status === 'in-development' ? 'selected' : ''}>In Development</option><option value="beta" ${game.status === 'beta' ? 'selected' : ''}>Beta</option><option value="playable" ${game.status === 'playable' ? 'selected' : ''}>Playable</option></select></div>
				</div>
				<div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Genres (comma separated)</label><input id="ed-genres" value="${game.genres.join(', ')}" placeholder="Horror, Mystery, Adventure" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"></div>
				<div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea id="ed-description" rows="3" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white">${game.description}</textarea></div>
				<div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo / Image</label><div class="flex gap-2"><input id="ed-logo" value="${game.logo}" class="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"><button onclick="openMedia('ed-logo')" class="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-200">📷</button></div></div>
				<div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thumbnails (comma separated)</label><div class="flex gap-2"><input id="ed-thumbnails" value="${(game.thumbnails || []).join(', ')}" class="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"><button onclick="openMedia('ed-thumbnails',true)" class="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-200">📷</button></div></div>
				<div class="grid grid-cols-2 gap-4">
					<div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">YouTube Video ID</label><input id="ed-youtube" value="${game.youtubeVideoId || ''}" placeholder="dQw4w9WgXcQ" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"></div>
					<div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Game Link</label><input id="ed-link" value="${game.link || ''}" placeholder="https://roblox.com/games/..." class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"></div>
				</div>
                <div class="grid grid-cols-2 gap-4">
					<div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort Order (Lower = First)</label><input type="number" id="ed-order" value="${game.order ?? 0}" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"></div>
					<div class="flex items-center mt-6"><label class="flex items-center gap-2"><input type="checkbox" id="ed-visible" ${game.visible !== false ? 'checked' : ''} class="w-4 h-4 text-violet-600 rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"><span class="text-sm font-medium text-gray-700 dark:text-gray-300">Visible on Main Site</span></label></div>
				</div>
				<div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Spotify Albums (JSON array)</label><textarea id="ed-spotify" rows="2" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 resize-none font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">${JSON.stringify(game.spotifyAlbums || [])}</textarea><p class="text-xs text-gray-400 mt-1">[{"name":"OST","spotifyId":"abc123"}]</p></div>
			</div>
			<div class="px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3">
				<button onclick="closeEditor()" class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200">Cancel</button>
				<button onclick="saveGameData()" class="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">${isNew ? 'Create' : 'Save'}</button>
			</div>
		</div>
	</div>`;
}

function NotificationEditor(notif: GameNotif | null): string {
  if (!notif) return '';
  const isNew = notif.id.startsWith('new-');
  const dateValue = notif.countdownTo ? new Date(notif.countdownTo).toISOString().slice(0, 16) : '';

  // Filter games based on permission
  const allowedGames = games.filter(g => hasPermission(g.ownedBy));

  return `
	<div id="notif-editor" class="fixed inset-0 z-50 flex items-center justify-center p-4" onclick="if(event.target===this)closeNotifEditor()">
		<div class="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border dark:border-gray-700">
			<div class="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white">${isNew ? 'Add Notification' : 'Edit Notification'}</h2>
				<button onclick="closeNotifEditor()" class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
			</div>
			<div class="p-6 space-y-4">
				<div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Game *</label><select id="nf-gameId" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">${allowedGames.map(g => `<option value="${g.id}" ${notif.gameId === g.id ? 'selected' : ''}>${g.name}</option>`).join('')}</select></div>
				<div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label><input id="nf-title" value="${notif.title}" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"></div>
				<div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea id="nf-description" rows="2" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white">${notif.description}</textarea></div>
				<div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Countdown To *</label><input type="datetime-local" id="nf-countdown" value="${dateValue}" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"></div>
				<div class="grid grid-cols-2 gap-4">
					<div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">YouTube Video ID</label><input id="nf-youtube" value="${notif.youtubeVideoId || ''}" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"></div>
					<div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link</label><input id="nf-link" value="${notif.link || ''}" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"></div>
				</div>
				<label class="flex items-center gap-2"><input type="checkbox" id="nf-active" ${notif.active ? 'checked' : ''} class="w-4 h-4 text-violet-600 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"><span class="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span></label>
			</div>
			<div class="px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3">
				<button onclick="closeNotifEditor()" class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200">Cancel</button>
				<button onclick="saveNotifData()" class="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">${isNew ? 'Create' : 'Save'}</button>
			</div>
		</div>
	</div>`;
}

function UserEditor(user: User | null): string {
  if (!user) return '';
  const isNew = !users.find(u => u.username === user.username);

  return `
    <div id="user-editor" class="fixed inset-0 z-50 flex items-center justify-center p-4" onclick="if(event.target===this)closeUserEditor()">
        <div class="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border dark:border-gray-700">
            <div class="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">${isNew ? 'New User' : 'Edit User: ' + user.username}</h2>
                <button onclick="closeUserEditor()" class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400">✕</button>
            </div>
            <div class="p-6 space-y-4">
                ${isNew ? `<div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username *</label><input id="us-username" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"></div>` : ''}
                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password ${isNew ? '*' : '(Leave blank to keep)'}</label><input type="password" id="us-password" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"></div>
                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label><select id="us-role" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"><option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option><option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option></select></div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allowed Studios</label>
                    <div class="space-y-2 max-h-40 overflow-y-auto border dark:border-gray-600 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <label class="flex items-center gap-2">
                            <input type="checkbox" name="us-studios" value="*" ${user.allowedStudios.includes('*') ? 'checked' : ''} onchange="toggleAllStudios(this)" class="w-4 h-4 text-violet-600 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">All Studios</span>
                        </label>
                        ${studios.map(s => `
                            <label class="flex items-center gap-2 pl-4">
                                <input type="checkbox" name="us-studios" value="${s.name}" ${user.allowedStudios.includes(s.name) || user.allowedStudios.includes('*') ? 'checked' : ''} class="w-4 h-4 text-violet-600 rounded studio-check border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                                <span class="text-sm text-gray-700 dark:text-gray-300">${s.name}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3">
                <button onclick="closeUserEditor()" class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200">Cancel</button>
                <button onclick="saveUserData()" class="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">Save</button>
            </div>
        </div>
    </div>
    `;
}

function StudioEditor(studio: Studio | null): string {
  if (!studio) return '';
  const isNew = !studios.find(s => s.id === studio.id);

  return `
    <div id="studio-editor" class="fixed inset-0 z-50 flex items-center justify-center p-4" onclick="if(event.target===this)closeStudioEditor()">
        <div class="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border dark:border-gray-700">
            <div class="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">${isNew ? 'New Studio' : 'Edit Studio'}</h2>
                <button onclick="closeStudioEditor()" class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400">✕</button>
            </div>
            <div class="flex-1 overflow-auto p-6 space-y-4">
                <div class="grid grid-cols-2 gap-4">
                     ${isNew ? `<div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID (unique) *</label><input id="st-id" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"></div>` : `<div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID</label><input disabled value="${studio.id}" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"></div>`}
                    <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label><input id="st-name" value="${studio.name}" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"></div>
                </div>
                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea id="st-description" rows="2" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white">${studio.description || ''}</textarea></div>
                <div class="grid grid-cols-2 gap-4">
                     <div>
                         <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo</label>
                         <div class="flex gap-2"><input id="st-logo" value="${studio.logo || ''}" class="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"><button onclick="openMedia('st-logo')" class="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg">📷</button></div>
                     </div>
                     <div>
                         <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thumbnail</label>
                         <div class="flex gap-2"><input id="st-thumbnail" value="${studio.thumbnail || ''}" class="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"><button onclick="openMedia('st-thumbnail')" class="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg">📷</button></div>
                     </div>
                </div>
                 <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Media (comma separated)</label><div class="flex gap-2"><input id="st-media" value="${(studio.media || []).join(', ')}" class="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"><button onclick="openMedia('st-media',true)" class="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg">📷</button></div></div>
                <hr class="my-2 dark:border-gray-600">
                 <div class="grid grid-cols-3 gap-4">
                    <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discord Link</label><input id="st-discord" value="${studio.discord || ''}" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"></div>
                    <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Roblox Link</label><input id="st-roblox" value="${studio.roblox || ''}" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"></div>
                    <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">YouTube Link</label><input id="st-youtube" value="${studio.youtube || ''}" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"></div>
                </div>
                <label class="flex items-center gap-2 mt-2">
                     <input type="checkbox" id="st-hero" ${studio.hero ? 'checked' : ''} class="w-4 h-4 text-violet-600 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                     <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Display on Hero Front Page</span>
                </label>
            </div>
            <div class="px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3">
                <button onclick="closeStudioEditor()" class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200">Cancel</button>
                <button onclick="saveStudioData()" class="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">Save</button>
            </div>
        </div>
    </div>
    `;
}

function MediaPicker(): string {
  return `
	<div id="media-picker" class="fixed inset-0 z-[60] hidden">
		<div class="absolute inset-0 bg-black/50" onclick="closeMedia()"></div>
		<div class="absolute inset-8 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden flex flex-col border dark:border-gray-700">
			<div class="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center"><h2 class="font-semibold text-gray-900 dark:text-white">Select Media</h2><button onclick="closeMedia()" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400">✕</button></div>
            
            <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                 <div class="flex gap-2">
                     <input id="media-custom-url" placeholder="https://..." class="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                     <button onclick="pickMedia(document.getElementById('media-custom-url').value)" class="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">Use URL</button>
                 </div>
            </div>

			<div class="flex-1 overflow-auto p-6 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4 bg-white dark:bg-[#1a1a1a]">
				${mediaFiles.map(f => `<button onclick="pickMedia('${f}')" class="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-transparent hover:border-violet-500"><img src="${f}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<div class=\\'flex items-center justify-center h-full text-xs text-gray-400 p-2 break-all\\'>${f.split('/').pop()}</div>'"></button>`).join('')}
			</div>
		</div>
	</div>`;
}

function render() {
  const filtered = getFilteredGames();
  const activeNotifs = notifications.filter(n => n.active && new Date(n.countdownTo).getTime() > Date.now());

  let mainContent = '';

  if (currentView === 'games') {
    const visibleStudios = studios.filter(s => hasPermission(s.name));
    const playableCount = filtered.filter(g => g.status === 'playable').length;
    const devCount = filtered.filter(g => g.status === 'in-development' || g.status === 'beta').length;

    mainContent = `
			<main class="flex-1 p-6 lg:p-8 bg-gray-50 dark:bg-[#0a0a0a] overflow-auto">
				<!-- Stats Row -->
				<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					<div class="bg-white dark:bg-[#1a1a1a] rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
						<div class="flex items-center gap-3">
							<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
								<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
							</div>
							<div>
								<p class="text-2xl font-bold text-gray-900 dark:text-white">${filtered.length}</p>
								<p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Games</p>
							</div>
						</div>
					</div>
					<div class="bg-white dark:bg-[#1a1a1a] rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
						<div class="flex items-center gap-3">
							<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
								<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
							</div>
							<div>
								<p class="text-2xl font-bold text-gray-900 dark:text-white">${playableCount}</p>
								<p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Playable</p>
							</div>
						</div>
					</div>
					<div class="bg-white dark:bg-[#1a1a1a] rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
						<div class="flex items-center gap-3">
							<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
								<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
							</div>
							<div>
								<p class="text-2xl font-bold text-gray-900 dark:text-white">${devCount}</p>
								<p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">In Progress</p>
							</div>
						</div>
					</div>
					<div class="bg-white dark:bg-[#1a1a1a] rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
						<div class="flex items-center gap-3">
							<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
								<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
							</div>
							<div>
								<p class="text-2xl font-bold text-gray-900 dark:text-white">${visibleStudios.length}</p>
								<p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Studios</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Header with filters -->
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Games</h1>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your game collection</p>
                    </div>
                    <button onclick="newGame()" class="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-500 hover:to-purple-500 font-semibold shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                        New Game
                    </button>
                </div>

				<!-- Studio Filter Tabs -->
				<div class="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
					<button onclick="setStudio('all')" class="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${currentStudio === 'all' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25' : 'bg-white dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700'}">
						All Studios
					</button>
					${visibleStudios.map(s => `
						<button onclick="setStudio('${s.id}')" class="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${currentStudio === s.id ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25' : 'bg-white dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700'}">
							${s.logo ? `<img src="${s.logo}" class="w-5 h-5 rounded object-cover">` : ''}
							${s.name}
						</button>
					`).join('')}
				</div>
				
                ${filtered.length > 0 ?
        `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">${filtered.map(GameCard).join('')}</div>` :
        `<div class="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div class="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">No games yet</h3>
                        <p class="text-gray-500 dark:text-gray-400 mt-1 max-w-sm">Get started by creating your first game.</p>
                        <button onclick="newGame()" class="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 text-sm font-medium">Create Game</button>
                    </div>`
      }
			</main>`;
  } else if (currentView === 'notifications') {
    mainContent = `
            <main class="flex-1 p-6 lg:p-8 bg-gray-50 dark:bg-[#0a0a0a] overflow-auto">
				<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
					<div>
						<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h1>
						<p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">${notifications.length} total · ${activeNotifs.length} active</p>
					</div>
					<button onclick="newNotification()" class="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-500 hover:to-purple-500 font-semibold shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
						New Announcement
					</button>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">${notifications.map(NotificationCard).join('')}</div>
			</main>`;
  } else if (currentView === 'users' && currentUser?.role === 'admin') {
    mainContent = `
            <main class="flex-1 p-6 lg:p-8 bg-gray-50 dark:bg-[#0a0a0a] overflow-auto">
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Team Members</h1>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">${users.length} users with panel access</p>
                    </div>
                    <button onclick="newUser()" class="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-500 hover:to-purple-500 font-semibold shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
						Add User
					</button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">${users.map(UserCard).join('')}</div>
            </main>
      `;
  } else if (currentView === 'studios') {
    mainContent = `
            <main class="flex-1 p-6 lg:p-8 bg-gray-50 dark:bg-[#0a0a0a] overflow-auto">
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Studios</h1>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">${studios.length} registered studios</p>
                    </div>
                    ${currentUser?.role === 'admin' ? `<button onclick="newStudio()" class="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-500 hover:to-purple-500 font-semibold shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
						Add Studio
					</button>` : ''}
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">${studios.map(StudioCard).join('')}</div>
            </main>
      `;
  }

  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
	<div class="min-h-screen flex flex-col dark:bg-[#121212]">
		<header class="bg-white dark:bg-[#1a1a1a] dark:border-gray-700 border-b sticky top-0 z-40">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center"><svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg></div>
					<span class="font-semibold text-gray-900 dark:text-gray-100 hidden sm:block">AstralCore Panel</span>
				</div>
				<div class="flex items-center gap-2">
                    <button onclick="toggleTheme()" class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                        ${getTheme() === 'dark'
      ? `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`
      : `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>`}
                    </button>
					<button onclick="setView('games')" class="px-3 py-1.5 text-sm font-medium rounded-lg ${currentView === 'games' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}">Games</button>
					<button onclick="setView('notifications')" class="px-3 py-1.5 text-sm font-medium rounded-lg relative ${currentView === 'notifications' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}">Announcements${activeNotifs.length > 0 ? `<span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">${activeNotifs.length}</span>` : ''}</button>
                    ${currentUser?.role === 'admin' ? `<button onclick="setView('users')" class="px-3 py-1.5 text-sm font-medium rounded-lg ${currentView === 'users' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}">Users</button>` : ''}
                    <button onclick="setView('studios')" class="px-3 py-1.5 text-sm font-medium rounded-lg ${currentView === 'studios' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}">Studios</button>
					
					<!-- User Profile Dropdown -->
					<div class="relative ml-2" id="profile-dropdown-container">
						<button onclick="toggleProfileDropdown(event)" class="flex items-center gap-2 px-2 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl transition-all">
							<div class="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
								${currentUser?.username?.charAt(0).toUpperCase() || 'U'}
							</div>
							<span class="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">${currentUser?.username || 'User'}</span>
							<svg id="profile-chevron" class="w-4 h-4 text-gray-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9 6 6 6-6"/></svg>
						</button>
						
						<div id="profile-dropdown-menu" class="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden opacity-0 invisible translate-y-2 transition-all duration-200 z-50">
							<!-- User info -->
							<div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
								<p class="text-sm font-semibold text-gray-900 dark:text-white">${currentUser?.username || 'User'}</p>
								<p class="text-xs text-gray-500 dark:text-gray-400 capitalize">${currentUser?.role || 'user'} Account</p>
							</div>
							
							<!-- Menu items -->
							<div class="py-1">
								<a href="#" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
									<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>
									<span>Profile</span>
								</a>
								<a href="#" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
									<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
									<span>Settings</span>
								</a>
								<a href="#" onclick="setView('studios'); closeProfileDropdown();" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
									<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
									<span>Your Studios</span>
								</a>
								<a href="#" onclick="setView('games'); closeProfileDropdown();" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
									<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg>
									<span>Your Games</span>
								</a>
							</div>
							
							<!-- Sign out -->
							<div class="border-t border-gray-100 dark:border-gray-700 py-1">
								<a href="/api/logout" class="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
									<span>Sign Out</span>
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</header>
		<div class="flex-1 flex dark:bg-[#121212]">
			${mainContent}
		</div>
	</div>
	${GameEditor(editingGame)}
	${NotificationEditor(editingNotification)}
    ${UserEditor(editingUser)}
    ${StudioEditor(editingStudio)}
	${MediaPicker()}
	`;
}

// Actions
(window as any).toggleTheme = toggleTheme;
(window as any).setView = (v: 'games' | 'notifications' | 'users' | 'studios') => { currentView = v; render(); };
(window as any).setStudio = (id: string) => { currentStudio = id; render(); };

// Profile dropdown functions
let profileDropdownOpen = false;
(window as any).toggleProfileDropdown = (e: Event) => {
  e.stopPropagation();
  profileDropdownOpen = !profileDropdownOpen;
  const menu = document.getElementById('profile-dropdown-menu');
  const chevron = document.getElementById('profile-chevron');
  if (menu && chevron) {
    if (profileDropdownOpen) {
      menu.classList.remove('opacity-0', 'invisible', 'translate-y-2');
      menu.classList.add('opacity-100', 'visible', 'translate-y-0');
      chevron.classList.add('rotate-180');
    } else {
      menu.classList.add('opacity-0', 'invisible', 'translate-y-2');
      menu.classList.remove('opacity-100', 'visible', 'translate-y-0');
      chevron.classList.remove('rotate-180');
    }
  }
};
(window as any).closeProfileDropdown = () => {
  profileDropdownOpen = false;
  const menu = document.getElementById('profile-dropdown-menu');
  const chevron = document.getElementById('profile-chevron');
  if (menu && chevron) {
    menu.classList.add('opacity-0', 'invisible', 'translate-y-2');
    menu.classList.remove('opacity-100', 'visible', 'translate-y-0');
    chevron.classList.remove('rotate-180');
  }
};
// Close dropdown when clicking outside
document.addEventListener('click', () => {
  if (profileDropdownOpen) {
    (window as any).closeProfileDropdown();
  }
});

(window as any).newGame = () => {
  // Default studio to first allowed studio
  const allowed = studios.filter(s => hasPermission(s.name));
  if (allowed.length === 0 && currentUser?.role !== 'admin' && !currentUser?.allowedStudios.includes('*')) {
    alert("You don't have permission to create games for any studios.");
    return;
  }
  const defaultStudioName = allowed.length > 0 ? allowed[0].name : (studios[0]?.name || '');

  editingGame = { id: `new-${Date.now()}`, name: '', logo: '', description: '', ownedBy: defaultStudioName, status: 'coming-soon', genres: [] };
  render();
};
(window as any).editGame = (id: string) => { editingGame = games.find(g => g.id === id) || null; render(); };
(window as any).closeEditor = () => { editingGame = null; render(); };
(window as any).deleteGame = async (id: string) => { if (confirm('Delete this game?')) { await api.del(`/api/games/${id}`); games = games.filter(g => g.id !== id); render(); } };

(window as any).saveGameData = async () => {
  if (!editingGame) return;
  const getValue = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || '';
  const game: Game = {
    ...editingGame,
    name: getValue('ed-name'),
    ownedBy: getValue('ed-ownedBy'),
    status: getValue('ed-status') as Game['status'],
    genres: getValue('ed-genres').split(',').map(s => s.trim()).filter(Boolean),
    description: getValue('ed-description'),
    logo: getValue('ed-logo'),
    thumbnails: getValue('ed-thumbnails').split(',').map(s => s.trim()).filter(Boolean),
    youtubeVideoId: getValue('ed-youtube') || undefined,
    link: getValue('ed-link') || undefined,
    spotifyAlbums: (() => { try { return JSON.parse(getValue('ed-spotify') || '[]'); } catch { return []; } })(),
    order: parseInt(getValue('ed-order')) || 0,
    visible: (document.getElementById('ed-visible') as HTMLInputElement)?.checked || false
  };

  // Validate required fields
  if (!game.name.trim()) { alert('Game name is required'); return; }
  if (!game.ownedBy.trim()) { alert('Studio is required'); return; }

  try {
    if (editingGame.id.startsWith('new-')) {
      game.id = `game-${Date.now()}`;
      const created = await api.post<Game>('/api/games', game);
      games.push(created);
    } else {
      const updated = await api.put<Game>(`/api/games/${game.id}`, game);
      const idx = games.findIndex(g => g.id === game.id);
      if (idx !== -1) games[idx] = updated;
    }
    editingGame = null;
    render();
  } catch (e) {
    console.error('Save failed:', e);
    alert('Failed to save game. ' + (e as any).message);
  }
};


(window as any).newNotification = () => {
  // Find first game user can edit
  const allowed = games.filter(g => hasPermission(g.ownedBy));
  if (allowed.length === 0) {
    alert("You don't have access to any games to create an announcement.");
    return;
  }
  editingNotification = { id: `new-${Date.now()}`, gameId: allowed[0].id, title: '', description: '', countdownTo: '', active: true } as GameNotif;
  render();
};
(window as any).editNotification = (id: string) => { editingNotification = notifications.find(n => n.id === id) || null; render(); };
(window as any).closeNotifEditor = () => { editingNotification = null; render(); };
(window as any).deleteNotification = async (id: string) => { if (confirm('Delete?')) { await api.del(`/api/announcements/${id}`); notifications = notifications.filter(n => n.id !== id); render(); } };

(window as any).saveNotifData = async () => {
  if (!editingNotification) return;
  const getValue = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || '';
  const notif: GameNotif = {
    ...editingNotification,
    gameId: getValue('nf-gameId'),
    title: getValue('nf-title'),
    description: getValue('nf-description'),
    countdownTo: new Date(getValue('nf-countdown')).toISOString(),
    youtubeVideoId: getValue('nf-youtube') || undefined,
    link: getValue('nf-link') || undefined,
    active: (document.getElementById('nf-active') as HTMLInputElement)?.checked || false,
  };

  try {
    if (editingNotification.id.startsWith('new-')) { notif.id = `notif-${Date.now()}`; const created = await api.post<GameNotif>('/api/announcements', notif); notifications.push(created); }
    else { const updated = await api.put<GameNotif>(`/api/announcements/${notif.id}`, notif); const idx = notifications.findIndex(n => n.id === notif.id); if (idx !== -1) notifications[idx] = updated; }
    editingNotification = null; render();
  } catch (e) {
    alert('Failed to save announcement. ' + (e as any).message);
  }
};

// User data functions
(window as any).newUser = () => { editingUser = { username: '', role: 'user', allowedStudios: [], password: '' }; render(); };
(window as any).editUser = (username: string) => { editingUser = users.find(u => u.username === username) ? { ...users.find(u => u.username === username)! } : null; render(); }; // shallow copy
(window as any).closeUserEditor = () => { editingUser = null; render(); };
(window as any).deleteUser = async (username: string) => { if (confirm('Delete this user?')) { await api.del(`/api/team/${username}`); users = users.filter(u => u.username !== username); render(); } };
(window as any).toggleAllStudios = (checkbox: HTMLInputElement) => {
  document.querySelectorAll<HTMLInputElement>('input[name="us-studios"]').forEach(el => {
    if (el !== checkbox) el.checked = checkbox.checked;
  });
}
(window as any).saveUserData = async () => {
  if (!editingUser) return;
  const getValue = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || '';
  const isNew = !users.find(u => u.username === editingUser!.username);

  // If new, get username from input. If edit, keep existing.
  const username = isNew ? getValue('us-username') : editingUser.username;
  if (!username) { alert("Username is required"); return; }

  const password = getValue('us-password');
  if (isNew && !password) { alert("Password is required for new users"); return; }

  const role = getValue('us-role') as 'admin' | 'user';
  const studiosEl = document.querySelectorAll<HTMLInputElement>('input[name="us-studios"]:checked');
  const allowedStudios = Array.from(studiosEl).map(el => el.value);

  const userData: User = {
    username,
    role,
    allowedStudios: allowedStudios.includes('*') ? ['*'] : allowedStudios,
    password: password || undefined
  };

  try {
    if (isNew) {
      const created = await api.post<User>('/api/team', userData);
      users.push(created);
    } else {
      const updated = await api.put<User>(`/api/team/${username}`, userData);
      const idx = users.findIndex(u => u.username === username);
      if (idx !== -1) users[idx] = updated;
    }
    editingUser = null;
    render();
  } catch (e) {
    alert("Failed to save user: " + (e as any).message);
  }
}

// Studio data functions
(window as any).newStudio = () => { editingStudio = { id: '', name: '', description: '', logo: '', thumbnail: '', hero: false, media: [], discord: '', roblox: '', youtube: '' }; render(); };
(window as any).editStudio = (id: string) => { editingStudio = studios.find(s => s.id === id) ? { ...studios.find(s => s.id === id)! } : null; render(); };
(window as any).closeStudioEditor = () => { editingStudio = null; render(); };
(window as any).deleteStudio = async (id: string) => { if (confirm('Delete this studio?')) { await api.del(`/api/studios/${id}`); studios = studios.filter(s => s.id !== id); render(); } };

(window as any).saveStudioData = async () => {
  if (!editingStudio) return;
  const getValue = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || '';
  const isNew = !studios.find(s => s.id === editingStudio!.id); // This check is tricky if we allow editing ID. But we generally don't for simplification.
  // In edit mode we disable ID input, so let's check against original.

  // If it's new, we take ID from input. If existing, we take from object.
  const id = isNew ? getValue('st-id') : editingStudio.id;
  if (!id) { alert("ID is required"); return; }

  const studio: Studio = {
    ...editingStudio,
    id: id,
    name: getValue('st-name'),
    description: getValue('st-description'),
    logo: getValue('st-logo'),
    thumbnail: getValue('st-thumbnail'),
    media: getValue('st-media').split(',').map(s => s.trim()).filter(Boolean),
    discord: getValue('st-discord'),
    roblox: getValue('st-roblox'),
    youtube: getValue('st-youtube'),
    hero: (document.getElementById('st-hero') as HTMLInputElement)?.checked || false
  };

  try {
    if (isNew) {
      const created = await api.post<Studio>('/api/studios', studio);
      studios.push(created);
    } else {
      const updated = await api.put<Studio>(`/api/studios/${id}`, studio);
      const idx = studios.findIndex(s => s.id === id);
      if (idx !== -1) studios[idx] = updated;
    }
    editingStudio = null;
    render();
  } catch (e) {
    alert("Failed to save studio: " + (e as any).message);
  }
};

let appendMode = false;
(window as any).openMedia = (targetId: string, append = false) => { mediaPickerTarget = targetId; appendMode = append; document.getElementById('media-picker')?.classList.remove('hidden'); };
(window as any).closeMedia = () => { document.getElementById('media-picker')?.classList.add('hidden'); mediaPickerTarget = null; };
(window as any).pickMedia = (url: string) => {
  if (!url) return;
  if (mediaPickerTarget) {
    const el = document.getElementById(mediaPickerTarget) as HTMLInputElement;
    el.value = appendMode && el.value ? `${el.value}, ${url}` : url;
  }
  (window as any).closeMedia();
};

async function refreshData() {
  // Only refresh if no editors are open to avoid overwriting user input
  if (editingGame || editingNotification || editingUser || editingStudio) return;

  try {
    const results = await Promise.all([
      api.get<Game[]>('/api/games'),
      api.get<Studio[]>('/api/studios'),
      api.get<GameNotif[]>('/api/announcements'),
    ]);

    // Simple check to see if we need to re-render (naive stringify check or just do it)
    // Since re-rendering is cheap here, just do it.
    if (JSON.stringify(games) !== JSON.stringify(results[0]) ||
      JSON.stringify(studios) !== JSON.stringify(results[1]) ||
      JSON.stringify(notifications) !== JSON.stringify(results[2])) {
      games = results[0];
      studios = results[1];
      notifications = results[2];
      render();
    }
  } catch (e) { console.error('Poll failed', e); }
}

// Init
(async () => {
  try {
    const me = await api.get<User>('/api/me');
    currentUser = me;

    const results = await Promise.all([
      api.get<Game[]>('/api/games'),
      api.get<Studio[]>('/api/studios'),
      api.get<GameNotif[]>('/api/announcements'),
      api.get<string[]>('/api/media'),
      currentUser.role === 'admin' ? api.get<User[]>('/api/team') : Promise.resolve(null)
    ]);

    games = results[0];
    studios = results[1];
    notifications = results[2];
    mediaFiles = results[3];
    if (results[4]) users = results[4];

    render();
  } catch (e) {
    if ((e as Error).message.includes('401')) {
      // Redirect handled by browser usually? No, fetch throws 401 but we need to reload to trigger server redirect to login
      window.location.reload();
    }
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `<div class="min-h-screen flex items-center justify-center"><div class="text-center"><p class="text-red-500 mb-4">Error loading panel</p><button onclick="location.reload()" class="px-4 py-2 bg-violet-600 text-white rounded-lg">Retry</button></div></div>`;
  }

  // Start polling
  setInterval(refreshData, 5000);
})();

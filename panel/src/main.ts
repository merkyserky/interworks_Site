// Panel Dashboard - AstralCore
// Improved editor with genres array and notifications management

interface SpotifyAlbum { name: string; spotifyId: string; }
interface GameNotif { id: string; gameId: string; title: string; description: string; countdownTo: string; youtubeVideoId?: string; link?: string; active: boolean; }
interface Game { id: string; name: string; logo: string; description: string; ownedBy: string; status: 'coming-soon' | 'playable' | 'beta' | 'in-development'; genres: string[]; youtubeVideoId?: string; thumbnails?: string[]; spotifyAlbums?: SpotifyAlbum[]; link?: string; }
interface Studio { id: string; name: string; }
interface User { username: string; role: 'admin' | 'user'; allowedStudios: string[]; password?: string; } // Password optional in frontend type

// State
let games: Game[] = [];
let studios: Studio[] = [];
let notifications: GameNotif[] = [];
let mediaFiles: string[] = [];
let users: User[] = [];
let currentUser: User | null = null;
let currentView: 'games' | 'notifications' | 'users' = 'games';
let currentStudio = 'all';
let editingGame: Game | null = null;
let editingNotification: GameNotif | null = null;
let editingUser: User | null = null;
let mediaPickerTarget: string | null = null;

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
  return `
	<div class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
		<div class="aspect-video bg-gray-100 relative">
			<img src="${game.logo}" alt="${game.name}" class="w-full h-full object-cover" onerror="this.style.display='none'">
			<div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2">
				${canEdit ? `
				<button onclick="editGame('${game.id}')" class="opacity-0 group-hover:opacity-100 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
				<button onclick="deleteGame('${game.id}')" class="opacity-0 group-hover:opacity-100 bg-red-500 rounded-full p-3 shadow-lg hover:bg-red-600"><svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
				` : '<span class="opacity-0 group-hover:opacity-100 bg-black/50 text-white px-3 py-1 rounded-full text-xs">Read Only</span>'}
			</div>
		</div>
		<div class="p-4">
			<h3 class="font-semibold text-gray-900 truncate">${game.name}</h3>
			<p class="text-sm text-gray-500 mb-2">${game.ownedBy}</p>
			<div class="flex flex-wrap gap-1.5">
				<span class="px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[game.status] || 'bg-gray-100 text-gray-600'}">${statusLabels[game.status] || game.status}</span>
				${game.genres.slice(0, 2).map(g => `<span class="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">${g}</span>`).join('')}
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
	<div class="bg-white rounded-xl border ${notif.active ? 'border-violet-200' : 'border-gray-200'} overflow-hidden ${isExpired ? 'opacity-50' : ''}">
		<div class="flex gap-4 p-4">
			<div class="flex-shrink-0">
				${game?.logo ? `<img src="${game.logo}" alt="${game.name}" class="w-16 h-16 rounded-xl object-contain bg-gray-100">` : '<div class="w-16 h-16 rounded-xl bg-violet-100 flex items-center justify-center"><svg class="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div>'}
			</div>
			<div class="flex-1 min-w-0">
				<div class="flex justify-between items-start">
					<div>
						<h3 class="font-semibold text-gray-900">${notif.title}</h3>
						<p class="text-sm text-violet-600 font-medium">${game?.name || 'Unknown Game'}</p>
					</div>
					<div class="flex gap-1">
						${canEdit ? `
						<button onclick="editNotification('${notif.id}')" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
						<button onclick="deleteNotification('${notif.id}')" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
						` : ''}
					</div>
				</div>
				<p class="text-sm text-gray-500 mt-1 line-clamp-2">${notif.description}</p>
			</div>
		</div>
		<div class="px-4 pb-4 flex items-center gap-3">
			<div class="flex-1 flex items-center gap-2 text-xs">
				${timeDisplay}
				${countdown ? `<span class="text-gray-400">${countdown.toLocaleDateString()} ${countdown.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>` : '<span class="text-gray-400 italic">No date set</span>'}
			</div>
			<span class="px-2 py-0.5 rounded-full text-xs font-medium ${notif.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}">${notif.active ? 'Active' : 'Inactive'}</span>
			${isExpired ? '<span class="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Expired</span>' : ''}
		</div>
	</div>`;
}

function UserCard(user: User): string {
  return `
    <div class="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
        <div>
            <h3 class="font-semibold text-gray-900">${user.username}</h3>
             <span class="px-2 py-0.5 text-xs font-medium rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">${user.role}</span>
             <p class="text-xs text-gray-500 mt-1">Access: ${user.allowedStudios.includes('*') ? 'All Studios' : user.allowedStudios.join(', ')}</p>
        </div>
        <div class="flex gap-2">
            <button onclick="editUser('${user.username}')" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
            <button onclick="deleteUser('${user.username}')" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
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
		<div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
			<div class="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
				<h2 class="text-lg font-semibold">${isNew ? 'Add Game' : 'Edit Game'}</h2>
				<button onclick="closeEditor()" class="p-2 hover:bg-gray-200 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
			</div>
			<div class="flex-1 overflow-auto p-6 space-y-4">
				<div class="grid grid-cols-2 gap-4">
					<div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Name *</label><input id="ed-name" value="${game.name}" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"></div>
					<div><label class="block text-sm font-medium text-gray-700 mb-1">Studio *</label><select id="ed-ownedBy" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500">${allowedStudios.map(s => `<option value="${s.name}" ${game.ownedBy === s.name ? 'selected' : ''}>${s.name}</option>`).join('')}</select></div>
					<div><label class="block text-sm font-medium text-gray-700 mb-1">Status</label><select id="ed-status" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"><option value="coming-soon" ${game.status === 'coming-soon' ? 'selected' : ''}>Coming Soon</option><option value="in-development" ${game.status === 'in-development' ? 'selected' : ''}>In Development</option><option value="beta" ${game.status === 'beta' ? 'selected' : ''}>Beta</option><option value="playable" ${game.status === 'playable' ? 'selected' : ''}>Playable</option></select></div>
				</div>
				<div><label class="block text-sm font-medium text-gray-700 mb-1">Genres (comma separated)</label><input id="ed-genres" value="${game.genres.join(', ')}" placeholder="Horror, Mystery, Adventure" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"></div>
				<div><label class="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea id="ed-description" rows="3" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 resize-none">${game.description}</textarea></div>
				<div><label class="block text-sm font-medium text-gray-700 mb-1">Logo / Image</label><div class="flex gap-2"><input id="ed-logo" value="${game.logo}" class="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"><button onclick="openMedia('ed-logo')" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg">📷</button></div></div>
				<div><label class="block text-sm font-medium text-gray-700 mb-1">Thumbnails (comma separated)</label><div class="flex gap-2"><input id="ed-thumbnails" value="${(game.thumbnails || []).join(', ')}" class="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"><button onclick="openMedia('ed-thumbnails',true)" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg">📷</button></div></div>
				<div class="grid grid-cols-2 gap-4">
					<div><label class="block text-sm font-medium text-gray-700 mb-1">YouTube Video ID</label><input id="ed-youtube" value="${game.youtubeVideoId || ''}" placeholder="dQw4w9WgXcQ" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"></div>
					<div><label class="block text-sm font-medium text-gray-700 mb-1">Game Link</label><input id="ed-link" value="${game.link || ''}" placeholder="https://roblox.com/games/..." class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"></div>
				</div>
				<div><label class="block text-sm font-medium text-gray-700 mb-1">Spotify Albums (JSON array)</label><textarea id="ed-spotify" rows="2" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 resize-none font-mono text-sm">${JSON.stringify(game.spotifyAlbums || [])}</textarea><p class="text-xs text-gray-400 mt-1">[{"name":"OST","spotifyId":"abc123"}]</p></div>
			</div>
			<div class="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
				<button onclick="closeEditor()" class="px-4 py-2 hover:bg-gray-100 rounded-lg">Cancel</button>
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
		<div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
			<div class="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
				<h2 class="text-lg font-semibold">${isNew ? 'Add Notification' : 'Edit Notification'}</h2>
				<button onclick="closeNotifEditor()" class="p-2 hover:bg-gray-200 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
			</div>
			<div class="p-6 space-y-4">
				<div><label class="block text-sm font-medium text-gray-700 mb-1">Game *</label><select id="nf-gameId" class="w-full px-3 py-2 border rounded-lg">${allowedGames.map(g => `<option value="${g.id}" ${notif.gameId === g.id ? 'selected' : ''}>${g.name}</option>`).join('')}</select></div>
				<div><label class="block text-sm font-medium text-gray-700 mb-1">Title *</label><input id="nf-title" value="${notif.title}" class="w-full px-3 py-2 border rounded-lg"></div>
				<div><label class="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea id="nf-description" rows="2" class="w-full px-3 py-2 border rounded-lg resize-none">${notif.description}</textarea></div>
				<div><label class="block text-sm font-medium text-gray-700 mb-1">Countdown To *</label><input type="datetime-local" id="nf-countdown" value="${dateValue}" class="w-full px-3 py-2 border rounded-lg"></div>
				<div class="grid grid-cols-2 gap-4">
					<div><label class="block text-sm font-medium text-gray-700 mb-1">YouTube Video ID</label><input id="nf-youtube" value="${notif.youtubeVideoId || ''}" class="w-full px-3 py-2 border rounded-lg"></div>
					<div><label class="block text-sm font-medium text-gray-700 mb-1">Link</label><input id="nf-link" value="${notif.link || ''}" class="w-full px-3 py-2 border rounded-lg"></div>
				</div>
				<label class="flex items-center gap-2"><input type="checkbox" id="nf-active" ${notif.active ? 'checked' : ''} class="w-4 h-4 text-violet-600 rounded"><span class="text-sm font-medium text-gray-700">Active</span></label>
			</div>
			<div class="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
				<button onclick="closeNotifEditor()" class="px-4 py-2 hover:bg-gray-100 rounded-lg">Cancel</button>
				<button onclick="saveNotifData()" class="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">${isNew ? 'Create' : 'Save'}</button>
			</div>
		</div>
	</div>`;
}

function UserEditor(user: User | null): string {
  if (!user) return '';
  const isNew = !users.find(u => u.username === user.username); // Simple check, or check if in 'users' array and password field logic
  // Actually, checking if it came from the add button (empty) or edit.
  // Let's use a flag or assume if password field needs to be shown mandatory.
  const isEdit = users.some(u => u.username === user.username);

  return `
    <div id="user-editor" class="fixed inset-0 z-50 flex items-center justify-center p-4" onclick="if(event.target===this)closeUserEditor()">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div class="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                <h2 class="text-lg font-semibold">${isNew ? 'New User' : 'Edit User: ' + user.username}</h2>
                <button onclick="closeUserEditor()" class="p-2 hover:bg-gray-200 rounded-lg">✕</button>
            </div>
            <div class="p-6 space-y-4">
                ${isNew ? `<div><label class="block text-sm font-medium text-gray-700 mb-1">Username *</label><input id="us-username" class="w-full px-3 py-2 border rounded-lg"></div>` : ''}
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Password ${isNew ? '*' : '(Leave blank to keep)'}</label><input type="password" id="us-password" class="w-full px-3 py-2 border rounded-lg"></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Role</label><select id="us-role" class="w-full px-3 py-2 border rounded-lg"><option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option><option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option></select></div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Allowed Studios</label>
                    <div class="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-lg">
                        <label class="flex items-center gap-2">
                            <input type="checkbox" name="us-studios" value="*" ${user.allowedStudios.includes('*') ? 'checked' : ''} onchange="toggleAllStudios(this)" class="w-4 h-4 text-violet-600 rounded">
                            <span class="text-sm font-medium">All Studios</span>
                        </label>
                        ${studios.map(s => `
                            <label class="flex items-center gap-2 pl-4">
                                <input type="checkbox" name="us-studios" value="${s.name}" ${user.allowedStudios.includes(s.name) || user.allowedStudios.includes('*') ? 'checked' : ''} class="w-4 h-4 text-violet-600 rounded studio-check">
                                <span class="text-sm">${s.name}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                <button onclick="closeUserEditor()" class="px-4 py-2 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onclick="saveUserData()" class="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">Save</button>
            </div>
        </div>
    </div>
    `;
}

function MediaPicker(): string {
  return `
	<div id="media-picker" class="fixed inset-0 z-[60] hidden">
		<div class="absolute inset-0 bg-black/50" onclick="closeMedia()"></div>
		<div class="absolute inset-8 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
			<div class="px-6 py-4 border-b flex justify-between items-center"><h2 class="font-semibold">Select Media</h2><button onclick="closeMedia()" class="p-2 hover:bg-gray-100 rounded-lg">✕</button></div>
			<div class="flex-1 overflow-auto p-6 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
				${mediaFiles.map(f => `<button onclick="pickMedia('${f}')" class="aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-transparent hover:border-violet-500"><img src="${f}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<div class=\\'flex items-center justify-center h-full text-xs text-gray-400 p-2 break-all\\'>${f.split('/').pop()}</div>'"></button>`).join('')}
			</div>
		</div>
	</div>`;
}

function render() {
  const filtered = getFilteredGames();
  const activeNotifs = notifications.filter(n => n.active && new Date(n.countdownTo).getTime() > Date.now());

  let mainContent = '';

  if (currentView === 'games') {
    // Filter studios sidebar based on permissions
    const visibleStudios = studios.filter(s => hasPermission(s.name));

    mainContent = `
			<aside class="w-56 bg-white border-r p-4 hidden lg:block">
				<p class="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">Studios</p>
				<button onclick="setStudio('all')" class="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm ${currentStudio === 'all' ? 'bg-violet-50 text-violet-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}"><span class="w-1.5 h-1.5 rounded-full ${currentStudio === 'all' ? 'bg-violet-500' : 'bg-gray-300'}"></span>All Studios</button>
				${visibleStudios.map(s => `<button onclick="setStudio('${s.id}')" class="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm ${currentStudio === s.id ? 'bg-violet-50 text-violet-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}"><span class="w-1.5 h-1.5 rounded-full ${currentStudio === s.id ? 'bg-violet-500' : 'bg-gray-300'}"></span>${s.name}</button>`).join('')}
			</aside>
			<main class="flex-1 p-6 bg-gray-50 overflow-auto">
				<div class="flex justify-between items-center mb-6">
					<div>
						<h1 class="text-xl font-bold text-gray-900">Games</h1>
						<p class="text-sm text-gray-500">${filtered.length} games</p>
					</div>
					<button onclick="newGame()" class="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>Add Game</button>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">${filtered.map(GameCard).join('')}</div>
			</main>`;
  } else if (currentView === 'notifications') {
    mainContent = `
            <main class="flex-1 p-6 bg-gray-50 overflow-auto">
				<div class="flex justify-between items-center mb-6">
					<div>
						<h1 class="text-xl font-bold text-gray-900">Announcements</h1>
						<p class="text-sm text-gray-500">${notifications.length} total, ${activeNotifs.length} active</p>
					</div>
					<button onclick="newNotification()" class="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>Add Announcement</button>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${notifications.map(NotificationCard).join('')}</div>
			</main>`;
  } else if (currentView === 'users' && currentUser?.role === 'admin') {
    mainContent = `
            <main class="flex-1 p-6 bg-gray-50 overflow-auto">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h1 class="text-xl font-bold text-gray-900">Users</h1>
                        <p class="text-sm text-gray-500">Manage user access</p>
                    </div>
                    <button onclick="newUser()" class="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>Add User</button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${users.map(UserCard).join('')}</div>
            </main>
      `;
  }

  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
	<div class="min-h-screen flex flex-col">
		<header class="bg-white border-b sticky top-0 z-40">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center"><svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg></div>
					<span class="font-semibold text-gray-900 hidden sm:block">AstralCore Panel</span>
				</div>
				<div class="flex items-center gap-2">
					<button onclick="setView('games')" class="px-3 py-1.5 text-sm font-medium rounded-lg ${currentView === 'games' ? 'bg-violet-100 text-violet-700' : 'text-gray-600 hover:bg-gray-100'}">Games</button>
					<button onclick="setView('notifications')" class="px-3 py-1.5 text-sm font-medium rounded-lg relative ${currentView === 'notifications' ? 'bg-violet-100 text-violet-700' : 'text-gray-600 hover:bg-gray-100'}">Announcements${activeNotifs.length > 0 ? `<span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">${activeNotifs.length}</span>` : ''}</button>
                    ${currentUser?.role === 'admin' ?
      `<button onclick="setView('users')" class="px-3 py-1.5 text-sm font-medium rounded-lg ${currentView === 'users' ? 'bg-violet-100 text-violet-700' : 'text-gray-600 hover:bg-gray-100'}">Users</button>`
      : ''}
					<a href="/api/logout" class="ml-2 text-sm text-gray-500 hover:text-gray-700">Sign out</a>
				</div>
			</div>
		</header>
		<div class="flex-1 flex">
			${mainContent}
		</div>
	</div>
	${GameEditor(editingGame)}
	${NotificationEditor(editingNotification)}
    ${UserEditor(editingUser)}
	${MediaPicker()}
	`;
}

// Actions
(window as any).setView = (v: 'games' | 'notifications' | 'users') => { currentView = v; render(); };
(window as any).setStudio = (id: string) => { currentStudio = id; render(); };

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
(window as any).deleteUser = async (username: string) => { if (confirm('Delete this user?')) { await api.del(`/api/users/${username}`); users = users.filter(u => u.username !== username); render(); } };
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

  // Logic for '*' being checked implicitly via logic or explicit
  // If * is checked, we just send ['*'] or we can send all. The backend checks .includes('*')
  // Ideally if * is checked, we just save ['*'], but the UI helper checks all boxes.
  // Let's rely on value. If value '*' is in list, we are good.

  const userData: User = {
    username,
    role,
    allowedStudios: allowedStudios.includes('*') ? ['*'] : allowedStudios,
    password: password || undefined
  };

  try {
    if (isNew) {
      const created = await api.post<User>('/api/users', userData);
      users.push(created);
    } else {
      const updated = await api.put<User>(`/api/users/${username}`, userData);
      const idx = users.findIndex(u => u.username === username);
      if (idx !== -1) users[idx] = updated;
    }
    editingUser = null;
    render();
  } catch (e) {
    alert("Failed to save user: " + (e as any).message);
  }
}

let appendMode = false;
(window as any).openMedia = (targetId: string, append = false) => { mediaPickerTarget = targetId; appendMode = append; document.getElementById('media-picker')?.classList.remove('hidden'); };
(window as any).closeMedia = () => { document.getElementById('media-picker')?.classList.add('hidden'); mediaPickerTarget = null; };
(window as any).pickMedia = (url: string) => { if (mediaPickerTarget) { const el = document.getElementById(mediaPickerTarget) as HTMLInputElement; el.value = appendMode && el.value ? `${el.value}, ${url}` : url; } (window as any).closeMedia(); };

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
      currentUser.role === 'admin' ? api.get<User[]>('/api/users') : Promise.resolve(null)
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
})();

// Panel Dashboard - AstralCore
// This is the authenticated dashboard view

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <!-- Navigation -->
  <nav class="glass border-b border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
            </svg>
          </div>
          <span class="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">AstralCore Panel</span>
        </div>
        <a href="/api/logout" class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
          Sign Out
        </a>
      </div>
    </div>
  </nav>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Welcome Banner -->
    <div class="glass rounded-2xl p-6 mb-8">
      <h1 class="text-2xl font-bold text-white mb-2">Welcome to AstralCore Panel</h1>
      <p class="text-gray-400">Manage your AstralCore services from this dashboard.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="glass rounded-2xl p-6 hover:border-violet-500/30 transition-colors">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          </div>
          <span class="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">Active</span>
        </div>
        <p class="text-3xl font-bold text-white mb-1">1</p>
        <p class="text-gray-400 text-sm">Active Users</p>
      </div>

      <div class="glass rounded-2xl p-6 hover:border-violet-500/30 transition-colors">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
          <span class="text-xs font-medium text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">Running</span>
        </div>
        <p class="text-3xl font-bold text-white mb-1">3</p>
        <p class="text-gray-400 text-sm">Total Projects</p>
      </div>

      <div class="glass rounded-2xl p-6 hover:border-violet-500/30 transition-colors">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
          </div>
          <span class="text-xs font-medium text-violet-400 bg-violet-400/10 px-2 py-1 rounded-full">Latest</span>
        </div>
        <p class="text-3xl font-bold text-white mb-1">12</p>
        <p class="text-gray-400 text-sm">Deployments</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="glass rounded-2xl p-6">
      <h2 class="text-lg font-semibold text-white mb-4">Quick Actions</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button class="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-violet-500/30 transition-all group">
          <svg class="w-6 h-6 text-gray-400 group-hover:text-violet-400 mx-auto mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <span class="text-sm text-gray-300 group-hover:text-white transition-colors">New Project</span>
        </button>
        
        <button class="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-violet-500/30 transition-all group">
          <svg class="w-6 h-6 text-gray-400 group-hover:text-violet-400 mx-auto mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <span class="text-sm text-gray-300 group-hover:text-white transition-colors">Settings</span>
        </button>
        
        <button class="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-violet-500/30 transition-all group">
          <svg class="w-6 h-6 text-gray-400 group-hover:text-violet-400 mx-auto mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <span class="text-sm text-gray-300 group-hover:text-white transition-colors">Analytics</span>
        </button>
        
        <button class="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-violet-500/30 transition-all group">
          <svg class="w-6 h-6 text-gray-400 group-hover:text-violet-400 mx-auto mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
          <span class="text-sm text-gray-300 group-hover:text-white transition-colors">Docs</span>
        </button>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
    <p class="text-gray-500 text-sm">&copy; 2026 AstralCore. All rights reserved.</p>
  </footer>
`;

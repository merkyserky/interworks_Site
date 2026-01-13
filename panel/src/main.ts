import './style.css'

// Panel Dashboard - AstralCore
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="panel-container">
    <header class="panel-header">
      <h1>🌌 AstralCore Panel</h1>
      <p>Admin Dashboard</p>
    </header>
    
    <main class="panel-main">
      <div class="panel-card">
        <h2>Welcome to the Panel</h2>
        <p>This is your admin dashboard for managing AstralCore.</p>
      </div>
      
      <div class="panel-stats">
        <div class="stat-card">
          <span class="stat-value">0</span>
          <span class="stat-label">Active Users</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">0</span>
          <span class="stat-label">Total Projects</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">0</span>
          <span class="stat-label">Deployments</span>
        </div>
      </div>
    </main>
    
    <footer class="panel-footer">
      <p>&copy; 2026 AstralCore. All rights reserved.</p>
    </footer>
  </div>
`

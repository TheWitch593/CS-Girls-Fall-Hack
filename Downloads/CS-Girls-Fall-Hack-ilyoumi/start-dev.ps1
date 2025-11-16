# PowerShell helper to start both backend and frontend in development
# Usage: Right-click -> Run with PowerShell or in terminal: .\start-dev.ps1

# set defaults, can be overridden by environment
$env:PORT = $env:PORT -or "8080"

if (-not $env:DATABASE_URL) {
  Write-Host "WARNING: DATABASE_URL isn't set. The app can start but database-dependent features may fail."
  Write-Host "To use a production DB, set the DATABASE_URL environment variable before running this script."
  Write-Host "Example: $Env:DATABASE_URL = 'postgresql://user:pass@host:5432/dbname'"
}

Write-Host "Installing node modules (this may take a while)..."
npm install

Write-Host "Starting backend + client (Vite) — development mode"
# `npm run dev` sets NODE_ENV=development and runs server with tsx, which uses vite middleware to serve frontend
npm run dev

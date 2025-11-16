# PowerShell helper to start only the client dev server (Vite)
# Usage: .\start-client.ps1

Write-Host "Installing node modules (client only — root package.json includes client tools)"
npm install

Write-Host "Starting Vite dev server"
npm run dev:client

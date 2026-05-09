# 🏙️ CREDORA EXECUTIVE DEPLOYMENT PULSE
# RUN THIS SCRIPT TO BRIDGE YOUR LOCAL VAULT TO THE GITHUB CLOUD

Write-Host "🚀 INITIATING EXECUTIVE CLOUD HANDSHAKE..." -ForegroundColor Cyan

# 1. ENTER THE VAULT
Set-Location "C:\Users\Samyak Hirekhan\Desktop\I  Anitgravity\credora"

# 2. INITIALIZE IDENTITY SECURITY
if (!(Test-Path .git)) {
    Write-Host "🛡️ INITIALIZING NEW GIT SIGNATURE..." -ForegroundColor Green
    git init
}

# 3. BUNDLE THE MASTER RE-BIRTH
git add .
git commit -m "🚀 EXECUTIVE RE-BIRTH: Credora Global Identity Vault Live"

# 4. BRIDGE TO THE PRIVATE HUB
$remoteUrl = "https://github.com/clone18app-cyber/Credora.git"
$remoteExists = git remote
if ($remoteExists -contains "origin") {
    git remote set-url origin $remoteUrl
} else {
    git remote add origin $remoteUrl
}

# 5. GLOBAL DISPATCH
Write-Host "🏙️ DISPATCHING CAPITAL CODE TO GITHUB... (PLEASE LOGIN IF PROMPTED)" -ForegroundColor Yellow
git branch -M main
git push -u origin main -f

Write-Host "✅ EXECUTIVE DISPATCH COMPLETE! YOUR VAULT IS NOW CLOUD-READY." -ForegroundColor Green
pause

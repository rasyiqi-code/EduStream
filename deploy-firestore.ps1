# Firebase Deployment Script
# Run this script in PowerShell: .\deploy-firestore.ps1

Write-Host "`n🚀 EduStream - Firebase Deployment Script`n" -ForegroundColor Cyan

# Check if Firebase CLI is installed
Write-Host "📦 Checking Firebase CLI..." -ForegroundColor Yellow
$firebaseVersion = firebase --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Firebase CLI not found. Installing...`n" -ForegroundColor Red
    npm install -g firebase-tools
    Write-Host "✅ Firebase CLI installed!`n" -ForegroundColor Green
} else {
    Write-Host "✅ Firebase CLI already installed: $firebaseVersion`n" -ForegroundColor Green
}

# Login to Firebase
Write-Host "🔐 Logging in to Firebase..." -ForegroundColor Yellow
Write-Host "   Browser akan terbuka untuk authentication`n" -ForegroundColor Gray

firebase login --no-localhost

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Login failed. Please try manual login:`n" -ForegroundColor Red
    Write-Host "   firebase login`n" -ForegroundColor White
    exit 1
}

Write-Host "✅ Login successful!`n" -ForegroundColor Green

# Deploy Firestore rules
Write-Host "📤 Deploying Firestore rules..." -ForegroundColor Yellow
firebase deploy --only firestore:rules --project studio-6945435693-50081

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Firestore rules deployed successfully!`n" -ForegroundColor Green
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Go to Firebase Console" -ForegroundColor White
    Write-Host "   2. Set your user role to 'admin' or 'instructor'" -ForegroundColor White
    Write-Host "   3. Link: https://console.firebase.google.com/project/studio-6945435693-50081/firestore/data/~2Fusers`n" -ForegroundColor White
} else {
    Write-Host "`n❌ Deployment failed!`n" -ForegroundColor Red
    Write-Host "Try deploying via Firebase Console instead:" -ForegroundColor Yellow
    Write-Host "https://console.firebase.google.com/project/studio-6945435693-50081/firestore/rules`n" -ForegroundColor White
}

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


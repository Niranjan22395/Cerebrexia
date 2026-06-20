# Cerebrexia Google OAuth Setup Script
# This script helps you configure Google OAuth for the application

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Cerebrexia Google OAuth Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
$envFile = "frontend\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "Error: frontend/.env file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Get Your Google OAuth Client ID" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to: https://console.cloud.google.com/" -ForegroundColor White
Write-Host "2. Create a new project or select existing" -ForegroundColor White
Write-Host "3. Go to 'APIs & Services' > 'Credentials'" -ForegroundColor White
Write-Host "4. Click 'Create Credentials' > 'OAuth client ID'" -ForegroundColor White
Write-Host "5. Select 'Web application'" -ForegroundColor White
Write-Host "6. Add authorized JavaScript origins:" -ForegroundColor White
Write-Host "   - http://localhost:5000" -ForegroundColor Gray
Write-Host "   - http://localhost:5173" -ForegroundColor Gray
Write-Host "7. Add authorized redirect URIs:" -ForegroundColor White
Write-Host "   - http://localhost:5000" -ForegroundColor Gray
Write-Host "   - http://localhost:5000/login" -ForegroundColor Gray
Write-Host "8. Click 'Create' and copy the Client ID" -ForegroundColor White
Write-Host ""

# Prompt for Client ID
Write-Host "Enter your Google OAuth Client ID:" -ForegroundColor Green
Write-Host "(It should look like: 123456789-abc...xyz.apps.googleusercontent.com)" -ForegroundColor Gray
$clientId = Read-Host "Client ID"

if ([string]::IsNullOrWhiteSpace($clientId)) {
    Write-Host ""
    Write-Host "No Client ID provided. Exiting..." -ForegroundColor Red
    exit 1
}

# Update .env file
Write-Host ""
Write-Host "Updating frontend/.env file..." -ForegroundColor Yellow

$envContent = Get-Content $envFile
$newContent = $envContent -replace "VITE_GOOGLE_CLIENT_ID=.*", "VITE_GOOGLE_CLIENT_ID=$clientId"
$newContent | Set-Content $envFile

Write-Host "✓ .env file updated successfully!" -ForegroundColor Green
Write-Host ""

# Ask if user wants to rebuild Docker
Write-Host "Do you want to rebuild Docker containers now? (Y/N)" -ForegroundColor Yellow
$rebuild = Read-Host

if ($rebuild -eq "Y" -or $rebuild -eq "y") {
    Write-Host ""
    Write-Host "Rebuilding Docker containers..." -ForegroundColor Yellow
    Write-Host ""
    
    docker-compose down
    docker-compose up --build -d
    
    Write-Host ""
    Write-Host "✓ Docker containers rebuilt successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Google OAuth is now configured!" -ForegroundColor Green
    Write-Host "Visit: http://localhost:5000/login" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Skipping Docker rebuild." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To apply changes, run:" -ForegroundColor White
    Write-Host "  docker-compose up --build -d" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to http://localhost:5000/login" -ForegroundColor White
Write-Host "2. Click 'Sign in with Google'" -ForegroundColor White
Write-Host "3. Complete your profile" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see: GOOGLE_OAUTH_SETUP.md" -ForegroundColor Gray
Write-Host ""

# Made with Bob

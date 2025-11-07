# PWRFlow Notate Diagnostic Tool
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PWRFlow Notate Diagnostic Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Current directory: $PWD" -ForegroundColor Yellow
Write-Host ""

Write-Host "Checking for required files..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

# Check manifest.json
if (Test-Path "manifest.json") {
    Write-Host "[OK] manifest.json exists" -ForegroundColor Green

    # Check if it's valid JSON
    try {
        $manifest = Get-Content "manifest.json" -Raw | ConvertFrom-Json
        Write-Host "[OK] manifest.json is valid JSON" -ForegroundColor Green
        Write-Host "    Extension name: $($manifest.name)" -ForegroundColor Gray
        Write-Host "    Version: $($manifest.version)" -ForegroundColor Gray
    } catch {
        Write-Host "[ERROR] manifest.json is NOT valid JSON" -ForegroundColor Red
        Write-Host "    Error: $_" -ForegroundColor Red
    }
} else {
    Write-Host "[ERROR] manifest.json NOT FOUND" -ForegroundColor Red
    Write-Host ""
    Write-Host "Checking for common issues..." -ForegroundColor Yellow

    if (Test-Path "manifest.json.txt") {
        Write-Host "[FOUND] manifest.json.txt - Hidden .txt extension!" -ForegroundColor Yellow
        Write-Host "[FIX] Renaming file..." -ForegroundColor Yellow
        Rename-Item "manifest.json.txt" "manifest.json"
        Write-Host "[OK] Renamed to manifest.json" -ForegroundColor Green
    }
}

Write-Host ""

# Check other files
$files = @(
    "content\content.js",
    "content\annotations.css",
    "popup\popup.html",
    "popup\popup.js",
    "icons\icon16.png",
    "icons\icon32.png",
    "icons\icon48.png",
    "icons\icon128.png"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "[OK] $file" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] $file NOT FOUND" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Directory contents:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Get-ChildItem | Select-Object Name, Length | Format-Table -AutoSize

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if (Test-Path "manifest.json") {
    Write-Host "✓ All checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To load in Chrome:" -ForegroundColor Yellow
    Write-Host "1. Open Chrome and go to: chrome://extensions/" -ForegroundColor White
    Write-Host "2. Enable 'Developer mode' (top-right)" -ForegroundColor White
    Write-Host "3. Click 'Load unpacked'" -ForegroundColor White
    Write-Host "4. Select THIS folder: $PWD" -ForegroundColor White
} else {
    Write-Host "✗ manifest.json is missing or invalid" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try these fixes:" -ForegroundColor Yellow
    Write-Host "1. Re-download from GitHub" -ForegroundColor White
    Write-Host "2. Make sure you extracted the ZIP fully" -ForegroundColor White
    Write-Host "3. Check Windows file permissions" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to exit"

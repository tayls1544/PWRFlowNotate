@echo off
echo ========================================
echo PWRFlow Notate Diagnostic Tool
echo ========================================
echo.

cd /d "%~dp0"
echo Current directory: %CD%
echo.

echo Checking for required files...
echo ----------------------------------------

if exist "manifest.json" (
    echo [OK] manifest.json exists
    type manifest.json | findstr "manifest_version" >nul
    if errorlevel 1 (
        echo [ERROR] manifest.json is not valid
    ) else (
        echo [OK] manifest.json appears valid
    )
) else (
    echo [ERROR] manifest.json NOT FOUND
    echo.
    echo Checking for common issues...
    if exist "manifest.json.txt" (
        echo [FOUND] manifest.json.txt - You have a .txt extension!
        echo [FIX] Remove the .txt extension
    )
)
echo.

if exist "content\content.js" (
    echo [OK] content\content.js exists
) else (
    echo [ERROR] content\content.js NOT FOUND
)

if exist "popup\popup.html" (
    echo [OK] popup\popup.html exists
) else (
    echo [ERROR] popup\popup.html NOT FOUND
)

if exist "icons\icon128.png" (
    echo [OK] icons\icon128.png exists
) else (
    echo [ERROR] icons\icon128.png NOT FOUND
)

echo.
echo ========================================
echo Directory contents:
echo ========================================
dir /b
echo.

echo ========================================
echo If manifest.json is NOT listed above:
echo 1. The file doesn't exist
echo 2. Download the repo again
echo.
echo If manifest.json.txt is listed:
echo 1. Rename it to remove .txt
echo 2. Or run: rename manifest.json.txt manifest.json
echo ========================================
pause

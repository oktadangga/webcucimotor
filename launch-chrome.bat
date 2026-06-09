@echo off
rem Launch admin.html and pos.html in Google Chrome through the local backend server.
setlocal
set "ROOT=%~dp0"
set "CHROME="

where /q chrome && set "CHROME=chrome"
if not defined CHROME (
    if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
        set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
    )
)
if not defined CHROME (
    if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
        set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
    )
)
if not defined CHROME (
    if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
        set "CHROME=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
    )
)

if not defined CHROME (
    echo.
    echo Google Chrome tidak ditemukan di PATH atau di lokasi standar.
    echo Silakan install Chrome atau tambahkan chrome.exe ke PATH.
    pause
    exit /b 1
)

cd /d "%ROOT%backend"
start "Backend Server" cmd /k "if not exist node_modules (npm install) && npm start"
timeout /t 5 /nobreak >nul
start "" "%CHROME%" "http://localhost:3000/admin.html"
start "" "%CHROME%" "http://localhost:3000/pos.html"
exit /b 0

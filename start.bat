@echo off
title AeroTrack Pro - Flight Tracker
echo ========================================================
echo   Launching AeroTrack Pro Flight Tracker...
echo ========================================================
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause


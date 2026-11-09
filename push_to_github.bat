@echo off
title Push Flight-Tracker to GitHub
echo ========================================================
echo   Pushing Flight-Tracker to GitHub (mink911/Flight-Tracker)
echo ========================================================
echo.
set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%PATH%"

git remote -v
echo.
echo Pushing branch 'main' to origin...
git push -u origin main

echo.
pause


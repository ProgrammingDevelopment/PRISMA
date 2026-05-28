@echo off
title PRISMA Telegram Bot - 24/7
echo ========================================
echo   PRISMA Telegram Bot - Starting...
echo   Press Ctrl+C to stop
echo ========================================
echo.

cd /d "%~dp0.."

set TS_NODE_COMPILER_OPTIONS={"module":"commonjs"}

:loop
echo [%date% %time%] Starting bot...
call npx ts-node scripts/telegram-bot.ts
echo.
echo [%date% %time%] Bot stopped. Restarting in 10 seconds...
timeout /t 10 /nobreak >nul
goto loop

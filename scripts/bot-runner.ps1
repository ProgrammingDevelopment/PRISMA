# Bot Watchdog Runner (bot-runner.ps1)
# Ensures the Telegram Bot stays alive 24/7

$maxRetries = 10
$retryDelay = 5

Write-Host "Starting PRISMA Bot Watchdog..." -ForegroundColor Green

while ($true) {
    Write-Host "Lauching Bot: npm run bot" -ForegroundColor Cyan
    
    # Run the bot process natively, wait for exit
    $botProcess = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "bot" -Wait -PassThru -NoNewWindow
    
    $exitCode = $botProcess.ExitCode
    
    if ($exitCode -eq 0) {
        Write-Host "Bot exited gracefully." -ForegroundColor Yellow
        break
    } else {
        Write-Host "Bot crashed or stopped with code $exitCode! Restarting in $retryDelay seconds..." -ForegroundColor Red
        Start-Sleep -Seconds $retryDelay
    }
}

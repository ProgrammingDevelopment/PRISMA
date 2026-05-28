# PRISMA Telegram Bot - 24/7 Watchdog Runner
# Run this script to keep the bot alive forever with auto-restart on crash

$ErrorActionPreference = "Continue"
$retryDelay = 10        # seconds between restarts
$crashCount = 0
$maxCrashBeforeDelay = 5
$longDelay = 60         # longer delay after repeated crashes

$projectDir = Split-Path -Parent $PSScriptRoot
$logFile = Join-Path $PSScriptRoot "bot-runner.log"

function Write-Log {
    param([string]$Message, [string]$Color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $Message"
    Write-Host $logEntry -ForegroundColor $Color
    Add-Content -Path $logFile -Value $logEntry -ErrorAction SilentlyContinue
}

Write-Log "========================================" "Green"
Write-Log "  PRISMA Bot Watchdog Started" "Green"
Write-Log "  Project: $projectDir" "Cyan"
Write-Log "  Log: $logFile" "Cyan"
Write-Log "  Press Ctrl+C to stop" "Yellow"
Write-Log "========================================" "Green"

while ($true) {
    $crashCount++
    Write-Log "Starting bot (attempt #$crashCount)..." "Cyan"
    
    try {
        # Run bot directly with ts-node
        $env:NODE_ENV = "production"
        $process = Start-Process -FilePath "npx.cmd" `
            -ArgumentList "ts-node", "-O", "`"{`\`"module`\`":`\`"commonjs`\`"}`"", "scripts/telegram-bot.ts" `
            -WorkingDirectory $projectDir `
            -Wait -PassThru -NoNewWindow
        
        $exitCode = $process.ExitCode
        
        if ($exitCode -eq 0) {
            Write-Log "Bot exited gracefully (code 0). Restarting in $retryDelay seconds..." "Yellow"
            $crashCount = 0
        } else {
            Write-Log "Bot crashed with exit code $exitCode!" "Red"
        }
    }
    catch {
        Write-Log "Error starting bot: $_" "Red"
    }

    # Progressive backoff on repeated crashes
    if ($crashCount -ge $maxCrashBeforeDelay) {
        Write-Log "Too many crashes ($crashCount). Waiting $longDelay seconds..." "Red"
        Start-Sleep -Seconds $longDelay
        $crashCount = 0
    } else {
        Write-Log "Restarting in $retryDelay seconds..." "Yellow"
        Start-Sleep -Seconds $retryDelay
    }
}

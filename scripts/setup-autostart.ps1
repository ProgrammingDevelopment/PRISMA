# Setup PRISMA Bot as Windows Task Scheduler task for 24/7 auto-start
# Run this script AS ADMINISTRATOR once to register the scheduled task

$taskName = "PRISMA_Telegram_Bot"
$projectDir = Split-Path -Parent $PSScriptRoot
$batFile = Join-Path $PSScriptRoot "start-bot.bat"

# Remove existing task if any
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# Create task action
$action = New-ScheduledTaskAction `
    -Execute "cmd.exe" `
    -Argument "/c `"$batFile`"" `
    -WorkingDirectory $projectDir

# Trigger: At system startup + at user logon
$trigger1 = New-ScheduledTaskTrigger -AtStartup
$trigger2 = New-ScheduledTaskTrigger -AtLogOn

# Settings: restart on failure, run indefinitely
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 999 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -ExecutionTimeLimit (New-TimeSpan -Days 0) `
    -MultipleInstances IgnoreNew

# Register the task
Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger1, $trigger2 `
    -Settings $settings `
    -Description "PRISMA RT 04 Telegram Bot - 24/7 auto-start" `
    -RunLevel Limited

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Task '$taskName' registered successfully!" -ForegroundColor Green
Write-Host "  Bot will auto-start on boot + login" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "To check status:  Get-ScheduledTask -TaskName '$taskName'" -ForegroundColor Yellow
Write-Host "To remove:        Unregister-ScheduledTask -TaskName '$taskName'" -ForegroundColor Yellow
Write-Host "To start now:     Start-ScheduledTask -TaskName '$taskName'" -ForegroundColor Yellow

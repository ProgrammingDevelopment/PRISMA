# PRISMA AI Backend Runner
Write-Host "🚀 Starting PRISMA AI Platform Backend..." -ForegroundColor Cyan

$VENV_PATH = ".\ai-backend\venv"

# Check if venv exists
if (-not (Test-Path $VENV_PATH)) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv $VENV_PATH
    
    Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
    & "$VENV_PATH\Scripts\python" -m pip install -r .\ai-backend\requirements.txt
}

# Run the server
Write-Host "⚡ Running Uvicorn Server..." -ForegroundColor Green
$env:PYTHONPATH = ".\ai-backend"
& "$VENV_PATH\Scripts\python" -m uvicorn ai-backend.main:app --host 0.0.0.0 --port 8000 --reload

Read-Host "Press Enter to exit..."

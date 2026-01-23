# Deploying the .NET Backend & Next.js Frontend

This guide describes how to deploy the Prisma AI application, which consists of a **Next.js Frontend** and **Two .NET 8/10 Microservices**.

## 1. Prerequisites
- **.NET SDK** (8.0 or later)
- **Node.js** (v18 or later)
- **Docker** (optional, for containerized deployment)
- **Cloud Account** (Azure, AWS, or Vercel for frontend)

---

## 2. Backend Deployment (.NET Microservices)

### Option A: Running as Self-Contained Binaries (Windows/Linux Server)
1. **Publish DecisionService**:
   ```powershell
   cd backend-dotnet/DecisionService
   dotnet publish -c Release -o ./publish
   ```
2. **Publish OptimizationService**:
   ```powershell
   cd ../OptimizationService
   dotnet publish -c Release -o ./publish
   ```
3. **Run**:
   Copy the `publish` folders to your server and run the `.exe` (Windows) or binary (Linux).
   ```powershell
   ./DecisionService.exe --urls "http://0.0.0.0:5038"
   ./OptimizationService.exe --urls "http://0.0.0.0:5263"
   ```

### Option B: Docker Deployment (Recommended)
Create a `Dockerfile` for each service. Example for **DecisionService**:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["DecisionService/DecisionService.csproj", "DecisionService/"]
RUN dotnet restore "DecisionService/DecisionService.csproj"
COPY . .
WORKDIR "/src/DecisionService"
RUN dotnet build "DecisionService.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "DecisionService.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DecisionService.dll"]
```
Build and run:
```bash
docker build -f DecisionService/Dockerfile -t decision-service .
docker run -p 5038:8080 decision-service
```

---

## 3. Frontend Deployment (Next.js)

### Vercel (Easiest)
1. Push your code to GitHub.
2. Import the repo into Vercel.
3. Vercel automatically detects Next.js.
4. **Environment Variables**: Add your backend URLs as env vars if your Next.js app calls them server-side, or ensure the client calls the public IP of your .NET backend.
   - Note: Since the frontend calls the backend from the **browser**, the backend must be accessible publicly (e.g., `https://api.yourdomain.com`).

### Manual Build
1. Build the project:
   ```bash
   npm run build
   ```
2. Start the server:
   ```bash
   npm start
   ```

---

## 4. Connecting Them
1. Ensure your .NET services have **CORS** enabled (already done in `Program.cs` with `AllowAll`).
2. Update `src/Services/aiService.ts` with the **Production URLs** of your deployed .NET services.
   ```typescript
   const DECISION_SERVICE_URL = "https://your-decision-api.com";
   const OPTIMIZATION_SERVICE_URL = "https://your-optimization-api.com";
   ```

## 5. Quick Local Run
1. **Terminal 1 (Decision Service)**:
   ```powershell
   cd backend-dotnet/DecisionService
   dotnet run
   ```
2. **Terminal 2 (Optimization Service)**:
   ```powershell
   cd backend-dotnet/OptimizationService
   dotnet run
   ```
3. **Terminal 3 (Frontend)**:
   ```powershell
   npm run dev
   ```
4. Find the ports in Terminals 1 & 2 (e.g., `5038`, `5263`) and update `src/Services/aiService.ts` if they differ.

---
**Enjoy your AI-powered system!**

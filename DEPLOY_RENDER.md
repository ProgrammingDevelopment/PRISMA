# Deploying Prisma Web App to Render

This guide outlines how to deploy the **Prisma Next.js Frontend** to [Render](https://render.com).

## ⚠️ Important Change
We initially planned a "Static Site" deployment. However, your application contains **Server-Side API Routes** (e.g., `/api/search` which hides your SerpAPI key).
**Static sites cannot host API routes.**
Therefore, you must deploy as a **Web Service** (Node.js). Is it recommended to use the "Starter" plan or higher to ensure reliability, but you can try the "Free" plan (it will sleep after inactivity).

## 1. Prerequisites
- Push code to GitHub.
- Render Account.

## 2. Deploy Frontend (Web Service)

1.  **Log in to Render** and click **New +** -> **Web Service**.
2.  **Connect GitHub**: Select your `prisma` repository.
3.  **Configure Settings**:
    - **Name**: `prisma-app`
    - **Runtime**: `Node`
    - **Build Command**: `npm run build`
    - **Start Command**: `npm start`
4.  **Environment Variables**:
    Add the following variables to connect your frontend to your backends.
    
    | Key | Value Example |
    |-----|---------------|
    | `NEXT_PUBLIC_DECISION_SERVICE_URL` | `https://your-dotnet-decision-service.onrender.com` |
    | `NEXT_PUBLIC_OPTIMIZATION_SERVICE_URL` | `https://your-dotnet-optimization-service.onrender.com` |
    | `NEXT_PUBLIC_CHAT_API_URL` | `https://your-python-chat-service.onrender.com/api/chat` |
    
    *Note: The `/api/search` route uses `SERPAPI_KEY` which is hardcoded in `route.ts`. For better security, you should obtain this from an Env Var too.*

5.  Click **Create Web Service**.

---

## 3. Deploying Backends (Required for AI/Data)

### Python Chat Backend (`api/`)
1. Create New **Web Service**.
2. **Build Command**: `pip install -r api/requirements.txt`
3. **Start Command**: `uvicorn api.index:app --host 0.0.0.0 --port 10000`

### .NET Microservices (`backend-dotnet/`)
1. Create New **Web Service** (Docker Runtime).
2. See `DEPLOYMENT.md` for Dockerfile details.

---

## 4. Final Review
- Ensure your `NEXT_PUBLIC_CHAT_API_URL` points to the *deployed* Python service URL, not `localhost`.
- Ensure your Decision/Optimization URLs point to the *deployed* .NET service URLs.

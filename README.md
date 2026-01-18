# PRISMA - Platform Realisasi Informasi, Sistem Manajemen & Administrasi RT 04

PRISMA is a comprehensive digital platform designed for RT 04, Kelurahan Kemayoran (Kode Wilayah: 31.71.03.1001). It aims to streamline administration, enhance information dissemination, and foster community engagement.

## Tech Stack

*   **Framework**: Next.js 16 (React native)
*   **Styling**: Tailwind CSS v4, Framer Motion (Animations)
*   **Languages**: TypeScript
*   **Database**: Supabase (PostgreSQL) - Integrated for dynamic content.
*   **APIs**: SerpAPI (Google Search, Local, Maps), Custom Internal APIs
*   **Deployment**: Ready for Vercel

## Features

*   **Responsive Web Design**: Optimized for Desktop, Tablet, and Mobile.
*   **Premium Aesthetics**: Modern gradients, smooth animations, and clean typography (Geist/Outfit).
*   **Dark/Light Mode**: Fully supported with persistent theme toggling.
*   **Hero Carousel**: Dynamic featured content slider.
*   **Portfolio Management**: Display community projects and activities (Data fetched from API).
*   **Community Search**: Integrated Google Search, Local Search, and Maps via SerpAPI.
*   **Contact Hub**: Direct integration with WhatsApp API and Email.
*   **Region Information**: Display of official Kode Wilayah.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```


2.  **Start the Go Backend (Optional)**:
    ```bash
    cd backend-go
    go run main.go
    ```
    (Keep this running in a separate terminal. The frontend will try to fetch from `localhost:8080` first).


3.  **Start the Python AI Microservice (RAG Chatbot)**:
    ```bash
    cd backend-python
    # Ensure you have your Google API Key in .env
    pip install -r requirements.txt # Or install manually as per instructions
    python main.py
    ```
    The Chatbot API will run on `http://localhost:8000`.

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

3.  **Build for Production**:
    ```bash
    npm run build
    npm start
    ```

## 🚀 Deployment (Vercel Monorepo)

This project is configured as a Monorepo containing both the Next.js Frontend and Python Backend.

1.  **Repo Structure**:
    *   `/` (Root): Next.js Application.
    *   `/api`: Python Serverless Functions (FastAPI).
    *   `/api/data`: Contains the PDF Knowledge Base.

2.  **Steps to Deploy**:
    *   Push this code to **GitHub**.
    *   Import the project in **Vercel**.
    *   **Environment Variables** (Project Settings):
        *   `GOOGLE_API_KEY`: [Your Gemini API Key]
        *   `NEXT_PUBLIC_SUPABASE_URL`: [Your Supabase URL]
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: [Your Supabase Key]
    *   **Build Settings**:
        *   Framework Preset: `Next.js` (Default)
        *   Build Command: `next build` (Default)
    *   **Deploy**: Vercel will automatically detect the `api/` folder and install Python dependencies.

3.  **Verification**:
    *   Frontend runs on `https://your-project.vercel.app`.
    *   Chatbot API runs on `https://your-project.vercel.app/api/chat`.

## Project Structure

*   `src/app`: App Router pages and API routes.
*   `src/components`: Reusable UI components.
    *   `src/components/ui`: Basic design system elements (Buttons, Cards, Inputs).
    *   `src/components/layout`: Navbar, Footer.
    *   `src/components/home`: Sections for the landing page.
*   `src/lib`: Utility functions and mock data.

## API Integration

The platform integrates with **SerpAPI** using the provided key. The search functionality allows residents to find local information, news, and maps directly from the PRISMA dashboard.

## Security & Performance

*   **SEO**: Optimized metadata, Open Graph tags.
*   **Performance**: Server-Side Rendering (SSR) and Static Site Generation (SSG) for fast load times.
*   **Security**: API routes hide sensitive keys (Server-side execution).

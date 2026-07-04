# TalentArc | Modern AI-Powered Job Board

![TalentArc](https://img.shields.io/badge/Status-Production%20Ready-success)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-blue)

TalentArc is a next-generation, full-stack job board platform designed to seamlessly connect top talent with growing companies. Built with a stunning, highly animated UI, it features a robust Applicant Tracking System (ATS) and an intelligent AI resume parser to automate the hiring workflow for recruiters.

---

## 🌟 Key Features

### For Job Seekers
* **Modern Discoverability:** Beautiful, glassmorphic UI with advanced search filters (by salary, location type, and date posted).
* **1-Click Applications:** Instant application submissions with real-time status tracking across the platform.
* **Profile Management:** Upload resumes (PDF), update skills, and manage personal portfolios seamlessly.
* **Application Tracking:** Dedicated dashboard to monitor the status of every application (Applied, Reviewing, Interviewing, Offered, Hired, Rejected).

### For Employers
* **Kanban ATS Dashboard:** A drag-and-drop Kanban board to manage candidates through custom hiring pipelines.
* **AI Resume Parsing (Gemini):** A powerful BullMQ background worker that automatically reads uploaded PDFs, extracts key skills, and generates an AI fit-score/summary for the recruiter.
* **Company Branding:** Create and manage customized company profiles, complete with verified badges, tech stacks, logos, and banner images.
* **Lifecycle Management:** Post, edit, close, and permanently delete job postings.

---

## 🏗️ Architecture & Tech Stack

### Frontend (Client)
* **Framework:** Next.js (App Router)
* **Styling:** Tailwind CSS + custom glassmorphic utility classes
* **Animations:** Framer Motion
* **State Management:** Zustand
* **Icons:** Lucide React
* **Deployment:** Vercel

### Backend (API & Workers)
* **Server:** Node.js + Express.js (TypeScript)
* **Database:** PostgreSQL (hosted on Neon.tech)
* **ORM:** Prisma
* **Authentication:** JWT (JSON Web Tokens) & bcryptjs
* **Queue System:** BullMQ + Redis (hosted on Upstash)
* **AI Integration:** Google Gemini API (`@google/genai`)
* **Storage:** Cloudinary (for Logos/Banners) & Local FS (for Resumes)
* **Deployment:** Render.com

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
Ensure you have Node.js and a running instance of PostgreSQL and Redis installed on your local machine.

### 2. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/job-portal.git
cd job-portal
```

### 3. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `/backend` directory:
```env
# Database & Queue
DATABASE_URL="postgresql://postgres:password@localhost:5432/jobportal?schema=public"
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your_super_secret_jwt_key_here"
PORT=5000

# Cloudinary (Images)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# AI Integration
GEMINI_API_KEY="your_google_gemini_api_key"
```

Push the database schema and seed test data:
```bash
npx prisma db push
npx prisma db seed
npm run dev
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env.local` file in the `/frontend` directory:
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

Start the development server:
```bash
npm run dev
```

---

## ☁️ Production Deployment

TalentArc is designed for a highly scalable, serverless-friendly cloud architecture. 

### Database & Cache
* **PostgreSQL:** Deploy a managed database on **Neon.tech**.
* **Redis:** Deploy a managed Redis cluster on **Upstash**. Ensure you use the TCP `rediss://` URL with TLS configured (`rejectUnauthorized: false`), NOT the REST API URL.

### Backend (Render)
1. Create a new Web Service on Render connected to the `backend` root directory.
2. Build Command: `npm install && npx prisma generate && npm run build`
3. Start Command: `npm start`
4. Inject all environment variables from your local `.env`.

### Frontend (Vercel)
1. Import the repository into Vercel, pointing to the `frontend` root directory.
2. Set `NEXT_PUBLIC_API_URL` to your live Render backend URL (e.g., `https://your-api.onrender.com/api`).
3. Deploy!

---

## 📜 License
This project is proprietary and built specifically for the TalentArc brand.

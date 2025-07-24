# CodersToday: Online Judge Platform

# Demo
- [Live Website](https://coders-today.vercel.app/)
- [Demo Video](https://www.loom.com/share/979b45c6ae474c6cb9b21cba1f5839b8?sid=7ff39677-ce0c-40bc-9123-6799aed65551)

A modern online coding platform with admin panel, live judging, and a Dockerized compiler microservice.

---

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [Features](#features)
3. [Quick Start](#quick-start)
4. [Environment Setup](#environment-setup)
5. [Deployment](#deployment)
6. [Project Structure](#project-structure)
7. [API Reference](API_REFERENCE.md)
8. [Compiler Service](COMPILER_SERVICE.md)

---

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Lucide React, Vercel
- **Backend:** Node.js, Express, MongoDB, Render
- **Compiler:** Node.js microservice (Dockerized), AWS EC2/ECR

---

## Features
- Modern Monaco code editor
- Live contest clocks, leaderboard, activity feed
- Admin panel for users, problems, contests, submissions
- Secure JWT auth, role-based access
- AI-powered hints, code analysis, debugging
- Environment variable-driven API URLs (no hardcoded links)

---

## Quick Start
```bash
# 1. Clone the repo
 git clone <repo-url>
 cd Online\ Judge

# 2. Install dependencies
 cd server && npm install
 cd ../client && npm install
 cd ../online-compiler && npm install

# 3. Create required folders in online-compiler
 mkdir codes outputs
```

---

## Environment Setup

### Client (.env)
```env
VITE_API_URL=<your-backend-url>/api
```

### Server (.env)
```env
PORT=<PORT_NUMBER>
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-secret
COMPILER_SERVICE_URL=<your-compiler-service-url>/run
# AI API keys as needed
```
> **Note:** Replace the placeholders above with your own deployment endpoints. Do not use real production URLs in public documentation.

---

## Deployment

### Frontend (Vercel)
- Deployed at: https://coders-today.vercel.app/
- Set `VITE_API_URL` to backend Render URL

### Backend (Render)
- Deployed at: <your-backend-url>
- Set all required env vars

### Compiler (AWS EC2/ECR, Docker)
- Dockerized Node.js service
- Deployed at: <your-compiler-service-url>
- See [COMPILER_SERVICE.md](COMPILER_SERVICE.md) for Docker build/run steps

> Note: Only the frontend URL is public. Backend and compiler URLs should be kept private unless intentionally exposed and secured.

---

## Project Structure
```
Online Judge/
├── client/           # React frontend
├── server/           # Node.js backend
├── online-compiler/  # Dockerized compiler microservice
├── README.md
├── API_REFERENCE.md
├── COMPILER_SERVICE.md
```

---

## API Reference & Compiler Service
- See [API_REFERENCE.md](API_REFERENCE.md) for all backend API endpoints.
- See [COMPILER_SERVICE.md](COMPILER_SERVICE.md) for compiler microservice usage, Docker, and security notes.

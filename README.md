# Online Judge Platform 🧑‍💻⚖️

An online judge platform for coding contests and problem solving, built with:

- **Frontend**: React.js (Vite, Tailwind CSS)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT-based Login/Registration

---

## 🚀 Features

- User Registration and Login
- Role-based access (Admin, User)
- Token-based authentication with JWT
- Protected routes
- MongoDB integration
- Fully modular codebase

---

## 📁 Project Structure

Online-Judge-Platform/
├── client/ # Frontend (React + Vite)
├── server/ # Backend (Express + MongoDB)
├── .env # Environment variables (backend)
├── .gitignore
├── package.json # Root-level scripts for dev and install
├── README.md

---

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/suryareddy0907/Online-Judge-Platform.git
cd Online-Judge-Platform
```

2. Install all dependencies
```bash
npm run install-all
```

This installs both frontend and backend dependencies.

3. Start the development servers

```bash
npm run dev
```

This will run both frontend (React/Vite) and backend (Node/Express) concurrently using concurrently.

4. Environment Setup
Create a .env file inside the server/ folder with the following (example):


PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret


Make sure .env is listed in .gitignore to keep secrets safe.

🧪 Useful Scripts
Command	Description
npm run dev	Starts both frontend and backend servers
npm run client	Starts the React frontend only
npm run server	Starts the Node backend only
npm run install-all	Installs all dependencies in both folders



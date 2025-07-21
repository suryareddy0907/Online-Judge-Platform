# Online Judge Platform with Admin Panel

## 🆕 Changelog

### Recent Updates
- **Private Contests & Access Control**:
  - Admins can now create **private** contests and assign specific users who are allowed to view and participate in them. Public contests remain open to all.
- **Enhanced Contest Management**:
  - A visibility toggle (`isPublic`) has been added to the admin panel, allowing contests to be drafted in private and published when ready.
- **Live Contest Clocks & Filtering**:
  - The home page now displays live countdown clocks for active and upcoming contests.
  - The contests page can be filtered by status (Active, Upcoming, Ended).
- **Leaderboard & Activity Feed**:
  - A new leaderboard page ranks users based on their performance.
  - The home page includes a real-time activity feed showing the latest submissions across the platform.
- **Monaco Editor Integration:**
  - The code editor now uses Monaco Editor for a modern, feature-rich coding experience.
- **Custom Input for Code Execution:**
  - Users can provide custom stdin input for their code before running or submitting.
- **Judging Logic & Verdicts:**
  - Submissions are judged against hidden test cases. Verdicts include AC (Accepted), WA (Wrong Answer), RE (Runtime Error), TLE (Time Limit Exceeded), MLE (Memory Limit Exceeded), CE (Compilation Error), Pending.
- **Submission Timeout & Error Handling:**
  - All code execution is limited to 2 seconds to prevent infinite loops. Errors are reported clearly in the UI.
- **Multiline Test Case Formatting:**
  - Test case input/output is displayed with preserved formatting for readability.
- **Submission Management:**
  - Admins can view, filter, and delete submissions. Both admins and users can view submission code and verdicts in a modal.
- **Browser Back Button & Modal UX:**
  - Modals for viewing submissions can be closed with the browser back button or a custom back button for a seamless experience.
- **Dynamic Search Highlighting:**
  - Admin tables highlight matching text in search results for users and problems.
- **Environment Variable-Driven API URLs:**
  - All client API calls use `VITE_API_URL` from the `.env` file for easy deployment and configuration.
- **Public Stats Endpoint:**
  - The `/api/admin/public-stats` endpoint returns home page stats, showing user-specific data if logged in.
- **Improved Error Reporting:**
  - UI now displays clear error messages for network/server issues and backend validation errors.
- **Advanced Contest Controls:**
  - **Public/Private Visibility**: Toggle contests between being visible to everyone or only to specific users.
  - **User Access Lists**: For private contests, admins can manage a list of allowed participants.
- **Live Leaderboard & Activity Feed:**
  - View a platform-wide leaderboard to see top-ranked users.
  - A real-time activity feed on the home page shows recent submissions.

## 🆕 Latest UI/UX and Admin Portal Improvements

### Vibrant UI/UX Redesign
- All main pages (Home, Browse Problems, Contests, My Submissions) now feature a vibrant animated aurora background and Matrix code rain overlay for a modern, immersive coding platform experience.
- Neon/cyberpunk theme applied consistently across all pages, including admin panel, tables, modals, and dropdowns.

### Admin Portal Enhancements
- **Back to Home Button:** A prominent 'Back to Home' button is now available in the admin sidebar for quick navigation.
- **User Management:**
  - Admins can now change user roles and ban/unban users directly from the user management table.
  - Admins cannot ban or change their own role (except edit their own profile).
  - All actions are disabled for the currently logged-in admin for self-protection.
- **Role/Privilege Sync:**
  - When a user is promoted to admin, a page reload will immediately grant admin privileges (no need to log out and log in again).
  - The admin sidebar now displays the actual username and role of the logged-in admin.
- **Dropdown Consistency:**
  - All dropdowns in user, problem, contest, and submission management use a consistent neon/cyberpunk style matching the rest of the UI.
- **Solved Problems Indicator:**
  - In Browse Problems, problems solved by the user are visually indicated with a neon badge.
- **Loading Spinners:**
  - All loading spinners (e.g., Run/Submit buttons) use a prominent, modern white circular animation for clear feedback.

---

# Online Judge Platform with Admin Panel

A comprehensive online coding platform with a powerful admin panel for managing users, problems, submissions, and contests.

## 🚀 Features

### Core Features
- **Modern Code Editor:**
  - Monaco Editor with syntax highlighting, autocompletion, and more.
- **Custom Input for Code Execution:**
  - Users can provide custom stdin for their code.
- **Problem Solving & Judging:**
  - Submit code for problems, judged against hidden test cases with detailed verdicts (AC, WA, RE, TLE, MLE, CE, Pending).
- **Submission Timeout & Error Handling:**
  - 2-second timeout for all code execution, with clear error reporting.
- **Multiline Test Case Display:**
  - Test case input/output is shown with preserved formatting.
- **User Submissions:**
  - Users can view their own submissions, filter by problem/language/verdict, and see code/verdict in a modal.
- **Admin Panel:**
  - User management (view, edit, ban, promote, delete)
  - Problem management (create, edit, delete, publish/draft)
  - Submission management (view, filter, delete, modal view)
  - Contest management (create, edit, delete, schedule)
  - Dynamic search highlighting in admin tables
- **Browser Back Button & Modal UX:**
  - Modals for viewing submissions can be closed with the browser back button or a custom back button.
- **Dynamic Home Page Stats:**
  - Published problems, user's submissions, registered users, and active/upcoming contests.
- **Environment Variable-Driven API URLs:**
  - All client API calls use `VITE_API_URL` for easy deployment.
- **Public Stats Endpoint:**
  - Home page stats are user-specific if logged in, general if not.
- **Improved Error Reporting:**
  - UI displays clear error messages for all network and backend issues.

### Security & Deployment
- JWT-based authentication
- Role-based access control
- Admin middleware protection
- Secure password hashing
- Protected admin routes
- Easy environment configuration for different deployments

## 🤖 AI-Powered Features

- **Smart Hint Generation:**
  - Uses Cohere API to generate concise, actionable hints based on the problem statement and user code.
  - Requires `COHERE_API_KEY` in your server `.env` file.

- **Code Analysis/Feedback:**
  - Uses Cohere API to provide concise, numbered feedback on user code for a given problem.
  - Requires `CODE_ANALYSIS_KEY` in your server `.env` file.

- **Problem Statement Explanation:**
  - Uses Cohere API to restate the problem in simpler, beginner-friendly language (no hints or solutions).
  - Requires `PROBLEM_EXPLAIN_KEY` in your server `.env` file.

- **Time and Space Complexity Analysis:**
  - Uses OpenRouter API (Mistral 7B Instruct model) to analyze the code written in the editor and provide a concise summary (5-10 lines) of its time and space complexity.
  - Requires `BOILERPLATE_KEY` (OpenRouter API key) in your server `.env` file.

- **Code Debugging:**
  - Uses OpenRouter API (Mistral 7B Instruct model) to pinpoint and concisely explain all types of errors (syntax, runtime, logic, performance, semantic/design) in user code, referencing only the problematic lines (no code output).
  - Requires `DEBUG_KEY` (OpenRouter API key) in your server `.env` file.

**Note:**
- All AI features are accessible via dedicated buttons on the problem details page, including the new "Generate Time and Space Complexities" button.
- Each feature requires the corresponding API key to be set in your server `.env` file.
- The backend will return clear error messages if an API key is missing or invalid.

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd online-judge
```

### 2. Install Dependencies

#### Server Dependencies
```bash
cd server
npm install
```

#### Client Dependencies
```bash
cd ../client
npm install
```

#### Online Compiler Dependencies
```bash
cd ../online-compiler
npm install
```

### 3. Create Compiler Directories (Required)

**This is a mandatory step.** Before running the application, you must manually create two folders inside the `online-compiler` directory:

1.  `codes`: This folder temporarily stores the source code files for compilation.
2.  `outputs`: This folder temporarily stores the compiled executables.

After creating them, your `online-compiler` directory should look like this:
```
online-compiler/
├── codes/
├── outputs/
└── ... (other files)
```

### 4. Environment Configuration

#### Server Environment (.env)
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/online-judge
JWT_SECRET=your-super-secret-jwt-key-here
```

#### Client Environment (.env)
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
- For production, set `VITE_API_URL` to your deployed backend URL (e.g., `https://your-backend.com/api`).
- All client API calls will use this variable, so you never need to hardcode URLs.

### 5. Initialize the Default Admin User

Run the admin initialization script to create the default admin user:
```bash
cd server
npm run init-admin
```

This will create a default admin user with:
- **Email**: suryareddy0907@gmail.com
- **Password**: admin123
- **Role**: admin

**⚠️ Important**: Change the default password after first login!

### 6. Start the Application

You must run the three services in separate terminals.

#### Start the Server
```bash
cd server
npm run dev
```

#### Start the Client
```bash
cd ../client
npm run dev
```

#### Start the Online Compiler
```bash
cd ../online-compiler
npm start
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Compiler Service**: http://localhost:5001

## 🏠 Home Page Stats

The home page displays the following dynamic stats:
- **Published Problems:** Total number of published problems.
- **My Submissions:** Total number of submissions made by the currently logged-in user (shows 0 if not logged in).
- **Registered Users:** Total number of users on the platform.
- **Active/Upcoming Contests:** Contests that are currently active or will happen in the future.

## 🔐 Admin Access

### Default Admin Credentials
- **Email**: suryareddy0907@gmail.com
- **Password**: admin123

### Admin Panel Access
1. Login with the admin credentials
2. Click on the "Admin Panel" button in the navigation
3. Access all admin features through the sidebar navigation

## 📁 Project Structure

```
online-judge/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── context/       # React context
│   │   └── routes/        # Route components
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middlewares/      # Custom middlewares
│   ├── utils/            # Utility functions
│   └── package.json
├── online-compiler/        # Code execution microservice
│   ├── codes/              # Stores temporary code files (manual creation required)
│   ├── outputs/            # Stores temporary output files (manual creation required)
│   ├── executeC.js         # Logic to compile and run C code
│   ├── executeCpp.js       # Logic to compile and run C++ code
│   ├── executeJava.js      # Logic to compile and run Java code
│   ├── executePython.js    # Logic to compile and run Python code
│   ├── generateFile.js     # Utility to create temp code files
│   └── index.js            # Express server for code execution
└── README.md
```

## 🔧 API Endpoints

### Admin Endpoints (Protected)
All admin endpoints require admin authentication.

#### Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics

#### User Management
- `GET /api/admin/users` - Get all users with filters
- `PATCH /api/admin/users/:userId/role` - Update user role
- `PATCH /api/admin/users/:userId/ban` - Toggle user ban status
- `PUT /api/admin/users/:userId` - Update user details (username/email)
- `DELETE /api/admin/users/:userId` - Delete user

#### Problem Management
- `GET /api/admin/problems` - Get all problems
- `POST /api/admin/problems` - Create new problem
- `PUT /api/admin/problems/:problemId` - Update problem
- `DELETE /api/admin/problems/:problemId` - Delete problem
- `PATCH /api/admin/problems/:problemId/publish` - Toggle problem publish status

#### Submission Management
- `GET /api/admin/submissions` - Get all submissions
- `GET /api/admin/submissions/:submissionId` - Get submission details
- `POST /api/admin/submissions/:submissionId/rejudge` - Re-judge submission
- `DELETE /api/admin/submissions/:submissionId` - Delete submission

#### Contest Management
- `GET /api/admin/contests` - Get all contests
- `POST /api/admin/contests` - Create new contest
- `PUT /api/admin/contests/:contestId` - Update contest
- `DELETE /api/admin/contests/:contestId` - Delete contest

#### Public Stats Endpoint
- `GET /api/admin/public-stats` - Returns home page stats. Uses optionalAuth middleware to show user-specific data if logged in.

## 🎨 UI Components

The admin panel uses:
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Router** for navigation
- **Custom components** for admin functionality

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Admin middleware protection
- Secure password hashing
- Protected admin routes

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables
2. Install dependencies: `npm install`
3. Start the server: `npm start`

### Online Compiler Deployment
1. Install dependencies: `npm install`
2. Start the service: `npm start`

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service

## 🖥️ Online Compiler Microservice

This project includes a dedicated microservice for secure, isolated code compilation and execution.

### **How It Works**

1. **Frontend**: User writes code and clicks "Run".
2. **Main Backend**: Receives the code via `/api/run`, then forwards it to the compiler microservice.
3. **Compiler Microservice** (`online-compiler/`):
    - Receives code and language.
    - Saves code to a temporary file.
    - Compiles and executes the code (e.g., using `g++` for C++).
    - Captures output or errors (including `stderr` for compilation/runtime errors).
    - Returns the result to the main backend.
4. **Main Backend**: Forwards the output/error to the frontend.
5. **Frontend**: Displays the output or error in the output box.

### **Directory Structure**

```
online-compiler/
├── index.js           # Express server for code execution
├── generateFile.js    # Utility to create temp code files
├── executeCpp.js      # Logic to compile and run C++ code
├── package.json
```
### **Setup Instructions**

1. **Install dependencies:**
   ```bash
   cd online-compiler
   npm install
   ```

2. **Start the compiler microservice:**
   ```bash
   npm start
   ```
   By default, it runs on port `5001`.

3. **Ensure your main backend is running and configured to forward `/api/run` requests to `http://localhost:5001/run`.**

### **Security Note**
- The compiler microservice should **never be exposed to the public internet**.
- Always run it in a secure, isolated environment.

## 🧑‍💻 Code Execution API

### **Frontend Usage Example**

```js
const handleRun = async () => {
  const response = await axios.post('http://localhost:5000/api/run', {
    code: userCode,
    language: 'cpp', // or 'python', etc.
  });
  setOutput(response.data.output);
};
```

### **Backend Route Example**

- **POST `/api/run`**
  - Request body: `{ code: string, language: string }`
  - Response: `{ output: string }` (includes program output or compilation/runtime errors)

## 📝 Error Output Handling

- Compilation and runtime errors are captured and returned in the `output` field.
- The frontend displays only the relevant error messages, filtering out internal file paths for a clean user experience.
- Long error messages wrap and scroll vertically in the output box.

## ⚡ Quick Start (All Services)

```bash
# 1. Start MongoDB (if not already running)
mongod

# 2. Start the compiler microservice
cd online-compiler
npm install
npm start

# 3. Start the backend server
cd ../server
npm install
npm run dev

# 4. Start the frontend
cd ../client
npm install
npm run dev
```

## 🌐 Deployed Application & Demo

- **Deployed Website:** [https://coders-today.vercel.app/](https://coders-today.vercel.app/)
- **Demo Video:** [https://www.loom.com/share/979b45c6ae474c6cb9b21cba1f5839b8?sid=7ff39677-ce0c-40bc-9123-6799aed65551](https://www.loom.com/share/979b45c6ae474c6cb9b21cba1f5839b8?sid=7ff39677-ce0c-40bc-9123-6799aed65551)

## 🚀 Deployment Overview

### Frontend (React)
- **Platform:** Vercel
- **URL:** [https://coders-today.vercel.app/](https://coders-today.vercel.app/)
- **Environment Variable:**
  - `VITE_API_URL` set to the deployed backend URL
- **Deployment Steps:**
  1. Push the `client` directory to GitHub.
  2. Import the repo in Vercel, set the root directory to `client`.
  3. Set environment variables and deploy.

### Backend (Node.js/Express)
- **Platform:** Render
- **URL:** [https://online-judge-platform-6xta.onrender.com](https://online-judge-platform-6xta.onrender.com)
- **Environment Variables:**
  - `PORT`, `MONGO_URI`, `JWT_SECRET`, and all required API keys.
  - `COMPILER_SERVICE_URL` set to the deployed compiler microservice domain
- **Deployment Steps:**
  1. Push the `server` directory to GitHub.
  2. Create a new Web Service on Render, set the root directory to `server`.
  3. Set environment variables and deploy.

### Compiler Microservice (Online Compiler)
- **Platform:** AWS EC2 (Dockerized Node.js service)
- **Domain:** [http://oj-compiler.me:5001](http://oj-compiler.me:5001)
- **Deployment Steps:**
  1. Build and push the Docker image to AWS ECR.
  2. Launch an EC2 instance, install Docker, and run the container exposing port xxxx.
  3. Assign a domain (e.g., `oj-compiler.me`) to the EC2 public IP using an A record in your DNS provider.
  4. Ensure the EC2 security group allows inbound traffic on port xxxx.

---

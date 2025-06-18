# Online Judge Platform with Admin Panel

A comprehensive online coding platform with a powerful admin panel for managing users, problems, submissions, and contests.

## 🚀 Features

### Core Admin Features
1. **User Management**
   - View all registered users (username, email, role, join date)
   - Ban/Delete/Disable users
   - Promote users to admin/moderator
   - Edit user details

2. **Problem Management**
   - Create new problems (title, statement, constraints, tags)
   - Edit existing problems
   - Delete problems
   - Preview problems before publishing
   - Add difficulty level (Easy/Medium/Hard)

3. **Submission Management**
   - View all submissions
   - Filter by problem, user, language, verdict (AC, WA, TLE, etc.)
   - Re-judge specific submissions
   - View submitted code and test results

4. **Contest Management**
   - Create/Edit/Delete contests
   - Set start & end time
   - Add/remove problems to contests
   - Manage participants and visibility

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

### 3. Environment Configuration

#### Server Environment (.env)
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/online-judge
JWT_SECRET=your-super-secret-jwt-key-here
```

#### Client Environment
The client is configured to connect to `http://localhost:5000` by default.

### 4. Initialize the Default Admin User

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

### 5. Start the Application

#### Start the Server
```bash
cd server
npm run dev
```

#### Start the Client
```bash
cd client
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

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

#### Contest Management
- `GET /api/admin/contests` - Get all contests
- `POST /api/admin/contests` - Create new contest
- `PUT /api/admin/contests/:contestId` - Update contest
- `DELETE /api/admin/contests/:contestId` - Delete contest

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

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.



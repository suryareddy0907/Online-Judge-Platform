# API Reference

## Admin Endpoints (Protected)

### Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics

### User Management
- `GET /api/admin/users` - Get all users with filters
- `PATCH /api/admin/users/:userId/role` - Update user role
- `PATCH /api/admin/users/:userId/ban` - Toggle user ban status
- `PUT /api/admin/users/:userId` - Update user details (username/email)
- `DELETE /api/admin/users/:userId` - Delete user

### Problem Management
- `GET /api/admin/problems` - Get all problems
- `POST /api/admin/problems` - Create new problem
- `PUT /api/admin/problems/:problemId` - Update problem
- `DELETE /api/admin/problems/:problemId` - Delete problem
- `PATCH /api/admin/problems/:problemId/publish` - Toggle problem publish status

### Submission Management
- `GET /api/admin/submissions` - Get all submissions
- `GET /api/admin/submissions/:submissionId` - Get submission details
- `POST /api/admin/submissions/:submissionId/rejudge` - Re-judge submission
- `DELETE /api/admin/submissions/:submissionId` - Delete submission

### Contest Management
- `GET /api/admin/contests` - Get all contests
- `POST /api/admin/contests` - Create new contest
- `PUT /api/admin/contests/:contestId` - Update contest
- `DELETE /api/admin/contests/:contestId` - Delete contest

### Public Stats Endpoint
- `GET /api/admin/public-stats` - Returns home page stats. Uses optionalAuth middleware to show user-specific data if logged in.

### Code Execution
- `POST /api/run` - Run user code (forwards to compiler microservice)

---

Add more endpoint details as needed for user, auth, and public APIs. 

If any .env or code example uses real URLs or ports, replace them with placeholders and add a note. 
# Leaderboard and Activity Feed Features

This document describes the leaderboard and activity feed features of the Online Judge platform.

## Features

### 1. Leaderboard / Top Users
- **Ranking logic**: Users are ranked by the number of problems solved.
- **Tie-breaker**: If two users have solved the same number of problems, the user who reached that count earlier is ranked higher.
- **Visual elements**: 
  - Trophy icons for top 3 positions
- **Pagination**: Both global and contest leaderboards support pagination.
- **Search**: Users can search for any username to find their position in the leaderboard.

### 2. Recent Activity Feed
- **Real-time updates**: Activity feed refreshes every 30 seconds
- **Problem solves**: Shows when users solve problems
- **Detailed information**: 
  - Programming language used
  - Problem difficulty
  - Execution time
  - Time ago (just now, 5m ago, 2h ago, etc.)
- **Interactive elements**: Hover effects and refresh button

## Setup Instructions

### 1. Populate Sample Data (Optional)
To test the features with sample data, run these commands in the server directory:

```bash
# Populate leaderboard with sample users
npm run populate-leaderboard

# Populate activity feed with sample submissions
npm run populate-activity
```

### 2. Start the Application
```bash
# Start the server
cd server && npm run dev

# Start the client (in another terminal)
cd client && npm run dev
```

## Usage

### Leaderboard
- Users are ranked by the number of problems solved (higher is better).
- If two users have solved the same number of problems, the one who reached that count first is ranked higher.
- Both global and contest leaderboards have pagination.
- You can search for any user by username to find their position.
- Trophy icons are shown for the top 3 users.

### Activity Feed
- Shows the most recent 15 problem solves
- Automatically refreshes every 30 seconds
- Click "Refresh" to manually update
- Shows programming language, difficulty, and execution time 
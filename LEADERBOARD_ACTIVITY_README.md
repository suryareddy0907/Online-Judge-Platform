# Leaderboard and Activity Feed Features

This document describes the new leaderboard and activity feed features added to the Online Judge platform.

## Features Added

### 1. Leaderboard / Top Users
- **Rating-based ranking**: Users are ranked by their rating (default 1200, increases by 10 for each problem solved)
- **Problems solved ranking**: Alternative sorting by number of problems solved
- **User profiles**: Display username, avatar, country flag, and badges
- **Visual elements**: 
  - Trophy icons for top 3 positions
  - Color-coded ratings (different colors for different rating ranges)
  - Country flags using emoji
  - Badge icons for achievements
  - Gradient avatars for users without profile pictures

### 2. Recent Activity Feed
- **Real-time updates**: Activity feed refreshes every 30 seconds
- **Problem solves**: Shows when users solve problems
- **Detailed information**: 
  - Programming language used
  - Problem difficulty
  - Execution time
  - Time ago (just now, 5m ago, 2h ago, etc.)
- **User avatars**: Shows user profile pictures or generated avatars
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
- Users can view the top 10 users by rating or problems solved
- Click the "Rating" or "Problems" buttons to change sorting
- Hover over badges to see tooltips
- Country flags are displayed next to usernames

### Activity Feed
- Shows the most recent 15 problem solves
- Automatically refreshes every 30 seconds
- Click "Refresh" to manually update
- Shows programming language, difficulty, and execution time

## Badge System

The system supports the following badges:
- `first_solve` - First user to solve a problem
- `speed_solver` - Fast execution times
- `accuracy` - High accuracy rate

## Rating System

- **Default rating**: 1200 for new users
- **Rating increase**: +10 points for each unique problem solved
- **Rating colors**:
  - 2000+: Red (Expert)
  - 1600-1999: Orange (Advanced)
  - 1400-1599: Purple (Intermediate)
  - 1200-1399: Blue (Beginner)
  - <1200: Gray (New) 
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const populateLeaderboard = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing users (except admin)
    await User.deleteMany({ role: { $ne: 'admin' } });
    console.log('Cleared existing users');

    console.log('Leaderboard data populated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating leaderboard:', error);
    process.exit(1);
  }
};

populateLeaderboard(); 
import mongoose from 'mongoose';
import User from '../models/User.js';
import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';
import dotenv from 'dotenv';

dotenv.config();

const populateActivity = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get some users and problems
    const users = await User.find({ role: 'user' }).limit(5);
    const problems = await Problem.find({ isPublished: true }).limit(10);

    if (users.length === 0 || problems.length === 0) {
      console.log('Need users and problems to create activity data');
      return;
    }

    // Clear existing submissions
    await Submission.deleteMany({});
    console.log('Cleared existing submissions');

    const activities = [];
    const now = new Date();

    // Create sample submissions over the last 24 hours
    for (let i = 0; i < 20; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const problem = problems[Math.floor(Math.random() * problems.length)];
      const languages = ['c', 'cpp', 'java', 'python'];
      const language = languages[Math.floor(Math.random() * languages.length)];
      
      // Create timestamp within last 24 hours
      const timestamp = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
      
      const submission = new Submission({
        user: user._id,
        problem: problem._id,
        code: `// Sample code for ${problem.title}`,
        language,
        verdict: 'AC',
        executionTime: Math.floor(Math.random() * 1000) + 50, // 50-1050ms
        memoryUsed: Math.floor(Math.random() * 50) + 10, // 10-60MB
        testCasesPassed: problem.testCases ? problem.testCases.length : 1,
        totalTestCases: problem.testCases ? problem.testCases.length : 1,
        submittedAt: timestamp,
        judgedAt: timestamp
      });

      activities.push(submission);
    }

    // Insert all submissions
    await Submission.insertMany(activities);
    console.log(`Created ${activities.length} sample submissions`);

    console.log('Activity data populated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating activity:', error);
    process.exit(1);
  }
};

populateActivity(); 
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import Contest from "./server/models/Contest.js";
import Problem from "./server/models/Problem.js";

async function syncContestProblems() {
  await mongoose.connect(process.env.MONGO_URI);
  const contests = await Contest.find({});
  for (const contest of contests) {
    for (const problemId of contest.problems) {
      await Problem.updateOne(
        { _id: problemId },
        { $set: { contest: contest._id } }
      );
      console.log(`Updated problem ${problemId} with contest ${contest._id}`);
    }
  }
  console.log("All contest problems updated with contest field!");
  await mongoose.disconnect();
}

syncContestProblems(); 
import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  problem: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Problem', 
    required: true 
  },
  code: { type: String, required: true },
  language: { 
    type: String, 
    enum: ['c', 'cpp', 'java', 'python'],
    required: true 
  },
  verdict: { 
    type: String, 
    enum: ['AC', 'WA', 'TLE', 'MLE', 'RE', 'CE', 'PE', 'Pending'],
    default: 'Pending'
  },
  executionTime: { type: Number }, // in milliseconds
  memoryUsed: { type: Number }, // in MB
  testCasesPassed: { type: Number, default: 0 },
  totalTestCases: { type: Number, default: 0 },
  errorMessage: { type: String },
  submittedAt: { type: Date, default: Date.now },
  judgedAt: { type: Date }
});

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission; 
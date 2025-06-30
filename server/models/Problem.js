import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  statement: { type: String, required: true },
  input: { type: String, default: '' },
  output: { type: String, default: '' },
  constraints: { type: String, required: true },
  tags: [{ type: String }],
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'], 
    default: 'Easy' 
  },
  exampleTestCases: [{
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String, default: '' }
  }],
  timeLimit: { type: Number, default: 1000 }, // in milliseconds
  memoryLimit: { type: Number, default: 256 }, // in MB
  testCases: [{
    input: { type: String, required: true },
    output: { type: String, required: true },
    isHidden: { type: Boolean, default: false }
  }],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  isPublished: { type: Boolean, default: false },
  contest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    default: null
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

problemSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Problem = mongoose.model("Problem", problemSchema);
export default Problem; 
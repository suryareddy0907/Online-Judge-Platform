import mongoose from "mongoose";

const contestSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  problems: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Problem' 
  }],
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  isPublic: { type: Boolean, default: true },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

contestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Contest = mongoose.model("Contest", contestSchema);
export default Contest; 
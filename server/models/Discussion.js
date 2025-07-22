import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  user: { type: String, required: true }, // store username for simplicity
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion', default: null }, // for replies
  edited: { type: Boolean, default: false },
  editedAt: { type: Date },
});

const Discussion = mongoose.model("Discussion", discussionSchema);
export default Discussion; 
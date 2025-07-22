import Discussion from '../models/Discussion.js';
import mongoose from 'mongoose';
import User from '../models/User.js';

export const getDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await Discussion.find({ problemId: id }).sort({ createdAt: -1 });
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch discussion' });
  }
};

export const postComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, parentId } = req.body;
    let user = req.user?.username;
    if (!user && req.user?.userId) {
      // Fallback: fetch username from DB
      const dbUser = await User.findById(req.user.userId).select('username');
      user = dbUser?.username;
    }
    if (!user || !text) return res.status(400).json({ message: 'User and text required' });
    const comment = await Discussion.create({ problemId: id, user, text, parentId: parentId || null });
    res.status(201).json({ comment });
  } catch (err) {
    res.status(500).json({ message: 'Failed to post comment' });
  }
};

export const editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const user = req.user?.username;
    if (!user || !text) return res.status(400).json({ message: 'User and text required' });
    const comment = await Discussion.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user !== user) return res.status(403).json({ message: 'You can only edit your own comments' });
    comment.text = text;
    comment.edited = true;
    comment.editedAt = new Date();
    await comment.save();
    res.json({ comment });
  } catch (err) {
    res.status(500).json({ message: 'Failed to edit comment' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const user = req.user?.username;
    const comment = await Discussion.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user !== user) return res.status(403).json({ message: 'You can only delete your own comments' });
    comment.deleted = true;
    await comment.save();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete comment' });
  }
}; 
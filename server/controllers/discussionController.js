import Discussion from '../models/Discussion.js';
import mongoose from 'mongoose';

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
    const { user, text, parentId } = req.body;
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
    const { user, text } = req.body;
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
    const comment = await Discussion.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    comment.deleted = true;
    await comment.save();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete comment' });
  }
}; 
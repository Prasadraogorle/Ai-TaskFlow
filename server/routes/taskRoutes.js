const express = require('express');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const Task = require('../models/Task');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ✅ GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    console.log('Fetching tasks. userId:', userId);

    if (!userId) {
      return res.status(400).json({ message: 'userId query param is required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format.' });
    }

    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
    console.log('Tasks found:', tasks.length);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
});

// ✅ POST /api/tasks
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, userId, completed, startTime, endTime } = req.body;

    if (!title || !userId) {
      return res.status(400).json({ message: 'Title and userId are required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format.' });
    }

    const isCompleted = String(completed).toLowerCase() === 'true';

    const task = new Task({
      title,
      userId,
      completed: isCompleted,
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,
      createdAt: new Date(),
      completedAt: isCompleted ? new Date() : null,
      imagePath: req.file ? req.file.path : null,
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Failed to create task.' });
  }
});

// ✅ PATCH /api/tasks/:id
router.patch('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID format.' });
    }

    const updates = { ...req.body };

    if (req.file) {
      updates.imagePath = req.file.path;
    }

    if (updates.hasOwnProperty('completed')) {
      const completedVal = String(updates.completed).toLowerCase();
      const isCompleted = completedVal === 'true' || completedVal === '1';

      updates.completed = isCompleted;
      updates.completedAt = isCompleted ? new Date() : null;
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Failed to update task.' });
  }
});

// ✅ DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID format.' });
    }

    const deleted = await Task.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Failed to delete task.' });
  }
});

// ✅ POST /api/tasks/clear-tasks
router.post('/clear-tasks', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format.' });
    }

    await Task.deleteMany({ userId });
    res.json({ message: 'All tasks cleared for user.' });
  } catch (error) {
    console.error('Error clearing tasks:', error);
    res.status(500).json({ message: 'Failed to clear tasks.' });
  }
});

module.exports = router;

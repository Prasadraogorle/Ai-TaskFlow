const Task = require('../models/Task');
const mongoose = require('mongoose');

// ✅ GET all tasks
const getTasks = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'userId query param is required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format.' });
    }

    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ message: 'Failed to fetch tasks.', error: error.message });
  }
};

// ✅ Create task
const createTask = async (req, res) => {
  try {
    const { title, userId, completed, startTime, endTime } = req.body;

    if (!title || !userId) {
      return res.status(400).json({ message: 'Title and userId are required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format.' });
    }

    const task = new Task({
      title,
      userId,
      completed: completed === 'true' || completed === true,
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,
      createdAt: new Date(),
      completedAt: completed === 'true' || completed === true ? new Date() : null,
      imagePath: req.file ? req.file.path : null,
    });

    const savedTask = await task.save();
    return res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({ message: 'Failed to create task.', error: error.message });
  }
};

// ✅ Update task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID format.' });
    }

    const updates = { ...req.body };

    if (req.file) {
      updates.imagePath = req.file.path;
    }

    if (typeof updates.completed !== 'undefined') {
      if (updates.completed === true || updates.completed === 'true') {
        updates.completed = true;
        updates.completedAt = new Date();
      } else {
        updates.completed = false;
        updates.completedAt = null;
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ message: 'Failed to update task.', error: error.message });
  }
};

// ✅ Delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID format.' });
    }

    const deleted = await Task.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    return res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ message: 'Failed to delete task.', error: error.message });
  }
};

// ✅ Clear tasks
const clearTasks = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format.' });
    }

    await Task.deleteMany({ userId });

    return res.json({ message: 'All tasks cleared for user.' });
  } catch (error) {
    console.error('Error clearing tasks:', error);
    return res.status(500).json({ message: 'Failed to clear tasks.', error: error.message });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  clearTasks,
};

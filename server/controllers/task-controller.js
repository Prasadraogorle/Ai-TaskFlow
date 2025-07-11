const Task = require('../models/Task');
const path = require('path');

const getTasks = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'userId query param is required.' });
    }

    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, userId, completed, startTime, endTime } = req.body;

    if (!title || !userId) {
      return res.status(400).json({ message: 'Title and userId are required.' });
    }

    const task = new Task({
      title,
      userId,
      completed: completed === 'true',
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,
      createdAt: new Date(),
      completedAt: completed === 'true' ? new Date() : null,
      imagePath: req.file ? req.file.path : null,
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Failed to create task.' });
  }
};

const updateTask = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (req.file) {
      updates.imagePath = req.file.path;
    }

    if (updates.completed === 'true' || updates.completed === true) {
      updates.completed = true;
      updates.completedAt = new Date();
    } else if (updates.completed === 'false' || updates.completed === false) {
      updates.completed = false;
      updates.completedAt = null;
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Failed to update task.' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Failed to delete task.' });
  }
};

const clearTasks = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required.' });
    }

    await Task.deleteMany({ userId });
    res.json({ message: 'All tasks cleared for user.' });
  } catch (error) {
    console.error('Error clearing tasks:', error);
    res.status(500).json({ message: 'Failed to clear tasks.' });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  clearTasks,
};

const mongoose = require('mongoose');
const Task = require('../models/Task');
const { getDBStatus } = require('../config/db');

// In-memory development store fallback
let devTasks = [];

/**
 * @desc   Get all tasks for the authenticated user
 * @route  GET /api/tasks
 */
const getTasks = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    if (getDBStatus()) {
      const filter = { user: userId };
      if (status === 'completed') filter.completed = true;
      if (status === 'pending') filter.completed = false;

      const tasks = await Task.find(filter).sort({ createdAt: -1 }).lean();
      return res.status(200).json({ success: true, count: tasks.length, data: tasks });
    }

    // In-memory fallback (per-user)
    let results = devTasks.filter((t) => t.user.toString() === userId.toString());
    if (status === 'completed') results = results.filter((t) => t.completed);
    if (status === 'pending') results = results.filter((t) => !t.completed);

    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get a single task by ID for authenticated user
 * @route  GET /api/tasks/:id
 */
const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid task ID format: '${id}'.`
      });
    }

    if (getDBStatus()) {
      // Find task belonging specifically to this user
      const task = await Task.findOne({ _id: id, user: userId }).lean();
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found or access denied.' });
      }
      return res.status(200).json({ success: true, data: task });
    }

    const found = devTasks.find(
      (t) => t._id.toString() === id.toString() && t.user.toString() === userId.toString()
    );
    if (!found) {
      return res.status(404).json({ success: false, message: 'Task not found or access denied.' });
    }
    res.status(200).json({ success: true, data: found });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Create a new task for authenticated user
 * @route  POST /api/tasks
 */
const createTask = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { title, description, dueDate, priority } = req.body;

    // Server-side validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required and cannot be empty.'
      });
    }

    if (title.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: 'Task title cannot exceed 150 characters.'
      });
    }

    if (priority && !['Low', 'Medium', 'High'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Priority must be one of: Low, Medium, High.'
      });
    }

    let parsedDueDate = null;
    if (dueDate) {
      parsedDueDate = new Date(dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid due date format.'
        });
      }
    }

    if (getDBStatus()) {
      const newTask = await Task.create({
        user: userId,
        title: title.trim(),
        description: description ? description.trim() : '',
        dueDate: parsedDueDate,
        priority: priority || 'Medium',
        completed: false
      });

      return res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: newTask
      });
    }

    // In-memory fallback
    const taskInstance = new Task({
      user: userId,
      title: title.trim(),
      description: description ? description.trim() : '',
      dueDate: parsedDueDate,
      priority: priority || 'Medium',
      completed: false
    });

    const docObj = taskInstance.toObject();
    devTasks.unshift(docObj);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: docObj
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update an existing task owned by authenticated user
 * @route  PUT /api/tasks/:id
 */
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { title, description, dueDate, priority, completed } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid task ID format: '${id}'.`
      });
    }

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Task title cannot be empty.'
        });
      }
      if (title.trim().length > 150) {
        return res.status(400).json({
          success: false,
          message: 'Task title cannot exceed 150 characters.'
        });
      }
    }

    if (priority !== undefined && !['Low', 'Medium', 'High'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Priority must be one of: Low, Medium, High.'
      });
    }

    let parsedDueDate;
    if (dueDate !== undefined) {
      if (dueDate === null || dueDate === '') {
        parsedDueDate = null;
      } else {
        parsedDueDate = new Date(dueDate);
        if (isNaN(parsedDueDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid due date format.'
          });
        }
      }
    }

    if (getDBStatus()) {
      const updateData = {};
      if (title !== undefined) updateData.title = title.trim();
      if (description !== undefined) updateData.description = description.trim();
      if (parsedDueDate !== undefined) updateData.dueDate = parsedDueDate;
      if (priority !== undefined) updateData.priority = priority;
      if (completed !== undefined) updateData.completed = Boolean(completed);

      // Secure: Only update if task belongs to req.user._id
      const updatedTask = await Task.findOneAndUpdate(
        { _id: id, user: userId },
        updateData,
        {
          new: true,
          runValidators: true
        }
      );

      if (!updatedTask) {
        return res.status(404).json({
          success: false,
          message: 'Task not found or access denied.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: updatedTask
      });
    }

    // In-memory fallback
    const idx = devTasks.findIndex(
      (t) => t._id.toString() === id.toString() && t.user.toString() === userId.toString()
    );
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Task not found or access denied.' });
    }

    if (title !== undefined) devTasks[idx].title = title.trim();
    if (description !== undefined) devTasks[idx].description = description.trim();
    if (parsedDueDate !== undefined) devTasks[idx].dueDate = parsedDueDate;
    if (priority !== undefined) devTasks[idx].priority = priority;
    if (completed !== undefined) devTasks[idx].completed = Boolean(completed);
    devTasks[idx].updatedAt = new Date();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: devTasks[idx]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Toggle or set task completion status for authenticated user
 * @route  PATCH /api/tasks/:id
 */
const toggleTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid task ID format: '${id}'.`
      });
    }

    if (getDBStatus()) {
      // Secure: Find task only for this user
      const task = await Task.findOne({ _id: id, user: userId }).lean();
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found or access denied.' });
      }

      const newStatus =
        req.body.completed !== undefined ? Boolean(req.body.completed) : !task.completed;

      task.completed = newStatus;
      await task.save();

      return res.status(200).json({
        success: true,
        message: `Task marked as ${task.completed ? 'completed' : 'pending'}.`,
        data: task
      });
    }

    // In-memory fallback
    const idx = devTasks.findIndex(
      (t) => t._id.toString() === id.toString() && t.user.toString() === userId.toString()
    );
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Task not found or access denied.' });
    }

    devTasks[idx].completed =
      req.body.completed !== undefined ? Boolean(req.body.completed) : !devTasks[idx].completed;
    devTasks[idx].updatedAt = new Date();

    res.status(200).json({
      success: true,
      message: `Task marked as ${devTasks[idx].completed ? 'completed' : 'pending'}.`,
      data: devTasks[idx]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete a task owned by authenticated user
 * @route  DELETE /api/tasks/:id
 */
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid task ID format: '${id}'.`
      });
    }

    if (getDBStatus()) {
      // Secure: Only delete if task belongs to user
      const task = await Task.findOneAndDelete({ _id: id, user: userId });
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found or access denied.' });
      }

      return res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
        data: { id: task._id, title: task.title }
      });
    }

    // In-memory fallback
    const idx = devTasks.findIndex(
      (t) => t._id.toString() === id.toString() && t.user.toString() === userId.toString()
    );
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Task not found or access denied.' });
    }

    const removed = devTasks.splice(idx, 1)[0];
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { id: removed._id, title: removed.title }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  toggleTaskStatus,
  deleteTask
};
